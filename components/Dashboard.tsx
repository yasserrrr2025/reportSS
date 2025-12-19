
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
  // ألوان موحدة للنظام
  const COLORS = {
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    indigo: '#6366f1',
    slate: '#64748b',
    sky: '#0ea5e9',
    violet: '#8b5cf6'
  };

  // خريطة الطلاب للوصول السريع لبيانات الصف والفصل
  const studentMap = useMemo(() => {
    return new Map(students.map(s => [s.id, s]));
  }, [students]);

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

  // إحصائيات الفصول
  const classStats = useMemo(() => {
    const classMap: Record<string, { className: string; section: string; delayCount: number }> = {};
    
    data.forEach(r => {
      if (r.delayMinutes > 0) {
        const meta = studentMap.get(r.id);
        const cName = meta?.className || "غير محدد";
        const sNum = meta?.section || "—";
        const key = `${cName}-${sNum}`;
        
        if (!classMap[key]) {
          classMap[key] = { className: cName, section: sNum, delayCount: 0 };
        }
        classMap[key].delayCount += 1;
      }
    });

    // مرتبة تنازلياً (الأكثر تأخراً أولاً)
    return Object.values(classMap).sort((a, b) => b.delayCount - a.delayCount);
  }, [data, studentMap]);

  // تحليل أيام الأسبوع التراكمي
  const weekdayStats = useMemo(() => {
    const daysMap = [
      { name: 'الأحد', count: 0 },
      { name: 'الاثنين', count: 0 },
      { name: 'الثلاثاء', count: 0 },
      { name: 'الأربعاء', count: 0 },
      { name: 'الخميس', count: 0 },
      { name: 'الجمعة', count: 0 },
      { name: 'السبت', count: 0 }
    ];

    data.forEach(r => {
      if (r.delayMinutes > 0) {
        const dayIndex = new Date(r.date).getDay();
        daysMap[dayIndex].count += 1;
      }
    });

    const activeDays = daysMap.filter(d => d.name !== 'الجمعة' && d.name !== 'السبت' || d.count > 0);
    const counts = activeDays.map(d => d.count);
    const maxVal = Math.max(...counts);
    const minVal = counts.length > 0 ? Math.min(...counts) : 0;

    return { data: activeDays, maxVal, minVal };
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
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
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
        <div className="relative z-10 flex items-center gap-4 bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md min-w-[280px]">
            <div className="text-left w-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">أكثر يوم تسجيل تأخير</p>
                <p className="text-xl font-black whitespace-normal break-words">{stats.busiestDay}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
            </div>
        </div>
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'أطول مدة تأخير', value: formatMinutes(stats.maxDelayOverall), color: 'emerald', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'متوسط التأخير', value: `${extraStats.avgDelay} دقيقة`, color: 'amber', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
          { label: 'إجمالي الحالات', value: data.length, color: 'indigo', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' },
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

        {/* Weekly Day Intensity Analysis */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="text-right mb-6 w-full">
            <h4 className="font-black text-slate-800 text-lg">كثافة التأخير الأسبوعية</h4>
            <p className="text-xs text-slate-400 font-bold">توزيع حالات التأخير التراكمي حسب أيام الأسبوع</p>
          </div>
          
          <div className="flex-grow space-y-4">
             {weekdayStats.data.map((day, idx) => {
                const isMax = day.count === weekdayStats.maxVal && day.count > 0;
                const isMin = day.count === weekdayStats.minVal && day.count > 0;
                const percentage = weekdayStats.maxVal > 0 ? (day.count / weekdayStats.maxVal) * 100 : 0;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-end">
                      <span className={`text-xs font-black ${isMax ? 'text-rose-600' : isMin ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {day.name}
                        {isMax && <span className="mr-2 text-[8px] bg-rose-50 px-1.5 py-0.5 rounded text-rose-500 uppercase tracking-tighter">الذروة</span>}
                        {isMin && <span className="mr-2 text-[8px] bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-500 uppercase tracking-tighter">الأفضل</span>}
                      </span>
                      <span className="text-[10px] font-black text-slate-400">{day.count} حالة</span>
                    </div>
                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className={`h-full transition-all duration-1000 ${isMax ? 'bg-rose-500' : isMin ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
             })}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span> الأعلى تأخيراً
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> الأقل تأخيراً
                </div>
          </div>
        </div>
      </div>

      {/* Class Statistics List - Enhanced with Gradients */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-black text-slate-800 text-lg">تحليل التأخير حسب الفصول</h4>
              <p className="text-xs text-slate-400 font-bold">الأكثر تأخيراً (أحمر) والأكثر انضباطاً (أخضر)</p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 text-xs font-black">
              {classStats.length} فصول نشطة
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {classStats.length > 0 ? classStats.map((c, i) => {
                  const isTop3 = i < 3;
                  const isBottom3 = i >= classStats.length - 3 && classStats.length > 3;

                  // تحديد سمات البطاقة بناءً على الترتيب
                  let cardStyles = "bg-slate-50 border-slate-100 text-slate-800";
                  let iconStyles = "bg-indigo-50 text-indigo-600";
                  let badge = null;

                  if (isTop3) {
                    cardStyles = "bg-gradient-to-br from-rose-500 to-red-600 border-rose-400 text-white shadow-lg shadow-rose-100";
                    iconStyles = "bg-white/20 text-white";
                    badge = <span className="absolute top-2 left-2 bg-white/20 text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">حالة حرجة</span>;
                  } else if (isBottom3) {
                    cardStyles = "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-100";
                    iconStyles = "bg-white/20 text-white";
                    badge = <span className="absolute top-2 left-2 bg-white/20 text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">انضباط عالي</span>;
                  }

                  return (
                    <div key={i} className={`relative flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-300 hover:scale-[1.03] group ${cardStyles}`}>
                        {badge}
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${iconStyles}`}>
                                {c.section}
                            </div>
                            <div>
                                <span className={`block text-xs font-black truncate max-w-[80px] ${isTop3 || isBottom3 ? 'text-white' : 'text-slate-800'}`}>{c.className}</span>
                                <span className={`text-[10px] font-bold ${isTop3 || isBottom3 ? 'text-white/70' : 'text-slate-400'}`}>فصل دراسي</span>
                            </div>
                        </div>
                        <div className="text-left">
                            <span className={`text-xl font-black ${isTop3 || isBottom3 ? 'text-white' : 'text-rose-600'}`}>{c.delayCount}</span>
                            <span className={`block text-[8px] font-black uppercase ${isTop3 || isBottom3 ? 'text-white/70' : 'text-slate-400'}`}>تأخير</span>
                        </div>
                    </div>
                  );
              }) : (
                  <div className="col-span-full text-center py-10 text-slate-400 italic font-bold">لا توجد بيانات فصول متاحة حالياً. تأكد من رفع كشوف الطلاب.</div>
              )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Top Students */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                <div>
                    <h4 className="font-black text-slate-800 text-xl">قائمة التميز السلبي</h4>
                    <p className="text-sm text-slate-400 font-bold">تحليل الحالات الأكثر تكراراً للتأخير</p>
                </div>
                <div className="bg-red-50 text-red-700 px-6 py-2.5 rounded-2xl border border-red-100 text-xs font-black animate-pulse">
                    تحتاج تدخل إداري فوري
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {stats.topDelayedStudents.length > 0 ? (
                    stats.topDelayedStudents.map((s, i) => {
                        const meta = studentMap.get(s.id);
                        return (
                            <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-1.5 transition-all group border-r-8 border-r-rose-600 relative overflow-hidden">
                                <div className="flex items-center gap-5 flex-grow min-w-0 z-10">
                                    <div className="bg-rose-100 text-rose-700 w-16 h-16 rounded-3xl flex flex-col items-center justify-center border border-rose-200 group-hover:bg-rose-600 group-hover:text-white transition-all flex-shrink-0 shadow-sm">
                                        <span className="text-2xl font-black leading-none">{s.count}</span>
                                        <span className="text-[9px] font-black uppercase">مرات</span>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <span className="font-black text-slate-900 block text-xl leading-snug mb-1.5 break-words group-hover:text-rose-700 transition-colors">
                                            {s.name}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-black border border-emerald-100">
                                                {meta?.className || "غير محدد"} - {meta?.section || "—"}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <p className="text-[10px] text-slate-400 font-bold">إجمالي التأخير:</p>
                                                <span className="text-rose-600 text-[10px] font-black">
                                                    {formatMinutes(s.totalMinutes)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 ml-2 z-10">
                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-2xl mb-3 shadow-sm ${s.count > 5 ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                                        {s.count > 5 ? 'حالة حرجة' : 'قيد المتابعة'}
                                    </span>
                                    <div className="flex -space-x-1.5 rtl:space-x-reverse opacity-40 group-hover:opacity-100 transition-opacity">
                                        {[...Array(Math.min(s.count, 6))].map((_, i) => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-rose-500 border border-white shadow-sm"></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-2 text-center py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto text-slate-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-slate-400 font-black text-lg">سجل نظيف تماماً!</p>
                        <p className="text-xs text-slate-300 font-bold">لا توجد حالات تأخير مكررة حالياً</p>
                    </div>
                )}
            </div>
        </div>

        {/* Distribution Analysis */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="text-center mb-4 w-full border-b border-slate-50 pb-4">
            <h4 className="font-black text-slate-800 text-lg">توزيع حالة الانضباط</h4>
          </div>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                />
                <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-10">
                <span className="text-3xl font-black text-slate-800 leading-none">
                    {Math.round((distributionData[0].value / (data.length || 1)) * 100)}%
                </span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">انضباط</span>
            </div>
          </div>
          <div className="mt-4 w-full space-y-3">
             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                <span className="text-xs font-bold text-slate-500">متوسط الوقت الضائع</span>
                <span className="text-md font-black text-slate-800 group-hover:text-rose-600 transition-colors">{extraStats.avgDelay} دقيقة</span>
             </div>
             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                <span className="text-xs font-bold text-slate-500">معدل الانحراف</span>
                <span className="text-md font-black text-emerald-600">مثالي</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
