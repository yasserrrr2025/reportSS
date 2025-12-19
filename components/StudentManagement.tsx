
import React, { useState, useMemo } from 'react';
import { StudentMetadata } from '../types';
import { normalizeArabic } from '../utils/calculations';

interface Props {
  students: StudentMetadata[];
  onDelete: (id: string) => void;
  onClear: () => void;
  onUpload: () => void;
}

const StudentManagement: React.FC<Props> = ({ students, onDelete, onClear, onUpload }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    const term = normalizeArabic(searchTerm);
    if (!term) return students;
    return students.filter(s => 
      normalizeArabic(s.name).includes(term) || 
      s.id.includes(term) ||
      normalizeArabic(s.className).includes(term) ||
      s.section.toString().includes(term)
    );
  }, [students, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800">إدارة قاعدة الطلاب</h2>
            <p className="text-slate-400 font-bold mt-2">عرض وتحديث بيانات الهوية والصفوف والفصول المسجلة محلياً</p>
          </div>
          <div className="flex gap-3">
            <button 
                onClick={onUpload}
                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition flex items-center gap-2 font-black"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                رفع كشف جديد
            </button>
            <button 
                onClick={onClear}
                disabled={students.length === 0}
                className={`px-6 py-3 rounded-2xl transition flex items-center gap-2 font-black border-2 ${students.length === 0 ? 'border-slate-100 text-slate-300' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                مسح الكل
            </button>
          </div>
        </div>

        <div className="mb-8 relative">
          <input 
            type="text" 
            placeholder="بحث باسم الطالب، رقم الهوية، أو الصف..." 
            className="w-full bg-slate-50 border-2 border-slate-100 p-4 px-12 rounded-2xl text-lg font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-xl border text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {filtered.length} نتيجة
          </div>
        </div>

        <div className="overflow-hidden border border-slate-100 rounded-[2rem]">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 font-black text-slate-500 text-sm">م</th>
                <th className="p-4 font-black text-slate-500 text-sm">الاسم الكامل</th>
                <th className="p-4 font-black text-slate-500 text-sm">رقم الهوية</th>
                <th className="p-4 font-black text-slate-500 text-sm text-center">الصف / الفصل</th>
                <th className="p-4 font-black text-slate-500 text-sm text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? (
                filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 text-xs font-bold text-slate-300">{idx + 1}</td>
                    <td className="p-4">
                      <span className="font-black text-slate-800 text-lg block">{s.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-sm font-bold border border-emerald-100">{s.id}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-600 font-black">{s.className}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="text-amber-600 font-black">فصل {s.section}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => onDelete(s.id)}
                        className="text-slate-300 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        title="حذف الطالب"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 font-black text-xl">لا توجد بيانات طلاب مسجلة</p>
                    <p className="text-slate-300 font-bold mt-2">يرجى رفع ملف كشف الطلاب (Excel) لبدء التخزين</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
