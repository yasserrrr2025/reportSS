
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { GroupedData, StudentRecord } from '../types';
import { LOGO_URL } from '../constants';
import { formatMinutes, normalizeArabic } from '../utils/calculations';

interface Props {
  groupedData: GroupedData;
  onBack: () => void;
}

const StudentReport: React.FC<Props> = ({ groupedData, onBack }) => {
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

  const studentsList = useMemo(() => {
    return Object.keys(groupedData).map(id => {
      const records = Object.values(groupedData[id]) as StudentRecord[];
      const firstRecord = records[0];
      return { id, name: firstRecord?.name || "اسم غير معروف" };
    });
  }, [groupedData]);

  const filteredStudents = useMemo(() => {
    const term = normalizeArabic(inputValue);
    if (!term) return studentsList.slice(0, 100);
    return studentsList.filter(s => 
      normalizeArabic(s.name).includes(term) || 
      s.id.includes(term)
    );
  }, [studentsList, inputValue]);

  const allStudentRecords = useMemo(() => {
    if (!selectedStudentId || !groupedData[selectedStudentId]) return [];
    return (Object.values(groupedData[selectedStudentId]) as StudentRecord[])
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [groupedData, selectedStudentId]);

  const studentStats = useMemo(() => {
    if (allStudentRecords.length === 0) return null;
    const totalDays = allStudentRecords.length;
    const lateDays = allStudentRecords.filter(r => r.delayMinutes > 0).length;
    const totalDelayMinutes = allStudentRecords.reduce((acc, curr) => acc + curr.delayMinutes, 0);

    return { 
      totalDays, 
      lateDays, 
      totalDelayMinutes, 
      studentName: allStudentRecords[0].name 
    };
  }, [allStudentRecords]);

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

  const handlePrint = () => {
    if (!selectedStudentId) return;
    window.print();
  };

  return (
    <div className="space-y-4 print:space-y-0">
      <div className="no-print bg-white p-6 rounded-3xl border shadow-xl flex flex-wrap items-center justify-between gap-6 relative z-[100]">
        <div className="flex items-center gap-4 flex-grow max-w-2xl">
            <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 rounded-2xl transition-all border border-slate-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div className="relative flex-grow" ref={dropdownRef}>
                <div className={`flex items-center gap-3 px-5 py-3 border-2 rounded-2xl transition-all shadow-sm ${isDropdownOpen ? 'border-emerald-500 ring-4 ring-emerald-50 bg-white' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                    <input 
                        ref={inputRef}
                        type="text"
                        placeholder="ابحث باسم الطالب أو السجل..."
                        value={inputValue}
                        onFocus={() => setIsDropdownOpen(true)}
                        onChange={handleInputChange}
                        className="bg-transparent border-none outline-none w-full font-bold text-slate-700 text-lg"
                    />
                </div>
                {isDropdownOpen && (
                    <div className="absolute z-[200] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[300px] overflow-y-auto">
                        {filteredStudents.map(s => (
                            <button
                                key={s.id}
                                onClick={() => handleSelectStudent(s.id, s.name)}
                                className={`w-full text-right px-6 py-3 hover:bg-emerald-50 border-b border-slate-50 last:border-0 flex justify-between items-center ${selectedStudentId === s.id ? 'bg-emerald-50 font-bold' : ''}`}
                            >
                                <div className="flex flex-col">
                                    <span className="text-slate-700">{s.name}</span>
                                    <span className="text-[10px] font-mono text-slate-400">{s.id}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <button 
            onClick={handlePrint}
            disabled={!selectedStudentId}
            className={`px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 font-black text-sm ${!selectedStudentId ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة التقرير الشامل
        </button>
      </div>

      {!selectedStudentId ? (
        <div className="bg-emerald-50/20 border-2 border-dashed border-emerald-100 rounded-[2.5rem] p-24 text-center">
            <h2 className="text-2xl font-black text-emerald-900 opacity-40 uppercase tracking-widest">بانتظار اختيار الطالب</h2>
        </div>
      ) : (
        <div className="bg-white p-10 print:p-0 shadow-2xl rounded-[2.5rem] print:rounded-none max-w-[21cm] mx-auto border print:border-none flex flex-col min-h-screen">
            <div className="flex justify-between items-start mb-6 border-b-4 border-emerald-900 pb-4 print:mb-2 print:pb-2">
                <div className="text-right space-y-1">
                    <h2 className="font-black text-lg text-slate-900">المملكة العربية السعودية</h2>
                    <h3 className="font-bold text-sm text-slate-600">وزارة التعليم</h3>
                    <p className="text-xs font-black bg-emerald-50 text-emerald-800 px-2 py-1 rounded inline-block border">مدرسة حمزة بن عبدالمطلب</p>
                </div>
                <div className="text-center">
                    <img src={LOGO_URL} alt="Logo" className="h-16 w-auto" />
                </div>
                <div className="text-left space-y-1 text-xs font-bold text-slate-500">
                    <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                    <p className="text-emerald-700 font-black">تقرير سجل الانضباط الشامل</p>
                    <p className="font-mono text-[10px]">{selectedStudentId}</p>
                </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl mb-4 print:mb-2 flex justify-between items-center border border-slate-800 print:bg-slate-100 print:border-slate-300">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400 border border-white/10 print:bg-emerald-600 print:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <span className="block text-[8px] text-emerald-500 font-black uppercase tracking-widest opacity-80 print:text-emerald-700">اسم الطالب:</span>
                        <span className="text-lg font-black text-white print:text-slate-900">{studentStats?.studentName}</span>
                    </div>
                </div>
                <div className="text-left bg-white/5 p-2 px-4 rounded-xl border border-white/10 print:bg-transparent print:border-none">
                    <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest print:text-slate-500">السجل المدني</span>
                    <span className="text-md font-black font-mono text-emerald-500 print:text-slate-900">{selectedStudentId}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 print:mb-4">
                <div className="p-3 border border-slate-100 rounded-xl bg-slate-50 text-center print:border-slate-200">
                    <span className="block text-[8px] text-slate-400 font-black mb-1">إجمالي أيام الحضور</span>
                    <span className="text-2xl font-black text-slate-800">{studentStats?.totalDays}</span>
                </div>
                <div className="p-3 border border-red-50 rounded-xl bg-red-50/20 text-center print:border-red-200 print:bg-white">
                    <span className="block text-[8px] text-red-400 font-black mb-1">مرات التأخير</span>
                    <span className="text-2xl font-black text-red-700">{studentStats?.lateDays}</span>
                </div>
                <div className="p-3 border border-emerald-50 rounded-xl bg-emerald-50/20 text-center print:border-emerald-200 print:bg-white">
                    <span className="block text-[8px] text-emerald-500 font-black mb-1">دقائق التأخير</span>
                    <span className="text-2xl font-black text-emerald-800">{studentStats?.totalDelayMinutes}</span>
                </div>
            </div>

            <div className="flex-grow mb-6 print:mb-2">
                <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2 no-print">
                    <span className="w-1 h-4 bg-emerald-600 rounded-full"></span>
                    بيان الانضباط اليومي الكامل
                </h3>
                <table className="w-full border-collapse">
                    <thead className="print:table-header-group">
                        <tr className="bg-slate-200/50 border-b-2 border-slate-300 print:bg-slate-100">
                            <th className="p-2 text-center text-[10px] font-black text-slate-600 border border-slate-300">م</th>
                            <th className="p-2 text-right text-[10px] font-black text-slate-600 border border-slate-300">التاريخ</th>
                            <th className="p-2 text-center text-[10px] font-black text-slate-600 border border-slate-300">وقت الوصول</th>
                            <th className="p-2 text-center text-[10px] font-black text-slate-600 border border-slate-300">الحالة</th>
                            <th className="p-2 text-center text-[10px] font-black text-slate-600 border border-slate-300">مدة التأخير</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allStudentRecords.map((r, idx) => (
                            <tr key={idx} className={`border-b border-slate-200 print:page-break-inside-avoid ${r.delayMinutes > 0 ? "bg-red-50/10 print:bg-transparent" : "bg-white"}`}>
                                <td className="p-2 text-center text-[10px] font-black text-slate-400 border border-slate-200">{idx + 1}</td>
                                <td className="p-2 text-right text-[10px] font-bold text-slate-800 border border-slate-200">{r.date}</td>
                                <td className="p-2 text-center text-[10px] font-mono text-emerald-700 font-black border border-slate-200">{r.arrivalTime}</td>
                                <td className="p-2 text-center border border-slate-200">
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black ${r.delayMinutes > 0 ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                                        {r.delayMinutes > 0 ? 'متأخر' : 'منضبط'}
                                    </span>
                                </td>
                                <td className="p-2 text-center text-[10px] font-black text-slate-900 border border-slate-200">
                                    {r.delayMinutes > 0 ? formatMinutes(r.delayMinutes) : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* الإشادة والتوصية الإدارية */}
            <div className="mt-4 p-5 border-2 border-emerald-100 rounded-2xl bg-emerald-50/30 text-[11px] leading-relaxed text-slate-800 print:page-break-inside-avoid">
                <p className="font-black text-emerald-900 mb-3 border-b border-emerald-200 pb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    الإشادة والتوصية الإدارية:
                </p>
                <div className="space-y-3">
                    <p className="font-bold text-slate-800">"يهدف هذا التقرير لتعزيز التواصل بين المدرسة والأسرة لمتابعة انضباط الطالب وضمان حضوره المبكر، لما له من أثر إيجابي مباشر على التحصيل العلمي والالتزام بالسلوك المدرسي العام."</p>
                    
                    {studentStats && studentStats.lateDays === 0 ? (
                        <p className="font-black text-emerald-700 bg-white/50 p-2 rounded-lg border border-emerald-100">تتقدم إدارة المدرسة بوافر الشكر والتقدير للطالب لالتزامه التام بمواعيد الحضور، ونأمل الاستمرار على هذا النهج المشرف.</p>
                    ) : studentStats && studentStats.lateDays <= 2 ? (
                        <p className="font-black text-amber-700 bg-white/50 p-2 rounded-lg border border-amber-100">نشكر الطالب على انضباطه العام، ونحثه على تلافي حالات التأخير البسيطة لضمان التفوق الدراسي الكامل.</p>
                    ) : (
                        <p className="font-black text-red-700 bg-white/50 p-2 rounded-lg border border-red-100">توصي إدارة المدرسة بضرورة متابعة ولي الأمر لأسباب التأخير المتكررة لضمان استقرار الطالب دراسياً وتجنب الحسم من درجات المواظبة.</p>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-8 flex justify-between items-end px-10 font-black text-slate-800 print:page-break-inside-avoid">
                <div className="text-center space-y-12">
                    <p className="text-xs underline underline-offset-4">وكيل شؤون الطلاب</p>
                    <p className="text-slate-200 font-normal">............................</p>
                </div>
                <div className="text-center opacity-10 rotate-12 select-none grayscale no-print">
                    <div className="w-24 h-24 border-4 border-double border-slate-600 rounded-full flex items-center justify-center text-slate-800 text-[7px] font-black p-4">
                        <div className="text-center">
                            <p>نظام إلكتروني</p>
                            <p className="my-1 border-y border-slate-400 py-1 tracking-tighter">DIGITAL AUDIT</p>
                            <p>معتمد</p>
                        </div>
                    </div>
                </div>
                <div className="text-center space-y-12">
                    <p className="text-xs underline underline-offset-4">مدير المدرسة</p>
                    <p className="text-slate-200 font-normal">............................</p>
                </div>
            </div>
            
            <div className="mt-6 text-center text-[8px] text-slate-400 italic no-print">
                * يتم تقسيم هذا التقرير آلياً عند الطباعة لضمان ظهور كافة السجلات التاريخية للطالب.
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
