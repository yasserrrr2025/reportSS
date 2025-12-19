
import React, { useState, useMemo } from 'react';
import { StudentRecord } from '../types';
import { formatMinutes } from '../utils/calculations';

interface Props {
  data: StudentRecord[];
  onDelete: (id: string, date: string) => void;
  onPrint: () => void;
}

const HistoryTable: React.FC<Props> = ({ data, onDelete, onPrint }) => {
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return data.filter(r => {
      const matchDate = filterDate ? r.date === filterDate : true;
      const matchSearch = search ? (r.name.includes(search) || r.id.includes(search)) : true;
      return matchDate && matchSearch;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.arrivalTime.localeCompare(a.arrivalTime));
  }, [data, filterDate, search]);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
        <h3 className="font-bold text-slate-800 text-lg">سجل الحضور والغياب</h3>
        <div className="flex gap-4 items-center">
            <input 
                type="text" 
                placeholder="بحث عن طالب..." 
                className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 w-48"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <input 
                type="date" 
                className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
            />
            <button 
                onClick={onPrint}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                طباعة التقرير
            </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-semibold border-b">رقم الهوية</th>
              <th className="px-6 py-4 font-semibold border-b">اسم الطالب</th>
              <th className="px-6 py-4 font-semibold border-b text-center">التاريخ</th>
              <th className="px-6 py-4 font-semibold border-b text-center">وقت الحضور</th>
              <th className="px-6 py-4 font-semibold border-b text-center">مدة التأخير</th>
              <th className="px-6 py-4 font-semibold border-b text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map((r, i) => (
                <tr key={`${r.id}-${r.date}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{r.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{r.name}</td>
                  <td className="px-6 py-4 text-slate-600 text-center">{r.date}</td>
                  <td className="px-6 py-4 text-emerald-700 font-bold text-center">{r.arrivalTime}</td>
                  <td className="px-6 py-4 text-center">
                    {r.delayMinutes > 0 ? (
                      <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                        {formatMinutes(r.delayMinutes)}
                      </span>
                    ) : (
                      <span className="text-emerald-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onDelete(r.id, r.date)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="حذف السجل"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">لا توجد بيانات متاحة حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
