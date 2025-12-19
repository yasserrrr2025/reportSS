
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
    if (!term) return studentsList.slice(0, 50);
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

  const handlePrint = () => {
    if (!selectedStudentId) return;
    window.print();
  };

  const currentMeta = selectedStudentId ? studentMap.get(selectedStudentId) : null;

  return (
    <div className="space-y-4 print:space-y-0">
      {/* واجهة اختيار الطالب (مخفية في الطباعة) */}
      <div className="no-print bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-6 relative z-50">
        <div className="flex items-center gap-4 flex-grow max-w-2xl">
            <button onClick={onBack} className="p-2 text-slate-400 hover:text-emerald-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div className="relative flex-grow" ref={dropdownRef}>
                <input 
                    type="text"
                    placeholder="ابحث باسم الطالب أو السجل..."
                    value={inputValue}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => { setInputValue(e.target.value); setIsDropdownOpen(true); }}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:border-emerald-500 outline-none font-bold"
                />
                {isDropdownOpen && filteredStudents.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                        {filteredStudents.map(s => (
                            <button
                                key={s.id}
                                onClick={() => handleSelectStudent(s.id, s.name)}
                                className="w-full text-right px-4 py-2 hover:bg-emerald-50 border-b last:border-0"
                            >
                                <p className="font-bold text-slate-800">{s.name}</p>
                                <p className="text-[10px] text-slate-400">{s.id}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <button 
            onClick={handlePrint}
            disabled={!selectedStudentId}
            className={`px-8 py-2 rounded-xl shadow transition font-black ${!selectedStudentId ? 'bg-slate-100 text-slate-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
            طباعة التقرير
        </button>
      </div>

      {selectedStudentId && (
        <div className="bg-white p-8 print:p-2 shadow rounded-2xl print:rounded-none max-w-[21cm] mx-auto border print:border-none min-h-[28cm] flex flex-col">
            {/* الترويسة الرسمية للتقرير */}
            <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4 print:mb-2 print:pb-2" style={{ fontSize: '8pt' }}>
                <div className="font-bold space-y-0.5">
                    <p>المملكة العربية السعودية</p>
                    <p>وزارة التعليم</p>
                    <p>مدرسة حمزة بن عبدالمطلب</p>
                </div>
                <div className="text-center">
                    <img src={LOGO_URL} alt="Logo" className="h-14 mx-auto mb-1" />
                    <h2 className="text-lg font-black underline" style={{ fontSize: '12pt' }}>سجل الانضباط الشامل للطالب</h2>
                </div>
                <div className="text-left font-bold space-y-0.5">
                    <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                    <p>رقم السجل: {selectedStudentId}</p>
                </div>
            </div>

            {/* بيانات الطالب - تحسين الوضوح (اسم أسود عريض) */}
            <div className="bg-gray-50 border-2 border-black p-4 mb-4 flex justify-between items-center print:p-2 print:mb-2">
                <div>
                    <span className="block text-[8pt] text-gray-500 font-bold mb-1">اسم الطالب رباعي:</span>
                    <span className="text-xl font-black text-black leading-none" style={{ fontSize: '16pt' }}>{studentStats?.studentName}</span>
                </div>
                <div className="text-left">
                    <span className="block text-[8pt] text-gray-500 font-bold mb-1">الصف / الفصل الدراسي:</span>
                    <span className="text-lg font-black text-black">{currentMeta?.className || "—"} / {currentMeta?.section || "—"}</span>
                </div>
            </div>

            {/* ملخص الإحصائيات */}
            <div className="grid grid-cols-3 gap-2 mb-4 print:mb-2">
                <div className="p-3 border border-black text-center bg-gray-50">
                    <span className="block text-[7pt] font-black uppercase">إجمالي أيام الحضور</span>
                    <span className="text-xl font-black">{studentStats?.totalDays}</span>
                </div>
                <div className="p-3 border border-black text-center bg-gray-50">
                    <span className="block text-[7pt] font-black uppercase">مرات التأخير</span>
                    <span className="text-xl font-black text-red-700">{studentStats?.lateDays}</span>
                </div>
                <div className="p-3 border border-black text-center bg-gray-50">
                    <span className="block text-[7pt] font-black uppercase">إجمالي دقائق التأخير</span>
                    <span className="text-xl font-black">{studentStats?.totalDelayMinutes} د</span>
                </div>
            </div>

            {/* جدول البيانات التفصيلي */}
            <div className="flex-grow">
                <table className="w-full border-collapse border border-black">
                    <thead>
                        <tr className="bg-gray-100 font-black">
                            <th className="p-1 border border-black text-center w-8">م</th>
                            <th className="p-1 border border-black text-right">التاريخ</th>
                            <th className="p-1 border border-black text-center">وقت الحضور</th>
                            <th className="p-1 border border-black text-center">مدة التأخير</th>
                            <th className="p-1 border border-black text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allStudentRecords.slice(0, 25).map((r, idx) => (
                            <tr key={idx} className={`border border-black ${r.delayMinutes > 0 ? 'bg-red-50/20' : ''}`}>
                                <td className="p-1 border border-black text-center font-bold">{idx + 1}</td>
                                <td className="p-1 border border-black text-right font-mono">{r.date}</td>
                                <td className="p-1 border border-black text-center font-mono">{r.arrivalTime}</td>
                                <td className="p-1 border border-black text-center font-bold">
                                    {r.delayMinutes > 0 ? `${r.delayMinutes} دقيقة` : "—"}
                                </td>
                                <td className="p-1 border border-black text-center">
                                    <span className={`text-[7pt] font-black ${r.delayMinutes > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                        {r.delayMinutes > 0 ? 'متأخر' : 'منضبط'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allStudentRecords.length > 25 && (
                    <p className="text-center py-2 text-[7pt] font-bold text-gray-400 no-print">... يتم عرض آخر ٢٥ سجلاً فقط لضمان جودة الطباعة ...</p>
                )}
            </div>

            {/* التوقيعات */}
            <div className="mt-8 pt-8 flex justify-between items-end px-12 font-black border-t-2 border-black print:mt-4 print:pt-4" style={{ fontSize: '9pt' }}>
                <div className="text-center space-y-12">
                    <p className="underline">وكيل شؤون الطلاب</p>
                    <p>..........................................</p>
                </div>
                <div className="text-center opacity-5 rotate-12 select-none grayscale no-print">
                    <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center text-[6pt]">
                        ختم المدرسة
                    </div>
                </div>
                <div className="text-center space-y-12">
                    <p className="underline">مدير المدرسة</p>
                    <p>..........................................</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
