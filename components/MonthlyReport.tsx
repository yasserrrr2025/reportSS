
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
      <div className="no-print bg-white p-6 rounded-3xl border shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 rounded-2xl transition-all border border-slate-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div className="flex items-center gap-4">
                <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">السنة الدراسية</label>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-4 py-2 border-2 border-slate-100 rounded-xl text-sm bg-slate-50 font-bold outline-none focus:border-emerald-500 transition-colors"
                    >
                        {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                            <option key={y} value={y.toString()}>{y}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">الشهر</label>
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 border-2 border-slate-100 rounded-xl text-sm bg-slate-50 font-bold outline-none focus:border-emerald-500 transition-colors"
                    >
                        {monthsAr.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
        <button 
            onClick={handlePrint}
            className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition flex items-center gap-2 font-black text-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة التقرير الشهري
        </button>
      </div>

      {/* Monthly Report Content */}
      <div className="bg-white p-12 print:p-4 shadow-2xl rounded-[2.5rem] print:rounded-none max-w-[21cm] mx-auto overflow-hidden border print:border-none">
        {/* Header */}
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
            <p className="text-emerald-700">نوع التقرير: إحصاء شهري</p>
            <p className="font-mono text-[10px]">{monthsAr.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black underline underline-offset-8 decoration-emerald-500">التقرير الإحصائي الشهري للانضباط</h1>
        </div>

        {/* Month Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-center">
                <span className="block text-[9px] text-slate-400 font-black mb-1 uppercase tracking-tighter">إجمالي السجلات</span>
                <span className="text-3xl font-black text-slate-800">{filteredMonthData.length}</span>
            </div>
            <div className="p-4 border border-red-50 rounded-2xl bg-red-50/20 text-center">
                <span className="block text-[9px] text-red-400 font-black mb-1 uppercase tracking-tighter">الطلاب المتأثرين</span>
                <span className="text-3xl font-black text-red-700">{aggregations.students.filter(s => s.daysLate > 0).length}</span>
            </div>
            <div className="p-4 border border-emerald-50 rounded-2xl bg-emerald-50/20 text-center">
                <span className="block text-[9px] text-emerald-500 font-black mb-1 uppercase tracking-tighter">إجمالي الدقائق</span>
                <span className="text-3xl font-black text-emerald-800">{aggregations.students.reduce((acc, curr) => acc + curr.totalMinutes, 0)}</span>
            </div>
        </div>

        {/* Section 1: Daily Summary */}
        <div className="mb-10" style={{ pageBreakInside: 'avoid' }}>
            <h3 className="text-md font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-600 rounded-full"></span>
                أولاً: الملخص التراكمي اليومي
            </h3>
            <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-200/50 border-b border-slate-200">
                            <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">التاريخ</th>
                            <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">عدد الحضور</th>
                            <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">المتأخرين</th>
                            <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">إجمالي التأخير</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregations.daily.length > 0 ? aggregations.daily.map(d => (
                            <tr key={d.date} className="border-b border-white last:border-0 hover:bg-white transition-colors">
                                <td className="p-2 text-center text-xs font-mono font-bold text-slate-600">{d.date}</td>
                                <td className="p-2 text-center text-xs font-bold">{d.totalStudents}</td>
                                <td className="p-2 text-center text-xs font-black text-red-600">{d.totalDelayed}</td>
                                <td className="p-2 text-center text-xs font-bold text-emerald-800">{formatMinutes(d.totalMinutes)}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="p-10 text-center text-slate-400 text-xs italic">لا توجد سجلات لهذا الشهر</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Section 2: Student Summary */}
        <div style={{ pageBreakInside: 'avoid' }}>
            <h3 className="text-md font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-600 rounded-full"></span>
                ثانياً: الطلاب الأكثر تأخيراً (مرات التكرار)
            </h3>
            <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-200/50 border-b border-slate-200">
                            <th className="p-3 text-right text-[9px] font-black text-slate-500 uppercase">اسم الطالب</th>
                            <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">الهوية</th>
                            <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">الحضور</th>
                            <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">التأخير</th>
                            <th className="p-3 text-center text-[9px] font-black text-slate-500 uppercase">المدة الإجمالية</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregations.students.length > 0 ? aggregations.students.slice(0, 20).map(s => (
                            <tr key={s.id} className={`border-b border-white last:border-0 hover:bg-white transition-colors ${s.daysLate > 3 ? "bg-red-50/20" : ""}`}>
                                <td className="p-2 text-right text-xs font-black text-slate-800">{s.name}</td>
                                <td className="p-2 text-center text-xs font-mono text-slate-400">{s.id}</td>
                                <td className="p-2 text-center text-xs font-bold">{s.daysPresent}</td>
                                <td className="p-2 text-center text-xs font-black text-red-600">{s.daysLate}</td>
                                <td className="p-2 text-center text-xs font-bold text-emerald-800">{formatMinutes(s.totalMinutes)}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-400 text-xs italic">لا توجد سجلات طلاب لهذا الشهر</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Section 3: Signature Area */}
        <div className="mt-16 print:mt-10 flex justify-between items-end px-10 font-black text-slate-800" style={{ pageBreakInside: 'avoid' }}>
            <div className="text-center space-y-12">
                <p className="text-xs underline underline-offset-4">وكيل شؤون الطلاب</p>
                <p className="text-slate-300 font-normal">............................</p>
            </div>
            
            <div className="text-center opacity-10 rotate-12 select-none grayscale">
                <div className="w-24 h-24 border-4 border-double border-slate-600 rounded-full flex items-center justify-center text-slate-800 text-[7px] font-black p-4">
                    <div className="text-center">
                        <p>تقرير معتمد</p>
                        <p className="my-1 border-y border-slate-400 py-1">MONTHLY AUDIT</p>
                        <p>حمزة بن عبدالمطلب</p>
                    </div>
                </div>
            </div>

            <div className="text-center space-y-12">
                <p className="text-xs underline underline-offset-4">مدير المدرسة</p>
                <p className="text-slate-300 font-normal">............................</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
