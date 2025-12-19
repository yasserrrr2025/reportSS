
import React, { useState, useEffect, useMemo } from 'react';
import { ViewMode, StudentRecord, Stats } from './types';
import { STORAGE_KEY, SCHOOL_START_TIME, LOGO_URL } from './constants';
import Dashboard from './components/Dashboard';
import UploadSection from './components/UploadSection';
import HistoryTable from './components/HistoryTable';
import PrintReport from './components/PrintReport';
import MonthlyReport from './components/MonthlyReport';
import StudentReport from './components/StudentReport';
import ParentNotifications from './components/ParentNotifications';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.Dashboard);
  const [data, setData] = useState<StudentRecord[]>([]);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const stats: Stats = useMemo(() => {
    const studentMap: Record<string, { name: string; count: number; totalMinutes: number }> = {};
    let maxOverall = 0;
    const dayMap: Record<string, number> = {};

    data.forEach(r => {
      if (r.delayMinutes > 0) {
        if (!studentMap[r.id]) {
          studentMap[r.id] = { name: r.name, count: 0, totalMinutes: 0 };
        }
        studentMap[r.id].count += 1;
        studentMap[r.id].totalMinutes += r.delayMinutes;
        
        if (r.delayMinutes > maxOverall) maxOverall = r.delayMinutes;
        
        dayMap[r.date] = (dayMap[r.date] || 0) + 1;
      }
    });

    const topDelayed = Object.values(studentMap)
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, 5);

    const busiestDay = Object.entries(dayMap)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "لا يوجد بيانات";

    return {
      topDelayedStudents: topDelayed,
      maxDelayOverall: maxOverall,
      busiestDay
    };
  }, [data]);

  const handleUpload = (newRecords: StudentRecord[]) => {
    const updated = [...data];
    newRecords.forEach(nr => {
      const idx = updated.findIndex(existing => existing.id === nr.id && existing.date === nr.date);
      if (idx > -1) {
        updated[idx] = { ...nr, notified: updated[idx].notified }; // Preserve notification status if updated
      } else {
        updated.push({ ...nr, notified: false });
      }
    });
    setData(updated);
    setView(ViewMode.History);
  };

  const markAsNotified = (studentId: string, dates: string[]) => {
    setData(prev => prev.map(r => 
      (r.id === studentId && dates.includes(r.date)) ? { ...r, notified: true } : r
    ));
  };

  const deleteRecord = (id: string, date: string) => {
    setData(prev => prev.filter(r => !(r.id === id && r.date === date)));
  };

  const handleClearAll = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في مسح كافة البيانات المسجلة؟")) {
      setData([]);
      localStorage.removeItem(STORAGE_KEY);
      setView(ViewMode.Dashboard);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm border-b no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Logo" className="h-12 w-auto" />
            <h1 className="text-xl md:text-2xl font-bold text-emerald-800">نظام حضور الطلاب</h1>
          </div>
          <nav className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setView(ViewMode.Dashboard)} className={`px-3 py-2 rounded-md transition text-sm font-bold ${view === ViewMode.Dashboard ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>لوحة التحكم</button>
            <button onClick={() => setView(ViewMode.Upload)} className={`px-3 py-2 rounded-md transition text-sm font-bold ${view === ViewMode.Upload ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>رفع ملف</button>
            <button onClick={() => setView(ViewMode.History)} className={`px-3 py-2 rounded-md transition text-sm font-bold ${view === ViewMode.History ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>السجل</button>
            <button onClick={() => setView(ViewMode.ParentNotifications)} className={`px-3 py-2 rounded-md transition text-sm font-bold ${view === ViewMode.ParentNotifications ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50 border border-red-100'}`}>إشعارات ولي الأمر</button>
            <button onClick={() => setView(ViewMode.StudentReport)} className={`px-3 py-2 rounded-md transition text-sm font-bold ${view === ViewMode.StudentReport ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>تقرير طالب</button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {view === ViewMode.Dashboard && <Dashboard stats={stats} data={data} />}
        {view === ViewMode.Upload && <UploadSection onUpload={handleUpload} />}
        {view === ViewMode.History && <HistoryTable data={data} onDelete={deleteRecord} onPrint={() => setView(ViewMode.PrintReport)} />}
        {view === ViewMode.PrintReport && <PrintReport data={data} onBack={() => setView(ViewMode.History)} />}
        {view === ViewMode.StudentReport && <StudentReport data={data} onBack={() => setView(ViewMode.Dashboard)} />}
        {view === ViewMode.ParentNotifications && <ParentNotifications data={data} onMarkNotified={markAsNotified} onBack={() => setView(ViewMode.Dashboard)} />}
      </main>

      <footer className="bg-white border-t py-4 no-print text-center text-slate-400 text-sm">
        جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
