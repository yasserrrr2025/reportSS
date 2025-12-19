
import React, { useMemo, useState } from 'react';
import { StudentRecord } from '../types';
import { LOGO_URL } from '../constants';
import { formatMinutes } from '../utils/calculations';

interface Props {
  data: StudentRecord[];
  onBack: () => void;
}

const PrintReport: React.FC<Props> = ({ data, onBack }) => {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  
  const reportData = useMemo(() => {
    return data.filter(r => r.date === reportDate)
               .sort((a, b) => b.delayMinutes - a.delayMinutes);
  }, [data, reportDate]);

  const stats = useMemo(() => {
    const total = reportData.length;
    const delayed = reportData.filter(r => r.delayMinutes > 0).length;
    return { total, delayed };
  }, [reportData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Configuration Bar - Hidden in Print */}
      <div className="no-print bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-emerald-700 hover:underline flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                رجوع
            </button>
            <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-emerald-800">اختر تاريخ التقرير:</label>
                <input 
                    type="date" 
                    value={reportDate} 
                    onChange={(e) => setReportDate(e.target.value)}
                    className="p-1 border rounded-md"
                />
            </div>
        </div>
        <button 
            onClick={handlePrint}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition"
        >
            بدء الطباعة الآن
        </button>
      </div>

      {/* Official Report Content */}
      <div className="bg-white p-12 shadow-xl border min-h-[1000px] print:shadow-none print:border-none print:p-0" id="print-content">
        {/* Official Header */}
        <div className="flex justify-between items-start mb-10 border-b pb-6">
          <div className="text-right space-y-1">
            <h2 className="font-bold text-lg">المملكة العربية السعودية</h2>
            <h3 className="font-bold">وزارة التعليم</h3>
            <p className="text-sm text-slate-500">مدرسة حمزة بن عبدالمطلب</p>
          </div>
          <div className="text-center">
            <img src={LOGO_URL} alt="Ministry Logo" className="h-24 w-auto mb-2" />
          </div>
          <div className="text-left space-y-1 text-sm font-bold text-slate-600">
            <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
            <p>الموضوع: تقرير المتأخرين اليومي</p>
            <p>الصفحة: ١ من ١</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black underline underline-offset-8 decoration-emerald-500">بيان تأخر الطلاب اليومي</h1>
          <p className="mt-4 text-slate-600">ليوم: <span className="font-bold text-slate-900">{reportDate}</span></p>
        </div>

        {/* Stats Summary Table */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 border rounded-lg bg-slate-50 text-center">
                <span className="block text-sm text-slate-500">إجمالي الطلاب الحاضرين</span>
                <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <div className="p-4 border rounded-lg bg-red-50 text-center">
                <span className="block text-sm text-red-500">عدد المتأخرين</span>
                <span className="text-2xl font-bold text-red-600">{stats.delayed}</span>
            </div>
        </div>

        {/* Attendance Table */}
        <table className="w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-emerald-700 text-white print:bg-emerald-700 print:text-white">
              <th className="border border-slate-300 p-3 text-right">م</th>
              <th className="border border-slate-300 p-3 text-right">رقم الهوية</th>
              <th className="border border-slate-300 p-3 text-right">اسم الطالب</th>
              <th className="border border-slate-300 p-3 text-center">وقت الحضور</th>
              <th className="border border-slate-300 p-3 text-center">مدة التأخير</th>
            </tr>
          </thead>
          <tbody>
            {reportData.length > 0 ? (
              reportData.map((r, idx) => (
                <tr key={idx} className={r.delayMinutes > 0 ? "bg-amber-50" : ""}>
                  <td className="border border-slate-300 p-3 text-right">{idx + 1}</td>
                  <td className="border border-slate-300 p-3 text-right font-mono">{r.id}</td>
                  <td className="border border-slate-300 p-3 text-right font-bold">{r.name}</td>
                  <td className="border border-slate-300 p-3 text-center font-mono">{r.arrivalTime}</td>
                  <td className="border border-slate-300 p-3 text-center">
                    {r.delayMinutes > 0 ? (
                      <span className="font-bold text-red-600">{formatMinutes(r.delayMinutes)}</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">حضور منضبط</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="border border-slate-300 p-10 text-center text-slate-400">لا يوجد بيانات مسجلة لهذا اليوم</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer for Signatures */}
        <div className="mt-20 flex justify-between px-10 font-bold text-slate-700">
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

export default PrintReport;
