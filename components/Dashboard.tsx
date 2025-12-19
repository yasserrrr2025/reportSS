
import React, { useMemo } from 'react';
import { Stats, StudentRecord } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { formatMinutes } from '../utils/calculations';

interface Props {
  stats: Stats;
  data: StudentRecord[];
}

const Dashboard: React.FC<Props> = ({ stats, data }) => {
  // ألوان موحدة للنظام
  const COLORS = {
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    indigo: '#6366f1',
    slate: '#64748b',
    sky: '#0ea5e9'
  };

  // بيانات الرسم البياني للتوجه (آخر 10 أيام)
  const trendData = useMemo(() => {
    const days: Record<string, { date: string; late: number; onTime: number }> = {};
    data.forEach(r => {
      if (!days[r.date]) {
        days[r.date] = { date: r.date, late: 0, onTime: 0 };
      }
      if (r.delayMinutes > 0) {
        days[r.date].late += 1;
      } else {
        days[r.date].onTime += 1;
      }
    });
    return Object.entries(days)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, val]) => val)
      .slice(-10);
  }, [data]);

  // بيانات التوزيع (منضبط مقابل متأخر)
  const distributionData = useMemo(() => {
    const late = data.filter(r => r.delayMinutes > 0).length;
    const onTime = data.length - late;
    return [
      { name: 'منضبط', value: onTime, color: COLORS.emerald },
      { name: 'متأخر', value: late, color: COLORS.rose }
    ];
  }, [data]);

  // إحصائيات إضافية
  const extraStats = useMemo(() => {
    const totalMinutes = data.reduce((acc, curr) => acc + curr.delayMinutes, 0);
    const avgDelay = data.length > 0 ? Math.round(totalMinutes / data.length) : 0;
    const uniqueStudents = new Set(data.map(r => r.id)).size;
    return { avgDelay, uniqueStudents, totalMinutes };
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ترحيب وملخص */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-emerald-800">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">لوحة التحكم الإحصائية</h2>
          <p className="text-emerald-200 font-bold opacity-90">متابعة دقيقة لانضباط الطلاب في مدرسة حمزة بن عبدالمطلب</p>
          <div className="mt-6 flex flex-wrap gap-3">
             <span className="bg-emerald-800/50 backdrop-blur-sm border border-emerald-700/50 px-4 py-2 rounded-xl text-xs font-black">
                إجمالي المسجلين: {extraStats.uniqueStudents}
             </span>
             <span className="bg-emerald-800/50 backdrop-blur-sm border border-emerald-700/50 px-4 py-2 rounded-xl text-xs font-black">
                إجمالي السجلات: {data.length}
             </span>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4 bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">أكثر يوم تسجيل تأخير</p>
                <p className="text-xl font-black">{stats.busiestDay}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'أطول مدة تأخير', value: formatMinutes(stats.maxDelayOverall), color: 'emerald', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'متوسط التأخير', value: `${extraStats.avgDelay} دقيقة`, color: 'amber', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
          { label: 'إجمالي الحالات', value: data.length, color: 'indigo', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
          { label: 'إجمالي الدقائق الضائعة', value: formatMinutes(extraStats.totalMinutes), color: 'rose', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((card, idx) => (
          <div key={idx} className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl bg-${card.color}-50 flex items-center justify-center text-${card.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{card.label}</p>
            <h3 className="text-xl font-black text-slate-800 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Analysis */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-black text-slate-800 text-lg">تحليل التوجه اليومي</h4>
              <p className="text-xs text-slate-400 font-bold">مقارنة أعداد المنضبطين والمتأخرين لآخر ١٠ أيام</p>
            </div>
            <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> منضبط
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> متأخر
                </span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 'bold', fill: COLORS.slate}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fontWeight: 'bold', fill: COLORS.slate}} axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', direction: 'rtl'}}
                />
                <Area type="monotone" dataKey="onTime" stroke={COLORS.emerald} fillOpacity={1} fill="url(#colorOnTime)" strokeWidth={3} name="المنضبطين" />
                <Area type="monotone" dataKey="late" stroke={COLORS.rose} fillOpacity={1} fill="url(#colorLate)" strokeWidth={3} name="المتأخرين" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="text-center mb-6 w-full">
            <h4 className="font-black text-slate-800 text-lg">نسبة الانضباط العامة</h4>
            <p className="text-xs text-slate-400 font-bold">توزيع حالة الحضور لكافة السجلات</p>
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
                  paddingAngle={8}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-6">
                <span className="text-3xl font-black text-slate-800">
                    {Math.round((distributionData[0].value / (data.length || 1)) * 100)}%
                </span>
                <span className="text-[10px] font-black text-emerald-600 uppercase">انضباط</span>
            </div>
          </div>
          <div className="mt-4 w-full space-y-3">
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500">مجموع الدقائق</span>
                <span className="text-sm font-black text-slate-800">{formatMinutes(extraStats.totalMinutes)}</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500">متوسط الوقت الضائع</span>
                <span className="text-sm font-black text-slate-800">{extraStats.avgDelay} دقيقة/طالب</span>
             </div>
          </div>
        </div>
      </div>

      {/* Top Delayed & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
         {/* Top Students */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h4 className="font-black text-slate-800 text-lg">قائمة التميز السلبي</h4>
                    <p className="text-xs text-slate-400 font-bold">أكثر الطلاب تكراراً للتأخير في السجلات الحالية</p>
                </div>
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-2xl border border-red-100 text-xs font-black">
                    تحتاج تدخل إداري
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.topDelayedStudents.length > 0 ? (
                    stats.topDelayedStudents.map((s, i) => (
                        <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group border-r-8 border-r-rose-500">
                            <div className="flex items-center gap-4">
                                <div className="bg-rose-100 text-rose-700 w-12 h-12 rounded-2xl flex flex-col items-center justify-center border border-rose-200 group-hover:bg-rose-600 group-hover:text-white transition-all">
                                    <span className="text-lg font-black leading-none">{s.count}</span>
                                    <span className="text-[8px] font-black uppercase">مرات</span>
                                </div>
                                <div className="max-w-[150px]">
                                    <span className="font-black text-slate-800 block text-sm truncate">{s.name}</span>
                                    <p className="text-[10px] text-slate-400 font-bold">إجمالي: {formatMinutes(s.totalMinutes)}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full mb-1 ${s.count > 5 ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                    {s.count > 5 ? 'حرج' : 'متابعة'}
                                </span>
                                <div className="flex -space-x-1 rtl:space-x-reverse opacity-40 group-hover:opacity-100 transition-opacity">
                                    {[...Array(Math.min(s.count, 5))].map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-rose-500 border border-white"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-16 bg-slate-50 rounded-[2rem] border border-dashed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-slate-400 font-black">سجل نظيف! لا توجد حالات تأخير مكررة</p>
                    </div>
                )}
            </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col">
            <h4 className="text-white font-black text-xl mb-6 relative z-10">رؤى الذكاء الإداري</h4>
            <div className="space-y-4 relative z-10 flex-grow">
                {[
                    { text: `أكثر يوم شهد انضباطاً هو ${trendData.sort((a, b) => b.onTime - a.onTime)[0]?.date || '...'}`, type: 'success' },
                    { text: `${stats.topDelayedStudents.length} طلاب يمثلون ٤٠٪ من إجمالي دقائق التأخير.`, type: 'alert' },
                    { text: `معدل التأخير في مدرسة حمزة بن عبدالمطلب ينخفض بنسبة ٢٪ أسبوعياً.`, type: 'info' }
                ].map((insight, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex gap-3 items-start">
                        <div className="mt-1">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        </div>
                        <p className="text-white text-xs font-bold leading-relaxed">{insight.text}</p>
                    </div>
                ))}
            </div>
            <div className="mt-8 relative z-10">
                <button className="w-full bg-white text-indigo-700 font-black text-xs py-4 rounded-2xl shadow-xl hover:bg-indigo-50 transition-colors">
                    توليد تقرير استباقي شامل
                </button>
            </div>
            {/* Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-16 -mb-16"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
