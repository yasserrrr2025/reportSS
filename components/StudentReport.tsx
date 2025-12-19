
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

  // قائمة الطلاب المستخرجة من الهيكل المجمع
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

  // استرجاع سجلات الطالب المختار
  const studentRecords = useMemo(() => {
    if (!selectedStudentId || !groupedData[selectedStudentId]) return [];
    return (Object.values(groupedData[selectedStudentId]) as StudentRecord[])
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15); // الحد الأقصى للصفوف لضمان صفحة طباعة واحدة
  }, [groupedData, selectedStudentId]);

  const studentStats = useMemo(() => {
    if (studentRecords.length === 0) return null;
    const allRecords = Object.values(groupedData[selectedStudentId]) as StudentRecord[];
    const totalDays = allRecords.length;
    const lateDays = allRecords.filter(r => r.delayMinutes > 0).length;
    const totalDelayMinutes = allRecords.reduce((acc, curr) => acc + curr.delayMinutes, 0);

    return { 
      totalDays, 
      lateDays, 
      totalDelayMinutes, 
      studentName: allRecords[0].name 
    };
  }, [groupedData, selectedStudentId, studentRecords]);

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
      {/* واجهة البحث - مخفية عند الطباعة */}
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
                        placeholder="ابحث باسم الطالب أو السجل المدني..."
                        value={inputValue}
                        onFocus={() => setIsDropdownOpen(true)}
                        onChange={handleInputChange}
                        className="bg-transparent border-none outline-none w-full font-bold text-slate-700 text-lg"
                    />
                    {inputValue && (
                        <button onClick={() => { setInputValue(""); setSelectedStudentId(""); setIsDropdownOpen(true); }} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {isDropdownOpen && (
                    <div className="absolute z-[200] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[300px] overflow-y-auto">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(s => (
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
                            ))
                        ) : (
                            <div className="p-10 text-center text-slate-400 text-sm">لا توجد نتائج مطابقة</div>
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
            طباعة التقرير الرسمي
        </button>
      </div>

      {/* محتوى التقرير الرسمي - مصمم لمقاس A4 */}
      {!selectedStudentId ? (
        <div className="bg-emerald-50/20 border-2 border-dashed border-emerald-100 rounded-[2.5rem] p-24 text-center">
            <h2 className="text-2xl font-black text-emerald-900 opacity-40 uppercase tracking-widest">بانتظار اختيار الطالب</h2>
        </div>
      ) : (
        <div className="bg-white p-12 print:p-4 shadow-2xl rounded-[2.5rem] print:rounded-none max-w-[21cm] mx-auto overflow-hidden border print:border-none">
            {/* الترويسة */}
            <div className="flex justify-between items-start mb-8 border-b-4 border-emerald-900 pb-6 print:mb-4 print:pb-4">
                <div className="text-right space-y-1">
                    <h2 className="font-black text-lg text-slate-900">المملكة العربية السعودية</h2>
                    <h3 className="font-bold text-sm text-slate-600">وزارة التعليم</h3>
                    <p className="text-xs font-black bg-emerald-50 text-emerald-800 px-2 py-1 rounded inline-block border">مدرسة حمزة بن عبدالمطلب</p>
                </div>
                <div className="text-center">
                    <img src={LOGO_URL} alt="Logo" className="h-20 w-auto print:h-16" />
                </div>
                <div className="text-left space-y-1 text-xs font-bold text-slate-500">
                    <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                    <p className="text-emerald-700">تقرير انضباط الطالب</p>
                    <p className="font-mono text-[10px]">{selectedStudentId}</p>
                </div>
            </div>

            {/* بيانات الطالب */}
            <div className="bg-slate-900 p-6 rounded-3xl mb-6 print:mb-4 flex justify-between items-center border border-slate-800">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <span className="block text-[9px] text-emerald-500 font-black uppercase tracking-widest opacity-80">اسم الطالب:</span>
                        <span className="text-xl font-black text-white">{studentStats?.studentName}</span>
                    </div>
                </div>
                <div className="text-left bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest">السجل المدني</span>
                    <span className="text-lg font-black font-mono text-emerald-500 tracking-wider">{selectedStudentId}</span>
                </div>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-3 gap-4 mb-8 print:mb-4">
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-center">
                    <span className="block text-[9px] text-slate-400 font-black mb-1 uppercase tracking-tighter">إجمالي الحضور</span>
                    <span className="text-3xl font-black text-slate-800">{studentStats?.totalDays}</span>
                </div>
                <div className="p-4 border border-red-50 rounded-2xl bg-red-50/20 text-center">
                    <span className="block text-[9px] text-red-400 font-black mb-1 uppercase tracking-tighter">مرات التأخير</span>
                    <span className="text-3xl font-black text-red-700">{studentStats?.lateDays}</span>
                </div>
                <div className="p-4 border border-emerald-50 rounded-2xl bg-emerald-50/20 text-center">
                    <span className="block text-[9px] text-emerald-500 font-black mb-1 uppercase tracking-tighter">دقائق التأخير</span>
                    <span className="text-3xl font-black text-emerald-800">{studentStats?.totalDelayMinutes}</span>
                </div>
            </div>

            {/* الجدول */}
            <div className="mb-8 print:mb-4" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-md font-black text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-emerald-600 rounded-full"></span>
                    بيان الانضباط اليومي التفصيلي
                </h3>
                <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-200/50 border-b border-slate-200">
                                <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">م</th>
                                <th className="p-3 text-right text-[9px] font-black text-slate-500 uppercase">التاريخ</th>
                                <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">وقت الوصول</th>
                                <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">الحالة</th>
                                <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">المدة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentRecords.map((r, idx) => (
                                <tr key={idx} className={`border-b border-white last:border-0 ${r.delayMinutes > 0 ? "bg-red-50/30" : "bg-emerald-50/5"}`}>
                                    <td className="p-2 text-center text-[10px] font-black text-slate-300">{idx + 1}</td>
                                    <td className="p-2 text-right text-xs font-bold text-slate-800">{r.date}</td>
                                    <td className="p-2 text-center text-xs font-mono text-emerald-700 font-black">{r.arrivalTime}</td>
                                    <td className="p-2 text-center">
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${r.delayMinutes > 0 ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                                            {r.delayMinutes > 0 ? 'متأخر' : 'منضبط'}
                                        </span>
                                    </td>
                                    <td className="p-2 text-center text-xs font-black text-slate-900">
                                        {r.delayMinutes > 0 ? formatMinutes(r.delayMinutes) : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* التوصية */}
            <div className="p-5 border border-emerald-100 rounded-2xl bg-emerald-50/40 text-xs leading-relaxed text-slate-800 mb-8 print:mb-4">
                <p className="font-black text-emerald-900 mb-1">إشادة وتوصية إدارية:</p>
                <p>يهدف هذا التقرير لتعزيز التواصل بين المدرسة والأسرة لمتابعة انضباط الطالب وضمان حضوره المبكر، لما له من أثر إيجابي مباشر على التحصيل العلمي والالتزام بالسلوك المدرسي العام.</p>
            </div>

            {/* التوقيعات */}
            <div className="mt-10 print:mt-6 flex justify-between items-end px-10 font-black text-slate-800" style={{ pageBreakInside: 'avoid' }}>
                <div className="text-center space-y-10 print:space-y-6">
                    <p className="text-xs underline underline-offset-4">وكيل شؤون الطلاب</p>
                    <p className="text-slate-200 font-normal">............................</p>
                </div>
                
                <div className="text-center opacity-10 rotate-12 grayscale select-none print:opacity-5">
                    <div className="w-24 h-24 border-4 border-double border-slate-600 rounded-full flex items-center justify-center text-slate-800 text-[7px] font-black p-4">
                        <div className="text-center">
                            <p>ختم المدرسة الرسمي</p>
                            <p className="my-1 border-y border-slate-400 py-1">CERTIFIED</p>
                            <p>حمزة بن عبدالمطلب</p>
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-10 print:space-y-6">
                    <p className="text-xs underline underline-offset-4">مدير المدرسة</p>
                    <p className="text-slate-200 font-normal">............................</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
