
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { StudentRecord } from '../types';
import { LOGO_URL } from '../constants';
import { formatMinutes, normalizeArabic } from '../utils/calculations';

interface Props {
  data: StudentRecord[];
  onBack: () => void;
}

const StudentReport: React.FC<Props> = ({ data, onBack }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const students = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(r => map.set(r.id, r.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  const filteredStudents = useMemo(() => {
    const term = normalizeArabic(inputValue);
    if (!term) return students.slice(0, 100);
    return students.filter(s => 
      normalizeArabic(s.name).includes(term) || 
      s.id.includes(term)
    );
  }, [students, inputValue]);

  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const studentRecords = useMemo(() => {
    if (!selectedStudentId) return [];
    return data
      .filter(r => r.id === selectedStudentId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15); // تحديد عدد الصفوف لضمان بقائها في صفحة واحدة
  }, [data, selectedStudentId]);

  const studentStats = useMemo(() => {
    if (studentRecords.length === 0) return null;
    const totalDays = data.filter(r => r.id === selectedStudentId).length;
    const lateDays = data.filter(r => r.id === selectedStudentId && r.delayMinutes > 0).length;
    const totalDelayMinutes = data
        .filter(r => r.id === selectedStudentId)
        .reduce((acc, curr) => acc + curr.delayMinutes, 0);

    return { totalDays, lateDays, totalDelayMinutes, studentName: studentRecords[0].name };
  }, [data, selectedStudentId, studentRecords]);

  const handleSelectStudent = (id: string, name: string) => {
    setSelectedStudentId(id);
    setInputValue(name);
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsDropdownOpen(true);
    if (!e.target.value) setSelectedStudentId("");
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue("");
    setSelectedStudentId("");
    setIsDropdownOpen(true);
    inputRef.current?.focus();
  };

  const handlePrint = () => {
    if (!selectedStudentId) return;
    window.print();
  };

  return (
    <div className="space-y-4 print:space-y-0">
      {/* البحث - يختفي عند الطباعة */}
      <div className="no-print bg-white p-6 rounded-3xl border shadow-xl flex flex-wrap items-center justify-between gap-6 relative z-[100]">
        <div className="flex items-center gap-4 flex-grow max-w-2xl">
            <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 rounded-2xl transition-all border border-slate-100 shadow-sm active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            
            <div className="relative flex-grow" ref={dropdownRef}>
                <div className={`flex items-center gap-3 px-5 py-3 border-2 rounded-2xl transition-all shadow-sm ${isDropdownOpen ? 'border-emerald-500 ring-4 ring-emerald-50 bg-white' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                    <input 
                        ref={inputRef}
                        type="text"
                        placeholder="ابحث باسم الطالب أو السجل المدني..."
                        value={inputValue}
                        onFocus={() => setIsDropdownOpen(true)}
                        onChange={handleInputChange}
                        className="bg-transparent border-none outline-none w-full font-bold text-slate-700 text-lg"
                    />
                    {inputValue && (
                        <button onClick={clearSelection} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {isDropdownOpen && (
                    <div className="absolute z-[200] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[350px] overflow-y-auto animate-in fade-in duration-200">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleSelectStudent(s.id, s.name)}
                                    className={`w-full text-right px-6 py-3 hover:bg-emerald-50 border-b border-slate-50 last:border-0 flex justify-between items-center ${selectedStudentId === s.id ? 'bg-emerald-50' : ''}`}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700">{s.name}</span>
                                        <span className="text-[10px] font-mono text-slate-400">{s.id}</span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-10 text-center text-slate-400 text-sm">لا توجد نتائج</div>
                        )}
                    </div>
                )}
            </div>
        </div>

        <button 
            onClick={handlePrint}
            disabled={!selectedStudentId}
            className={`px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 font-black text-sm ${!selectedStudentId ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 active:scale-95'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة التقرير
        </button>
      </div>

      {/* محتوى التقرير - منظم ليكون صفحة واحدة */}
      {!selectedStudentId ? (
        <div className="bg-emerald-50/20 border-2 border-dashed border-emerald-100 rounded-[2.5rem] p-24 text-center">
            <h2 className="text-2xl font-black text-emerald-900 opacity-40">يرجى اختيار طالب لعرض التقرير</h2>
        </div>
      ) : (
        <div className="bg-white p-12 print:p-4 shadow-2xl rounded-[2.5rem] print:rounded-none max-w-[21cm] mx-auto overflow-hidden">
            {/* الترويسة - مصغرة */}
            <div className="flex justify-between items-start mb-8 border-b-4 border-emerald-900 pb-6 print:mb-4 print:pb-4">
                <div className="text-right space-y-1">
                    <h2 className="font-black text-lg text-slate-900">المملكة العربية السعودية</h2>
                    <h3 className="font-bold text-sm text-slate-600">وزارة التعليم</h3>
                    <p className="text-xs font-black bg-emerald-50 text-emerald-800 px-2 py-1 rounded inline-block">مدرسة حمزة بن عبدالمطلب</p>
                </div>
                <div className="text-center">
                    <img src={LOGO_URL} alt="Logo" className="h-20 w-auto print:h-16" />
                </div>
                <div className="text-left space-y-1 text-xs font-bold text-slate-500">
                    <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                    <p className="text-emerald-700">بيان انضباط رسمي</p>
                    <p className="font-mono">{selectedStudentId}</p>
                </div>
            </div>

            {/* بطاقة الطالب - مضغوطة */}
            <div className="bg-slate-900 p-6 rounded-3xl mb-6 print:mb-4 flex justify-between items-center shadow-lg print:shadow-none">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <span className="block text-[10px] text-emerald-500 font-black uppercase tracking-widest opacity-80">اسم الطالب:</span>
                        <span className="text-2xl font-black text-white">{studentStats?.studentName}</span>
                    </div>
                </div>
                <div className="text-left bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest">الهوية الوطنية</span>
                    <span className="text-lg font-black font-mono text-emerald-500 tracking-wider">{selectedStudentId}</span>
                </div>
            </div>

            {/* الإحصائيات - سطر واحد */}
            <div className="grid grid-cols-3 gap-4 mb-8 print:mb-4">
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-center">
                    <span className="block text-[10px] text-slate-400 font-black mb-1 uppercase">إجمالي الحضور</span>
                    <span className="text-3xl font-black text-slate-800">{studentStats?.totalDays}</span>
                </div>
                <div className="p-4 border border-red-50 rounded-2xl bg-red-50/20 text-center">
                    <span className="block text-[10px] text-red-400 font-black mb-1 uppercase">مرات التأخير</span>
                    <span className="text-3xl font-black text-red-700">{studentStats?.lateDays}</span>
                </div>
                <div className="p-4 border border-emerald-50 rounded-2xl bg-emerald-50/20 text-center">
                    <span className="block text-[10px] text-emerald-500 font-black mb-1 uppercase">دقائق التأخير</span>
                    <span className="text-3xl font-black text-emerald-800">{studentStats?.totalDelayMinutes}</span>
                </div>
            </div>

            {/* الجدول - محدود بـ 15 سجل للورقة الواحدة */}
            <div className="mb-8 print:mb-4" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-emerald-600 rounded-full"></span>
                    سجل الانضباط اليومي
                </h3>
                <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-200/50 border-b border-slate-200">
                                <th className="p-3 text-center text-[10px] font-black text-slate-500 uppercase">م</th>
                                <th className="p-3 text-right text-[10px] font-black text-slate-500 uppercase">تاريخ السجل</th>
                                <th className="p-3 text-center text-[10px] font-black text-slate-500 uppercase">وقت الوصول</th>
                                <th className="p-3 text-center text-[10px] font-black text-slate-500 uppercase">الحالة</th>
                                <th className="p-3 text-center text-[10px] font-black text-slate-500 uppercase">المدة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentRecords.map((r, idx) => (
                                <tr key={idx} className={`border-b border-white last:border-0 ${r.delayMinutes > 0 ? "bg-red-50/30" : "bg-emerald-50/5"}`}>
                                    <td className="p-3 text-center text-xs font-black text-slate-300">{idx + 1}</td>
                                    <td className="p-3 text-right text-xs font-black text-slate-800">{r.date}</td>
                                    <td className="p-3 text-center text-xs font-mono text-emerald-700 font-black">{r.arrivalTime}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${r.delayMinutes > 0 ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                                            {r.delayMinutes > 0 ? 'متأخر' : 'منضبط'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center text-xs font-black text-slate-900">
                                        {r.delayMinutes > 0 ? formatMinutes(r.delayMinutes) : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* الإرشاد - يظهر بشكل مبسط في الطباعة */}
            <div className="p-6 border-2 border-emerald-100 rounded-3xl bg-emerald-50/40 text-sm leading-relaxed text-slate-800 mb-8 print:mb-4 print:p-4">
                <p className="font-black text-emerald-900 mb-2">إشادة وتوصية إدارية:</p>
                <p className="text-xs">نهدف من هذا التقرير إلى تعزيز قنوات التواصل لمتابعة انضباط الطالب وضمان حضوره المبكر، لما له من أثر مباشر على التحصيل العلمي والسلوك الانضباطي المقر وزارياً.</p>
            </div>

            {/* التواقيع - مع ضمان بقائها في نفس الصفحة */}
            <div className="mt-12 print:mt-8 flex justify-between items-end px-10 font-black text-slate-800" style={{ pageBreakInside: 'avoid' }}>
                <div className="text-center space-y-12 print:space-y-8">
                    <p className="text-sm underline underline-offset-4">وكيل شؤون الطلاب</p>
                    <p className="text-slate-200 font-normal">............................</p>
                </div>
                
                <div className="text-center opacity-10 rotate-[15deg] grayscale select-none print:opacity-5">
                    <div className="w-28 h-28 border-4 border-double border-slate-600 rounded-full flex items-center justify-center text-slate-800 text-[8px] font-black p-4">
                        <div className="text-center">
                            <p>ختم المدرسة</p>
                            <p className="my-1 border-y border-slate-400 py-1">OFFICIAL</p>
                            <p>حمزة بن عبدالمطلب</p>
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-12 print:space-y-8">
                    <p className="text-sm underline underline-offset-4">مدير المدرسة</p>
                    <p className="text-slate-200 font-normal">............................</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
