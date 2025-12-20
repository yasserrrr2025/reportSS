
import React, { useState, useMemo } from 'react';
import { StudentRecord, StudentMetadata } from '../types';
import { formatMinutes } from '../utils/calculations';

interface Props {
  data: StudentRecord[];
  students: StudentMetadata[];
  onDelete: (id: string, date: string) => void;
  onPrint: () => void;
}

const HistoryTable: React.FC<Props> = ({ data, students, onDelete, onPrint }) => {
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'late' | 'on-time'>('all');

  const studentMap = useMemo(() => {
    return new Map(students.map(s => [s.id, s]));
  }, [students]);

  const filteredData = useMemo(() => {
    return data.filter(r => {
      const matchDate = filterDate ? r.date === filterDate : true;
      const matchSearch = search ? (r.name.includes(search) || r.id.includes(search)) : true;
      const matchStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'late' ? r.delayMinutes > 0 :
        r.delayMinutes === 0;
      return matchDate && matchSearch && matchStatus;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.arrivalTime.localeCompare(a.arrivalTime));
  }, [data, filterDate, search, statusFilter]);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div>
            <h3 className="font-black text-slate-800 text-2xl">سجل الحضور اليومي</h3>
            <p className="text-slate-400 font-bold text-sm mt-1">إجمالي الحالات المعروضة: {filteredData.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
                <input 
                    type="text" 
                    placeholder="بحث باسم الطالب أو الهوية..." 
                    className="p-3 pr-10 border-2 border-slate-100 rounded-2xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none w-full sm:w-64 font-bold transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="p-3 border-2 border-slate-100 rounded-2xl text-sm font-bold bg-white focus:border-emerald-500 outline-none transition-all"
            >
                <option value="all">كل الحالات</option>
                <option value="late">متأخرين فقط</option>
                <option value="on-time">منضبطين فقط</option>
            </select>

            <input 
                type="date" 
                className="p-3 border-2 border-slate-100 rounded-2xl text-sm font-bold bg-white focus:border-emerald-500 outline-none transition-all"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
            />
            
            <button 
                onClick={onPrint}
                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 font-black text-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                تصدير للطباعة
            </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5 border-b border-slate-100">رقم الهوية</th>
              <th className="px-8 py-5 border-b border-slate-100">اسم الطالب</th>
              <th className="px-8 py-5 border-b border-slate-100">الصف</th>
              <th className="px-8 py-5 border-b border-slate-100">الفصل</th>
              <th className="px-8 py-5 border-b border-slate-100 text-center">التاريخ</th>
              <th className="px-8 py-5 border-b border-slate-100 text-center">وقت الحضور</th>
              <th className="px-8 py-5 border-b border-slate-100 text-center">الحالة</th>
              <th className="px-8 py-5 border-b border-slate-100 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.length > 0 ? (
              filteredData.map((r, i) => {
                const meta = studentMap.get(r.id);
                const isLate = r.delayMinutes > 0;
                return (
                  <tr key={`${r.id}-${r.date}`} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-8 py-5 text-slate-400 font-mono text-xs">{r.id}</td>
                    <td className="px-8 py-5">
                        <span className="font-black text-slate-800 text-lg block leading-tight">{r.name}</span>
                        {isLate && <span className="text-[10px] text-rose-500 font-bold">تأخر مرصود</span>}
                    </td>
                    <td className="px-8 py-5">
                        <span className="text-slate-600 font-black text-sm">{meta?.className || "—"}</span>
                    </td>
                    <td className="px-8 py-5">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-black">فصل {meta?.section || "—"}</span>
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-center font-bold text-sm">{r.date}</td>
                    <td className="px-8 py-5 text-center">
                        <span className={`font-mono font-black ${isLate ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {r.arrivalTime}
                        </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {isLate ? (
                        <div className="inline-flex flex-col items-center">
                            <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-2xl text-[11px] font-black border border-rose-100 shadow-sm">
                            تأخر: {formatMinutes(r.delayMinutes)}
                            </span>
                        </div>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-2xl text-[11px] font-black border border-emerald-100 shadow-sm">
                            منضبط
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => onDelete(r.id, r.date)}
                        className="text-slate-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-all"
                        title="حذف السجل"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-8 py-24 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-slate-400 font-black text-lg">لا توجد بيانات مطابقة للفلتر المختار</p>
                    <button onClick={() => {setSearch(""); setFilterDate(""); setStatusFilter('all');}} className="mt-4 text-emerald-600 font-bold hover:underline">إعادة ضبط الفلاتر</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
