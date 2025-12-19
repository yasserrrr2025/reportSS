
import { StudentRecord } from '../types';

/**
 * وظيفة تطبيع النصوص العربية لجعل البحث أكثر مرونة ودقة
 * تقوم بإزالة التشكيل، توحيد الهمزات، والتاء المربوطة، والياء
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
