
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
  const [viewType, setViewType] = useState<'table' | 'grid'>('grid');

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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800">إدارة قاعدة الطلاب</h2>
            <p className="text-slate-400 font-bold mt-2">عرض وتحديث بيانات الهوية والصفوف والفصول المسجلة</p>
          </div>
          <div className="flex gap-3">
            <button 
                onClick={onUpload}
                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition flex items-center gap-2 font-black text-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                رفع كشف جديد
            </button>
            <button 
                onClick={onClear}
                disabled={students.length === 0}
                className={`px-6 py-3 rounded-2xl transition flex items-center gap-2 font-black text-sm border-2 ${students.length === 0 ? 'border-slate-100 text-slate-300' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                مسح الكل
            </button>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
            <div className="relative flex-grow w-full">
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
            </div>
            
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
                <button 
                    onClick={() => setViewType('grid')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${viewType === 'grid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    شبكة
                </button>
                <button 
                    onClick={() => setViewType('table')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${viewType === 'table' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    جدول
                </button>
            </div>
        </div>

        {filtered.length > 0 ? (
          viewType === 'table' ? (
            /* Table View */
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
                  {filtered.map((s, idx) => (
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
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((s, idx) => (
                    <div key={s.id} className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 hover:shadow-2xl hover:-translate-y-1.5 transition-all group relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-slate-300 text-xs">
                                {idx + 1}
                            </div>
                            <button 
                                onClick={() => onDelete(s.id)}
                                className="text-slate-300 hover:text-red-600 p-2 rounded-2xl hover:bg-white hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors mb-2 min-h-[3rem]">
                                {s.name}
                            </h3>
                            <div className="inline-block">
                                <span className="font-mono text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-2xl text-xs font-black border border-emerald-100 shadow-sm">
                                    {s.id}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">الصف الدراسي</p>
                                    <p className="text-xs font-black text-slate-700">{s.className}</p>
                                </div>
                            </div>
                            <div className="text-left bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">الفصل</p>
                                <p className="text-sm font-black text-amber-700">{s.section}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          )
        ) : (
          <div className="p-20 text-center">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-black text-xl">لا توجد بيانات طلاب مطابقة للبحث</p>
            <p className="text-slate-300 font-bold mt-2">يرجى تعديل البحث أو رفع ملف كشوف جديد</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
