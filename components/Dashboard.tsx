
import React, { useMemo } from 'react';
import { Stats, StudentRecord, StudentMetadata } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { formatMinutes } from '../utils/calculations';

interface Props {
  stats: Stats;
  data: StudentRecord[];
  students: StudentMetadata[];
}

const Dashboard: React.FC<Props> = ({ stats, data, students }) => {
  const COLORS = {
    emerald: '#10b981',
    rose: '#f43f5e',
    slate: '#475569',
    amber: '#f59e0b',
    indigo: '#6366f1'
  };

  const studentMap = useMemo(() => {
    return new Map(students.map(s => [s.id, s]));
  }, [students]);

  // استخراج تفاصيل يوم الذروة بشكل أفضل
  const busiestDayDetails = useMemo(() => {
    if (!stats.busiestDay || stats.busiestDay === "لا يوجد بيانات") {
      return { dayName: "—", fullDate: "لا توجد سجلات" };
    }
    // التنسيق المتوقع من App.tsx هو "اليوم (YYYY-MM-DD)"
    const match = stats.busiestDay.match(/(.+) \((.+)\)/);
    if (match) {
      return { dayName: match[1], fullDate: match[2] };
    }
    return { dayName: stats.busiestDay, fullDate: "" };
  }, [stats.busiestDay]);

  // حساب توزيع الانضباط بناءً على إجمالي قاعدة البيانات
  const distributionData = useMemo(() => {
    const totalStudentsInDb = students.length || 1;
    const uniqueLateStudentIds = new Set(data.filter(r => r.delayMinutes > 0).map(r => r.id));
    const lateCount = uniqueLateStudentIds.size;
    const onTimeCount = Math.max(0, totalStudentsInDb - lateCount);

    return [
      { name: 'منضبطون', value: onTimeCount, color: COLORS.emerald },
      { name: 'متأخرون', value: lateCount, color: COLORS.rose }
    ];
  }, [data, students, COLORS.emerald, COLORS.rose]);

  const disciplinePercentage = useMemo(() => {
    const total = students.length || 1;
    const onTime = distributionData[0].value;
    return Math.round((onTime / total) * 100);
  }, [distributionData, students]);

  // ملخص البيانات لكل يوم (للجدول الجديد)
  const dailySummaryTable = useMemo(() => {
    const days: Record<string, { date: string, dayName: string, totalStudents: number, lateCount: number, totalMinutes: number }> = {};
    
    data.forEach(r => {
      if (!days[r.date]) {
        const dateObj = new Date(r.date);
        const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(dateObj);
        days[r.date] = { date: r.date, dayName, totalStudents: 0, lateCount: 0, totalMinutes: 0 };
      }
      days[r.date].totalStudents += 1;
      if (r.delayMinutes > 0) {
        days[r.date].lateCount += 1;
        days[r.date].totalMinutes += r.delayMinutes;
      }
    });

    return Object.values(days).sort((a, b) => b.date.localeCompare(a.date));
  }, [data]);

  const trendData = useMemo(() => {
    return [...dailySummaryTable].reverse().slice(-10).map(d => ({
      date: d.date,
      late: d.lateCount,
      onTime: d.totalStudents - d.lateCount
    }));
  }, [dailySummaryTable]);

  const classStats = useMemo(() => {
    const classMap: Record<string, { className: string; section: string; delayCount: number }> = {};
    data.forEach(r => {
      if (r.delayMinutes > 0) {
        const meta = studentMap.get(r.id);
        const key = `${meta?.className || "غير محدد"}-${meta?.section || "—"}`;
        if (!classMap[key]) {
          classMap[key] = { className: meta?.className || "غير محدد", section: meta?.section || "—", delayCount: 0 };
        }
        classMap[key].delayCount += 1;
      }
    });
    return Object.values(classMap).sort((a, b) => b.delayCount - a.delayCount);
  }, [data, studentMap]);

  const totalStudentsInDatabase = students.length || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header Section */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-4xl font-black mb-3">لوحة تحكم الانضباط</h2>
            <p className="text-slate-400 font-bold text-lg">تحليل شامل يعتمد على {students.length} طالب مسجل في النظام.</p>
          </div>
          
          <div className="flex gap-4">
            {/* بطاقة يوم الذروة المحسنة */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[220px]">
                <p className="text-[10px] font-black text-rose-400 uppercase mb-2 tracking-widest">اليوم الأكثر تأخيراً</p>
                <p className="text-2xl font-black text-white mb-1">{busiestDayDetails.dayName}</p>
                <p className="text-xs font-bold text-slate-400 font-mono">{busiestDayDetails.fullDate}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[200px]">
                <p className="text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-widest">نسبة الانضباط العام</p>
                <p className="text-5xl font-black">{disciplinePercentage}%</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black text-slate-900 text-2xl">التوجه الزمني للتأخير</h4>
            <span className="text-xs font-bold text-slate-400">آخر ١٠ أيام مرصودة</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: '900', fill: '#94a3b8'}} axisLine={false} />
                <YAxis tick={{fontSize: 10, fontWeight: '900', fill: '#94a3b8'}} axisLine={false} />
                <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="late" stroke="#f43f5e" fill="url(#colorLate)" strokeWidth={4} name="المتأخرون" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* General Status Summary */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="text-center mb-8">
            <h4 className="font-black text-slate-900 text-xl">خلاصة الحالة العامة</h4>
            <p className="text-xs text-slate-400 font-bold mt-1">بناءً على إجمالي الطلاب المسجلين</p>
          </div>
          
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <span className="text-3xl font-black text-slate-900">{disciplinePercentage}%</span>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">منضبط</span>
            </div>
          </div>

          <div className="w-full mt-6 space-y-3">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-black text-slate-500 uppercase">إجمالي الطلاب (الميتادات)</span>
              <span className="text-lg font-black text-slate-900">{students.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <span className="text-xs font-black text-rose-600 uppercase">طلاب سجلوا تأخيراً</span>
              <span className="text-lg font-black text-rose-700">{distributionData[1].value}</span>
            </div>
          </div>
        </div>
      </div>

      {/* جدول الأيام المسجلة المحدث */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
            <div>
                <h4 className="font-black text-slate-900 text-2xl">سجل الأيام المرصودة</h4>
                <p className="text-sm text-slate-400 font-bold mt-1">نسبة التأخير محسوبة من إجمالي طلاب قاعدة البيانات ({totalStudentsInDatabase})</p>
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-5 py-2 rounded-2xl border border-indigo-100 text-xs font-black">
                إجمالي الأيام: {dailySummaryTable.length}
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">اليوم</th>
                        <th className="px-6 py-4">التاريخ</th>
                        <th className="px-6 py-4 text-center">عدد المتأخرين</th>
                        <th className="px-6 py-4 text-center">إجمالي دقائق التأخير</th>
                        <th className="px-6 py-4 text-center">نسبة التأخير من إجمالي المدرسة</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {dailySummaryTable.map((day, idx) => {
                        // النسبة الآن تعتمد على إجمالي الطلاب في قاعدة البيانات
                        const latePercentOfTotal = Math.round((day.lateCount / totalStudentsInDatabase) * 100);
                        return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{day.dayName}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-slate-400 text-xs font-bold">{day.date}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-rose-600 font-black text-xl">{day.lateCount}</span>
                                    <span className="text-[10px] text-slate-400 font-bold block">طالب متأخر</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-amber-600 font-bold text-sm bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">{formatMinutes(day.totalMinutes)}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center gap-3">
                                        <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${latePercentOfTotal}%` }}></div>
                                        </div>
                                        <span className="text-sm font-black text-rose-600">{latePercentOfTotal}%</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* Top Delayed Students */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <h4 className="font-black text-slate-900 text-3xl mb-8 border-b border-slate-50 pb-6">الطلاب الأكثر تكراراً للتأخير</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.topDelayedStudents.map((s, i) => {
            const meta = studentMap.get(s.id);
            return (
              <div key={i} className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 hover:bg-white hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-rose-600 text-white rounded-2xl flex flex-col items-center justify-center font-black shadow-lg shadow-rose-200">
                  <span className="text-2xl">{s.count}</span>
                  <span className="text-[8px] uppercase">مرات</span>
                </div>
                <div className="flex-grow min-w-0">
                  <h5 className="font-black text-black text-2xl lg:text-3xl leading-tight mb-2 truncate" style={{ color: '#000' }}>
                    {s.name}
                  </h5>
                  <div className="flex gap-2 items-center">
                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-xl text-[10px] font-black">{meta?.className || "غير محدد"}</span>
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-[10px] font-black">فصل {meta?.section || "—"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Class Analytics */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <h4 className="font-black text-slate-900 text-2xl mb-8">التحليل حسب الفصول</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {classStats.map((c, i) => (
            <div key={i} className={`p-6 rounded-[2rem] border transition-all ${i < 3 ? 'bg-rose-600 text-white border-rose-700 shadow-xl shadow-rose-100' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${i < 3 ? 'bg-white text-rose-600' : 'bg-slate-900 text-white'}`}>
                  {c.section}
                </div>
                <span className={`text-[10px] font-black uppercase ${i < 3 ? 'text-white/70' : 'text-slate-400'}`}>فصل</span>
              </div>
              <p className={`font-black text-lg mb-1 truncate ${i < 3 ? 'text-white' : 'text-slate-900'}`}>{c.className}</p>
              <div className="flex items-end justify-between">
                <span className={`text-3xl font-black ${i < 3 ? 'text-white' : 'text-rose-600'}`}>{c.delayCount}</span>
                <span className={`text-[9px] font-bold ${i < 3 ? 'text-white/60' : 'text-slate-400'}`}>حالة تأخير</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
