
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { GroupedData, StudentRecord, StudentMetadata } from '../types';
import { LOGO_URL } from '../constants';
import { formatMinutes, normalizeArabic } from '../utils/calculations';

interface Props {
  groupedData: GroupedData;
  students: StudentMetadata[];
  onBack: () => void;
}

const StudentReport: React.FC<Props> = ({ groupedData, students, onBack }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const studentMap = useMemo(() => {
    return new Map(students.map(s => [s.id, s]));
  }, [students]);

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

  const currentMeta = selectedStudentId ? studentMap.get(selectedStudentId) : null;

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
        <div className="bg-white p-8 print:p-2 shadow-2xl rounded-[2.5rem] print:rounded-none max-w-[21cm] mx-auto border print:border-none flex flex-col min-h-screen">
            {/* Header */}
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

            {/* Student Name Section - Enhanced Clarity */}
            <div className="bg-emerald-900 p-6 rounded-3xl mb-4 print:mb-2 flex justify-between items-center shadow-lg border-2 border-emerald-800 print:bg-slate-100 print:border-slate-400">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white border border-white/20 print:bg-emerald-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <span className="block text-[10px] text-emerald-300 font-black uppercase tracking-widest print:text-emerald-800">اسم الطالب الكامل</span>
                        <span className="text-2xl font-black text-white print:text-black leading-none">{studentStats?.studentName}</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-center bg-white/10 p-3 px-6 rounded-2xl border border-white/10 print:bg-transparent print:border-none">
                        <span className="block text-[9px] text-emerald-200 font-black uppercase tracking-widest print:text-slate-500">الصف / الفصل</span>
                        <span className="text-lg font-black text-amber-400 print:text-slate-900">{currentMeta?.className || "—"} / {currentMeta?.section || "—"}</span>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6 print:mb-2">
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-center print:border-slate-300">
                    <span className="block text-[9px] text-slate-400 font-black mb-1 uppercase">إجمالي الحضور</span>
                    <span className="text-3xl font-black text-slate-800 leading-none">{studentStats?.totalDays}</span>
                </div>
                <div className="p-4 border border-red-100 rounded-2xl bg-red-50 text-center print:border-red-300 print:bg-white">
                    <span className="block text-[9px] text-red-500 font-black mb-1 uppercase">مرات التأخير</span>
                    <span className="text-3xl font-black text-red-700 leading-none">{studentStats?.lateDays}</span>
                </div>
                <div className="p-4 border border-emerald-100 rounded-2xl bg-emerald-50 text-center print:border-emerald-300 print:bg-white">
                    <span className="block text-[9px] text-emerald-600 font-black mb-1 uppercase">إجمالي الدقائق</span>
                    <span className="text-3xl font-black text-emerald-800 leading-none">{studentStats?.totalDelayMinutes}</span>
                </div>
            </div>

            {/* Detailed Table - Optimized for Single Page */}
            <div className="flex-grow overflow-hidden print:overflow-visible">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-emerald-900 text-white print:bg-slate-200 print:text-black border-2 border-emerald-900 print:border-slate-400">
                            <th className="p-2 text-center text-[10px] font-black border-l border-white/20 print:border-slate-400">م</th>
                            <th className="p-2 text-right text-[10px] font-black border-l border-white/20 print:border-slate-400">تاريخ التأخر</th>
                            <th className="p-2 text-center text-[10px] font-black border-l border-white/20 print:border-slate-400">وقت الوصول</th>
                            <th className="p-2 text-center text-[10px] font-black border-l border-white/20 print:border-slate-400">الحالة</th>
                            <th className="p-2 text-center text-[10px] font-black print:border-slate-400">مدة التأخير</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allStudentRecords.slice(0, 20).map((r, idx) => (
                            <tr key={idx} className={`border-b-2 border-slate-100 print:border-slate-300 ${r.delayMinutes > 0 ? "bg-red-50/30 print:bg-transparent" : "bg-white"}`}>
                                <td className="p-2 text-center text-[11px] font-black text-slate-400 border-r-2 border-slate-100 print:border-slate-300">{idx + 1}</td>
                                <td className="p-2 text-right text-[11px] font-bold text-slate-800 border-r-2 border-slate-100 print:border-slate-300">{r.date}</td>
                                <td className="p-2 text-center text-[11px] font-mono font-black text-slate-700 border-r-2 border-slate-100 print:border-slate-300">{r.arrivalTime}</td>
                                <td className="p-2 text-center border-r-2 border-slate-100 print:border-slate-300">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${r.delayMinutes > 0 ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                        {r.delayMinutes > 0 ? 'تأخير' : 'منضبط'}
                                    </span>
                                </td>
                                <td className="p-2 text-center text-[11px] font-black text-slate-900">
                                    {r.delayMinutes > 0 ? `${r.delayMinutes} دقيقة` : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allStudentRecords.length > 20 && (
                    <p className="text-center py-4 text-xs font-bold text-slate-400 no-print italic">... يتم عرض آخر ٢٠ سجلاً فقط في هذا التقرير لضمان الطباعة المثالية ...</p>
                )}
            </div>

            {/* Signatures */}
            <div className="mt-8 pt-8 flex justify-between items-end px-12 font-black text-slate-800 border-t-2 border-slate-100 print:mt-4 print:pt-4">
                <div className="text-center space-y-12 print:space-y-8">
                    <p className="text-xs underline underline-offset-8">وكيل شؤون الطلاب</p>
                    <p className="text-slate-300 font-normal">..........................................</p>
                </div>
                <div className="text-center opacity-5 rotate-12 select-none grayscale no-print">
                    <div className="w-24 h-24 border-4 border-double border-slate-900 rounded-full flex items-center justify-center text-[8pt]">
                        ختم المدرسة
                    </div>
                </div>
                <div className="text-center space-y-12 print:space-y-8">
                    <p className="text-xs underline underline-offset-8">مدير المدرسة</p>
                    <p className="text-slate-300 font-normal">..........................................</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
