
import React, { useState } from 'react';
import { StudentMetadata } from '../types';
import { parseAllSheetsExcel } from '../utils/calculations';

declare const XLSX: any;

interface Props {
  onUpdate: (students: StudentMetadata[]) => void;
  onBack: () => void;
}

const StudentListUpload: React.FC<Props> = ({ onUpdate, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<StudentMetadata[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsProcessing(true);
    let allStudents: StudentMetadata[] = [];

    for (const file of files) {
      try {
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const students = parseAllSheetsExcel(workbook);
          allStudents = [...allStudents, ...students];
        } else {
          console.warn("Unsupported file type for student list:", fileName);
        }
      } catch (err) {
        console.error("Error processing student list:", err);
      }
    }

    setIsProcessing(false);
    if (allStudents.length > 0) {
      setPreviewData(allStudents);
    } else {
      alert("لم يتم التعرف على بيانات الطلاب من الملف. يرجى التأكد من استخدام كشف الطلاب الرسمي (ملف إكسل).");
    }
  };

  const handleSave = () => {
    if (previewData.length > 0) {
      onUpdate(previewData);
      setPreviewData([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border-t-8 border-amber-500">
        <button onClick={onBack} className="mb-6 text-slate-400 hover:text-amber-600 flex items-center gap-2 font-bold transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            رجوع للرئيسية
        </button>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800">تحديث قاعدة بيانات الطلاب</h2>
          <p className="text-slate-500 mt-3 font-bold">ارفع كشوف الأسماء (Excel) لربط الهويات بالصفوف والفصول</p>
        </div>

        {previewData.length === 0 ? (
          <div className={`relative border-4 border-dashed rounded-[3rem] p-16 text-center transition-all ${isProcessing ? 'bg-slate-50 border-slate-200 pointer-events-none' : 'bg-amber-50/30 border-amber-200 hover:border-amber-400 hover:bg-amber-50'}`}>
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              multiple 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <div className="space-y-6">
              <div className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center ${isProcessing ? 'bg-white' : 'bg-white shadow-xl shadow-amber-100'}`}>
                {isProcessing ? (
                  <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <div>
                <span className="text-2xl font-black text-slate-700 block">
                  {isProcessing ? 'جاري قراءة الملفات...' : 'ارفع ملف الإكسل'}
                </span>
                <p className="text-sm text-slate-400 font-bold mt-2">سيتم استخراج بيانات الصفوف والفصول والأسماء تلقائياً بناءً على تنسيق الكشف</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4 bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <div>
                <p className="text-amber-800 font-black">تم العثور على {previewData.length} طالب</p>
                <p className="text-xs text-amber-600 font-bold">يرجى مراجعة البيانات المستخرجة أدناه قبل الحفظ النهائي</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPreviewData([])} className="bg-white text-slate-600 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50">إلغاء</button>
                <button onClick={handleSave} className="bg-amber-600 text-white px-6 py-2 rounded-xl text-sm font-black shadow-lg shadow-amber-200 hover:bg-amber-700">تأكيد وحفظ البيانات</button>
              </div>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto border rounded-2xl">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 sticky top-0 border-b">
                  <tr>
                    <th className="p-3 font-black text-slate-600">رقم الهوية</th>
                    <th className="p-3 font-black text-slate-600">الاسم</th>
                    <th className="p-3 font-black text-slate-600 text-center">الصف / الفصل</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewData.map((s, idx) => (
                    <tr key={s.id + idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono">{s.id}</td>
                      <td className="p-3 font-bold">{s.name}</td>
                      <td className="p-3 text-center text-emerald-600 font-bold">{s.className} - {s.section}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentListUpload;
