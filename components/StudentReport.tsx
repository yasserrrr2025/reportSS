
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

  const currentMeta = selectedStudentId ? studentMap.get(selectedStudentId) : null;

  return (
    <div className="space-y-4 print:space-y-0">
      <div className="no-print bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-6 relative z-50">
        <div className="flex items-center gap-4 flex-grow max-w-2xl">
            <button onClick={onBack} className="p-2 text-slate-400 hover:text-emerald-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div className="relative flex-grow" ref={dropdownRef}>
                <input type="text" placeholder="ابحث باسم الطالب..." value={inputValue} onFocus={() => setIsDropdownOpen(true)} onChange={(e) => { setInputValue(e.target.value); setIsDropdownOpen(true); }} className="w-full px-4 py-2 border-2 rounded-xl font-bold" />
                {isDropdownOpen && (
                    <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                        {filteredStudents.map(s => (
                            <button key={s.id} onClick={() => handleSelectStudent(s.id, s.name)} className="w-full text-right px-4 py-2 hover:bg-emerald-50 border-b last:border-0">
                                <p className="font-bold text-slate-800">{s.name}</p>
                                <p className="text-[10px] text-slate-400">{s.id}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <button onClick={() => window.print()} disabled={!selectedStudentId} className={`px-8 py-2 rounded-xl shadow transition font-black ${!selectedStudentId ? 'bg-slate-100 text-slate-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
            طباعة التقرير
        </button>
      </div>

      {selectedStudentId && (
        <div className="bg-white p-8 print:p-0 max-w-[21cm] mx-auto border print:border-none flex flex-col" style={{ pageBreakAfter: 'avoid' }}>
            <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-2" style={{ fontSize: '8pt' }}>
                <div className="font-bold">
                    <p>المملكة العربية السعودية</p>
                    <p>وزارة التعليم</p>
                    <p>مدرسة حمزة بن عبدالمطلب</p>
                </div>
                <div className="text-center">
                    <img src={LOGO_URL} alt="Logo" className="h-12 mx-auto" />
                    <h2 className="font-black underline" style={{ fontSize: '12pt' }}>سجل متابعة انضباط الطالب</h2>
                </div>
                <div className="text-left font-bold">
                    <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                    <p>رقم السجل: {selectedStudentId}</p>
                </div>
            </div>

            <div className="border-2 border-black p-3 mb-4 flex justify-between items-center bg-gray-50">
                <div>
                    <span className="block text-[8pt] text-gray-500 font-bold mb-1">اسم الطالب رباعي:</span>
                    <span className="font-black text-black" style={{ fontSize: '15pt', color: '#000000' }}>{studentStats?.studentName}</span>
                </div>
                <div className="text-left font-bold" style={{ fontSize: '9pt' }}>
                    <p>الصف: {currentMeta?.className || "—"}</p>
                    <p>الفصل: {currentMeta?.section || "—"}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 border border-black text-center"><span className="block text-[7pt] font-black uppercase">الحضور</span><span className="text-xl font-black">{studentStats?.totalDays}</span></div>
                <div className="p-2 border border-black text-center"><span className="block text-[7pt] font-black uppercase text-red-600">التأخير</span><span className="text-xl font-black text-red-600">{studentStats?.lateDays}</span></div>
                <div className="p-2 border border-black text-center"><span className="block text-[7pt] font-black uppercase">الدقائق</span><span className="text-xl font-black">{studentStats?.totalDelayMinutes}د</span></div>
            </div>

            <div className="flex-grow">
                <table className="w-full border-collapse border-2 border-black" style={{ fontSize: '8pt' }}>
                    <thead><tr className="bg-gray-100 font-black">
                        <th className="p-1 border border-black text-center">م</th>
                        <th className="p-1 border border-black text-right">التاريخ</th>
                        <th className="p-1 border border-black text-center">وقت الحضور</th>
                        <th className="p-1 border border-black text-center">المدة</th>
                        <th className="p-1 border border-black text-center">الحالة</th>
                    </tr></thead>
                    <tbody>{allStudentRecords.map((r, idx) => (
                        <tr key={idx} className={`border border-black ${r.delayMinutes > 0 ? 'bg-red-50/10' : ''}`}>
                            <td className="p-1 border border-black text-center font-bold">{idx + 1}</td>
                            <td className="p-1 border border-black text-right font-mono">{r.date}</td>
                            <td className="p-1 border border-black text-center font-mono">{r.arrivalTime}</td>
                            <td className="p-1 border border-black text-center font-bold">{r.delayMinutes > 0 ? `${r.delayMinutes}د` : "—"}</td>
                            <td className="p-1 border border-black text-center font-black">{r.delayMinutes > 0 ? 'متأخر' : 'منضبط'}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>

            <div className="mt-8 flex justify-between items-end px-12 font-black border-t-2 border-black pt-6" style={{ fontSize: '10pt' }}>
                <div className="text-center space-y-12"><p className="underline">وكيل شؤون الطلاب</p><p>............................</p></div>
                <div className="text-center space-y-12"><p className="underline">مدير المدرسة</p><p>............................</p></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
