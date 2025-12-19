
import React, { useMemo, useState } from 'react';
import { StudentRecord } from '../types';
import { LOGO_URL } from '../constants';
import { formatMinutes } from '../utils/calculations';

interface Props {
  data: StudentRecord[];
  onBack: () => void;
}

const MonthlyReport: React.FC<Props> = ({ data, onBack }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthsAr = [
    { value: "01", label: "يناير" },
    { value: "02", label: "فبراير" },
    { value: "03", label: "مارس" },
    { value: "04", label: "أبريل" },
    { value: "05", label: "مايو" },
    { value: "06", label: "يونيو" },
    { value: "07", label: "يوليو" },
    { value: "08", label: "أغسطس" },
    { value: "09", label: "سبتمبر" },
    { value: "10", label: "أكتوبر" },
    { value: "11", label: "نوفمبر" },
    { value: "12", label: "ديسمبر" },
  ];

  const filteredMonthData = useMemo(() => {
    return data.filter(r => {
      const [y, m] = r.date.split('-');
      return y === selectedYear && m === selectedMonth;
    });
  }, [data, selectedYear, selectedMonth]);

  const aggregations = useMemo(() => {
    const studentAgg: Record<string, { id: string; name: string; daysPresent: number; daysLate: number; totalMinutes: number }> = {};
    const dailyAgg: Record<string, { date: string; totalStudents: number; totalDelayed: number; totalMinutes: number }> = {};

    filteredMonthData.forEach(r => {
      // Student Aggregation
      if (!studentAgg[r.id]) {
        studentAgg[r.id] = { id: r.id, name: r.name, daysPresent: 0, daysLate: 0, totalMinutes: 0 };
      }
      studentAgg[r.id].daysPresent += 1;
      if (r.delayMinutes > 0) {
        studentAgg[r.id].daysLate += 1;
        studentAgg[r.id].totalMinutes += r.delayMinutes;
      }

      // Daily Aggregation
      if (!dailyAgg[r.date]) {
        dailyAgg[r.date] = { date: r.date, totalStudents: 0, totalDelayed: 0, totalMinutes: 0 };
      }
      dailyAgg[r.date].totalStudents += 1;
      if (r.delayMinutes > 0) {
        dailyAgg[r.date].totalDelayed += 1;
        dailyAgg[r.date].totalMinutes += r.delayMinutes;
      }
    });

    return {
      students: Object.values(studentAgg).sort((a, b) => b.totalMinutes - a.totalMinutes),
      daily: Object.values(dailyAgg).sort((a, b) => a.date.localeCompare(b.date))
    };
  }, [filteredMonthData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Configuration Bar */}
      <div className="no-print bg-white p-4 rounded-xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
            <button onClick={onBack} className="text-slate-600 hover:text-emerald-700 flex items-center gap-2 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                رجوع
            </button>
            <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-slate-700">السنة:</label>
                <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="p-2 border rounded-md text-sm bg-slate-50"
                >
                    {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                        <option key={y} value={y.toString()}>{y}</option>
                    ))}
                </select>
                <label className="text-sm font-bold text-slate-700">الشهر:</label>
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-2 border rounded-md text-sm bg-slate-50"
                >
                    {monthsAr.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>
        </div>
        <button 
            onClick={handlePrint}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition flex items-center gap-2 font-bold"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة التقرير الشهري
        </button>
      </div>

      {/* Monthly Report Content */}
      <div className="bg-white p-10 shadow-xl border min-h-[1200px] print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div className="text-right space-y-1">
            <h2 className="font-bold text-lg">المملكة العربية السعودية</h2>
            <h3 className="font-bold">وزارة التعليم</h3>
            <p className="text-sm text-slate-500 font-bold">مدرسة حمزة بن عبدالمطلب</p>
          </div>
          <div className="text-center">
            <img src={LOGO_URL} alt="Ministry Logo" className="h-20 w-auto mb-2" />
          </div>
          <div className="text-left space-y-1 text-sm font-bold text-slate-600">
            <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
            <p>نوع التقرير: ملخص شهري</p>
            <p>الفترة: {monthsAr.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black underline underline-offset-8 decoration-emerald-500">التقرير الإحصائي الشهري لتأخر الطلاب</h1>
        </div>

        {/* Month Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8 no-print">
            <div className="p-4 border rounded-lg bg-blue-50 text-center">
                <span className="block text-sm text-blue-600 font-bold">إجمالي السجلات</span>
                <span className="text-2xl font-bold">{filteredMonthData.length}</span>
            </div>
            <div className="p-4 border rounded-lg bg-amber-50 text-center">
                <span className="block text-sm text-amber-600 font-bold">عدد الطلاب المتأثرين</span>
                <span className="text-2xl font-bold">{aggregations.students.filter(s => s.daysLate > 0).length}</span>
            </div>
            <div className="p-4 border rounded-lg bg-emerald-50 text-center">
                <span className="block text-sm text-emerald-600 font-bold">إجمالي الدقائق</span>
                <span className="text-2xl font-bold">{aggregations.students.reduce((acc, curr) => acc + curr.totalMinutes, 0)}</span>
            </div>
        </div>

        {/* Section 1: Daily Summary */}
        <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-r-4 border-emerald-600 pr-3">أولاً: الملخص اليومي (خلال الشهر)</h3>
            <table className="w-full border-collapse border border-slate-300">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2 text-center text-sm">التاريخ</th>
                        <th className="border border-slate-300 p-2 text-center text-sm">عدد الحضور</th>
                        <th className="border border-slate-300 p-2 text-center text-sm text-red-600">عدد المتأخرين</th>
                        <th className="border border-slate-300 p-2 text-center text-sm">إجمالي التأخير</th>
                    </tr>
                </thead>
                <tbody>
                    {aggregations.daily.length > 0 ? aggregations.daily.map(d => (
                        <tr key={d.date}>
                            <td className="border border-slate-300 p-2 text-center text-sm font-mono">{d.date}</td>
                            <td className="border border-slate-300 p-2 text-center text-sm">{d.totalStudents}</td>
                            <td className="border border-slate-300 p-2 text-center text-sm font-bold text-red-600">{d.totalDelayed}</td>
                            <td className="border border-slate-300 p-2 text-center text-sm">{formatMinutes(d.totalMinutes)}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan={4} className="p-6 text-center text-slate-400">لا توجد سجلات لهذا الشهر</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Section 2: Student Summary */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-r-4 border-emerald-600 pr-3">ثانياً: سجل الطلاب الأكثر تأخيراً</h3>
            <table className="w-full border-collapse border border-slate-300">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2 text-right text-sm">اسم الطالب</th>
                        <th className="border border-slate-300 p-2 text-center text-sm">رقم الهوية</th>
                        <th className="border border-slate-300 p-2 text-center text-sm">أيام الحضور</th>
                        <th className="border border-slate-300 p-2 text-center text-sm text-red-600">مرات التأخير</th>
                        <th className="border border-slate-300 p-2 text-center text-sm">إجمالي الوقت</th>
                    </tr>
                </thead>
                <tbody>
                    {aggregations.students.length > 0 ? aggregations.students.map(s => (
                        <tr key={s.id} className={s.daysLate > 3 ? "bg-red-50" : ""}>
                            <td className="border border-slate-300 p-2 text-right text-sm font-bold">{s.name}</td>
                            <td className="border border-slate-300 p-2 text-center text-sm font-mono">{s.id}</td>
                            <td className="border border-slate-300 p-2 text-center text-sm">{s.daysPresent}</td>
                            <td className="border border-slate-300 p-2 text-center text-sm font-bold text-red-600">{s.daysLate}</td>
                            <td className="border border-slate-300 p-2 text-center text-sm">{formatMinutes(s.totalMinutes)}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan={5} className="p-6 text-center text-slate-400">لا توجد سجلات طلاب لهذا الشهر</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Footer for Signatures */}
        <div className="mt-16 flex justify-between px-10 font-bold text-slate-700">
          <div className="text-center">
            <p className="mb-8 underline">وكيل شؤون الطلاب</p>
            <p>.......................................</p>
          </div>
          <div className="text-center">
            <p className="mb-8 underline">مدير المدرسة</p>
            <p>.......................................</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
