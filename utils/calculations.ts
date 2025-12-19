import { StudentRecord, StudentMetadata } from '../types';

declare const XLSX: any;

/**
 * وظيفة تطبيع النصوص العربية لجعل البحث أكثر مرونة ودقة
 */
export const normalizeArabic = (text: string): string => {
  if (!text) return "";
  return text
    // إزالة التشكيل (Vowels/Tashkeel)
    .replace(/[\u064B-\u0652]/g, "")
    // توحيد الهمزات بأنواعها
    .replace(/[أإآ]/g, 'ا')
    // توحيد التاء المربوطة والهاء
    .replace(/ة/g, 'ه')
    // توحيد الياء والألف المقصورة
    .replace(/[ىي]/g, 'ي')
    // إزالة المسافات الزائدة
    .replace(/\s+/g, ' ')
    .trim();
};

export const calculateDelay = (arrivalTime: string, startTime: string): number => {
  if (!arrivalTime || !startTime) return 0;
  const [aH, aM, aS] = arrivalTime.split(':').map(Number);
  const [sH, sM, sS] = startTime.split(':').map(Number);

  const arrivalSeconds = aH * 3600 + aM * 60 + aS;
  const startSeconds = sH * 3600 + sM * 60 + sS;

  const diff = arrivalSeconds - startSeconds;
  return diff > 0 ? Math.floor(diff / 60) : 0;
};

export const formatMinutes = (minutes: number): string => {
  if (minutes <= 0) return "منضبط";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h} س و ${m} د`;
  return `${m} دقيقة`;
};

export const extractDateFromText = (text: string): string | null => {
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[0] : null;
};

export const parseRawText = (text: string, defaultDate: string, startTime: string): StudentRecord[] => {
  const records: StudentRecord[] = [];
  const detectedDate = extractDateFromText(text) || defaultDate;

  const lines = text.split('\n');

  lines.forEach(line => {
    const match = line.match(/(\d{10})\s+([^\d:]+)\s+(\d{2}:\d{2}:\d{2})/);
    
    if (match) {
      const id = match[1].trim();
      let name = match[2].trim();
      const arrivalTime = match[3].trim();

      // تحديث: استبعاد السجلات التي تملك وقت حضور صفري (غائب أو لم يسجل)
      if (arrivalTime === "00:00:00") return;

      name = name
        .replace(/لم يسجل خروج/g, '')
        .replace(/وقت الانصراف/g, '')
        .replace(/سجل المتأخرين/g, '')
        .replace(/الاسم/g, '')
        .replace(/رقم الهوية/g, '')
        .trim();

      if (name.length > 2) {
        records.push({
          id,
          name,
          arrivalTime,
          departureTime: line.includes("لم يسجل") ? "لم يسجل" : "مسجل",
          date: detectedDate,
          delayMinutes: calculateDelay(arrivalTime, startTime)
        });
      }
    }
  });

  return records;
};

/**
 * معالج إكسل كشوف الطلاب المطور
 * 1- استخراج البيانات من جميع الشيتات (All Sheets).
 * 2- استخراج الصف من السطر 5 أو 6.
 * 3- استخراج الفصل من السطر 13 أو 14.
 * 4- عدم تجاهل أي طالب (البدء من السطر 22 مباشرة).
 */
// Fix: Removed duplicate import of StudentMetadata and declaration of XLSX which were causing errors
export const parseAllSheetsExcel = (workbook: any): StudentMetadata[] => {
  const allStudents: StudentMetadata[] = [];
  if (typeof XLSX === 'undefined' || !XLSX.utils) return [];

  workbook.SheetNames.forEach((sheetName: string) => {
    const sheet = workbook.Sheets[sheetName];
    // تحويل البيانات لمصفوفة خام مع الحفاظ على كل الخلايا
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    
    if (data.length < 15) return;

    // 1. استخراج الصف (بحث عن سطر يحتوي على كلمة "الثانوي")
    let currentGrade = "غير محدد";
    const gradeRow = data.slice(0, 10).find(row => row.some(cell => cell?.toString().includes("الثانوي")));
    if (gradeRow) {
      // جلب الخلية التي تحتوي على كلمة "الثانوي" تحديداً
      currentGrade = gradeRow.find(cell => cell?.toString().includes("الثانوي"))?.toString() || currentGrade;
    }

    // 2. استخراج الفصل (بحث عن سطر يحتوي على كلمة "الفصل")
    let currentSection = "غير محدد";
    const sectionRowIdx = data.findIndex(row => row.some(cell => cell?.toString().includes("الفصل")));
    if (sectionRowIdx !== -1) {
      const sRow = data[sectionRowIdx];
      // في نظام نور، رقم الفصل غالباً يكون في خلية بجانب كلمة "الفصل" أو في نفس السطر
      const sectionCell = sRow.find(cell => !isNaN(Number(cell)) && cell !== "");
      currentSection = sectionCell?.toString() || currentSection;
    }

    // تنظيف النصوص
    currentGrade = currentGrade.replace(/الصف|:|/g, "").trim();
    currentSection = currentSection.replace(/الفصل|:|/g, "").trim();

    // 3. تحديد بداية جدول الطلاب (السطر الذي يحتوي على "اسم الطالب")
    const headerRowIdx = data.findIndex(row => row.some(cell => cell?.toString().includes("اسم الطالب")));
    if (headerRowIdx === -1) return;

    const headerRow = data[headerRowIdx];
    const nameColIdx = headerRow.findIndex(c => c?.toString().includes("اسم الطالب"));

    // 4. استخراج الطلاب
    for (let i = headerRowIdx + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[nameColIdx]) continue;

      const studentName = row[nameColIdx]?.toString().trim();
      // استبعاد الترويسات المتكررة أو الأسماء القصيرة جداً
      if (studentName.length < 5 || studentName.includes("اسم الطالب")) continue;

      // البحث عن الهوية (أي خلية في السطر تتكون من 10 أرقام وتبدأ بـ 1 أو 2)
      const studentId = row.find(cell => {
        const val = cell?.toString().replace(/\s/g, "") || "";
        return /^[12]\d{9}$/.test(val);
      })?.toString().replace(/\s/g, "");

      if (studentId) {
        allStudents.push({
          id: studentId,
          name: studentName,
          className: currentGrade,
          section: currentSection
        });
      }
    }
  });

  // إزالة التكرار لضمان دقة القائمة
  return Array.from(new Map(allStudents.map(s => [s.id, s])).values());
};