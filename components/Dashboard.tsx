
import React from 'react';
import { Stats, StudentRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatMinutes } from '../utils/calculations';

interface Props {
  stats: Stats;
  data: StudentRecord[];
}

const Dashboard: React.FC<Props> = ({ stats, data }) => {
  const chartData = React.useMemo(() => {
    const days: Record<string, number> = {};
    data.forEach(r => {
      if (r.delayMinutes > 0) {
        days[r.date] = (days[r.date] || 0) + 1;
      }
    });
    return Object.entries(days)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }))
      .slice(-7); // Last 7 days
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-emerald-500">
          <p className="text-slate-500 text-sm font-semibold">أكثر مدة تأخير مسجلة</p>
          <h3 className="text-3xl font-bold text-emerald-900 mt-2">{formatMinutes(stats.maxDelayOverall)}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-amber-500">
          <p className="text-slate-500 text-sm font-semibold">أكثر يوم تسجيل تأخير</p>
          <h3 className="text-3xl font-bold text-amber-900 mt-2">{stats.busiestDay}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-blue-500">
          <p className="text-slate-500 text-sm font-semibold">إجمالي عدد السجلات</p>
          <h3 className="text-3xl font-bold text-blue-900 mt-2">{data.length} طالب</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-bold text-slate-800 mb-6 border-r-4 border-emerald-500 pr-3">إحصائيات التأخير (آخر ٧ أيام)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="عدد المتأخرين" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Delayed Students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-bold text-slate-800 mb-4 border-r-4 border-red-500 pr-3">أكثر الطلاب تأخيراً (مرات التأخير)</h4>
          <div className="space-y-3">
            {stats.topDelayedStudents.length > 0 ? (
              stats.topDelayedStudents.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    {/* Delay Count Badge */}
                    <div className="bg-red-100 text-red-700 w-10 h-10 rounded-full flex flex-col items-center justify-center border border-red-200 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <span className="text-xs font-bold leading-none">{s.count}</span>
                      <span className="text-[8px] font-bold">مرات</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-sm">{s.name}</span>
                      <p className="text-[10px] text-slate-400 font-bold">إجمالي وقت التأخير</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      {formatMinutes(s.totalMinutes)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-400 font-bold">لا توجد سجلات تأخير حتى الآن</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
