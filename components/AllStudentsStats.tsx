
import React, { useMemo, useState } from 'react';
import { StudentRecord, StudentMetadata } from '../types';
import { LOGO_URL } from '../constants';
import { formatMinutes } from '../utils/calculations';

interface Props {
  data: StudentRecord[];
  students: StudentMetadata[];
  onBack: () => void;
}

const AllStudentsStats: React.FC<Props> = ({ data, students, onBack }) => {
  const [search, setSearch] = useState("");

  const studentMap = useMemo(() => {
    return new Map(students.map(s => [s.id, s]));
  }, [students]);

  const studentAggregates = useMemo(() => {
    const agg: Record<string, { id: string; name: string; totalDelays: number; totalMinutes: number; totalAttendance: number }> = {};
    
    data.forEach(r => {
      if (!agg[r.id]) {
        agg[r.id] = { id: r.id, name: r.name, totalDelays: 0, totalMinutes: 0, totalAttendance: 0 };
      }
      agg[r.id].totalAttendance += 1;
      if (r.delayMinutes > 0) {
        agg[r.id].totalDelays += 1;
        agg[r.id].totalMinutes += r.delayMinutes;
      }
    });

    return Object.values(agg)
      .filter(s => s.name.includes(search) || s.id.includes(search))
      .sort((a, b) => b.totalDelays - a.totalDelays);
  }, [data, search]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="no-print bg-white p-6 rounded-3xl border shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 rounded-2xl transition-all border border-slate-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800">إحصائيات الطلاب التراكمية</h2>
            <p className="text-xs text-slate-400 font-bold">عرض وتحليل إجمالي تأخيرات الطلاب من كافة السجلات المرفوعة</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="بحث باسم الطالب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2.5 border-2 border-slate-100 rounded-xl text-sm bg-slate-50 font-bold outline-none focus:border-emerald-500 transition-colors w-64"
          />
          <button 
            onClick={handlePrint}
            className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition flex items-center gap-2 font-black text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة التقرير الإحصائي
          </button>
        </div>
      </div>

      {/* Official Report Table */}
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
            <p className="text-emerald-700">نوع التقرير: إحصائية تراكمية</p>
            <p className="font-mono text-[10px]">إجمالي الطلاب: {studentAggregates.length}</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black underline underline-offset-8 decoration-emerald-500 uppercase tracking-wider">بيان إحصائي شامل بانضباط الطلاب</h1>
          <p className="mt-4 text-slate-500 font-bold text-sm">يحتوي هذا البيان على إجمالي مرات التأخير ودقائق التأخير لكل طالب مسجل في النظام</p>
        </div>

        {/* The Table */}
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="p-3 text-center text-[10px] font-black text-slate-600 uppercase border-r">م</th>
                <th className="p-3 text-right text-[10px] font-black text-slate-600 uppercase border-r">اسم الطالب</th>
                <th className="p-3 text-center text-[10px] font-black text-slate-600 uppercase border-r">رقم الهوية</th>
                <th className="p-3 text-center text-[10px] font-black text-slate-600 uppercase border-r">الصف</th>
                <th className="p-3 text-center text-[10px] font-black text-slate-600 uppercase border-r">الفصل</th>
                <th className="p-3 text-center text-[10px] font-black text-slate-600 uppercase border-r">إجمالي الحضور</th>
                <th className="p-3 text-center text-[10px] font-black text-slate-600 uppercase border-r">مرات التأخير</th>
                <th className="p-3 text-center text-[10px] font-black text-slate-600 uppercase">مجموع دقائق التأخير</th>
              </tr>
            </thead>
            <tbody>
              {studentAggregates.length > 0 ? studentAggregates.map((s, idx) => {
                const meta = studentMap.get(s.id);
                return (
                  <tr key={s.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${s.totalDelays >= 5 ? 'bg-red-50/20' : ''}`}>
                    <td className="p-2 text-center text-xs font-bold text-slate-400 border-r">{idx + 1}</td>
                    <td className="p-2 text-right text-xs font-black text-slate-800 border-r">{s.name}</td>
                    <td className="p-2 text-center text-xs font-mono text-slate-500 border-r">{s.id}</td>
                    <td className="p-2 text-center text-[10px] text-slate-500 border-r">{meta?.className || "—"}</td>
                    <td className="p-2 text-center text-[10px] text-slate-500 border-r">{meta?.section || "—"}</td>
                    <td className="p-2 text-center text-xs font-bold text-slate-600 border-r">{s.totalAttendance}</td>
                    <td className="p-2 text-center text-xs font-black text-red-600 border-r">{s.totalDelays}</td>
                    <td className="p-2 text-center text-xs font-bold text-emerald-800">{formatMinutes(s.totalMinutes)}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8} className="p-10 text-center text-slate-400 text-xs italic">لا توجد بيانات متاحة</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer for Signatures */}
        <div className="mt-16 flex justify-between items-end px-10 font-black text-slate-800 print:page-break-inside-avoid">
          <div className="text-center space-y-12">
            <p className="text-xs underline underline-offset-4">وكيل شؤون الطلاب</p>
            <p className="text-slate-300 font-normal">............................</p>
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

        <div className="mt-8 text-center text-[9px] text-slate-400 font-bold italic no-print border-t pt-4">
          * تم استخراج هذا التقرير آلياً من نظام إدارة الحضور المدرسي الرقمي.
        </div>
      </div>
    </div>
  );
};

export default AllStudentsStats;
