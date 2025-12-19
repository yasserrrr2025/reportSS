
import React, { useState, useEffect, useMemo } from 'react';
import { ViewMode, StudentRecord, Stats, GroupedData } from './types';
import { STORAGE_KEY, LOGO_URL } from './constants';
import Dashboard from './components/Dashboard';
import UploadSection from './components/UploadSection';
import HistoryTable from './components/HistoryTable';
import PrintReport from './components/PrintReport';
import MonthlyReport from './components/MonthlyReport';
import StudentReport from './components/StudentReport';
import ParentNotifications from './components/ParentNotifications';
import AllStudentsStats from './components/AllStudentsStats';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.Dashboard);
  const [data, setData] = useState<GroupedData>({});

  // استرجاع البيانات عند التشغيل وتحويلها للهيكل الجديد إذا كانت مخزنة كمصفوفة قديمة
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // تحويل من مصفوفة إلى هيكل مجمع (Migration)
          const grouped: GroupedData = {};
          parsed.forEach((r: StudentRecord) => {
            if (!grouped[r.id]) grouped[r.id] = {};
            grouped[r.id][r.date] = r;
          });
          setData(grouped);
        } else {
          setData(parsed);
        }
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }
  }, []);

  // حفظ البيانات عند التغيير
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Derived State: مصفوفة مسطحة للمكونات التي تحتاجها
  const flatData = useMemo(() => {
    return Object.values(data).flatMap(studentRecords => Object.values(studentRecords));
  }, [data]);

  const stats: Stats = useMemo(() => {
    const studentStats: { name: string; count: number; totalMinutes: number }[] = [];
    let maxOverall = 0;
    const dayMap: Record<string, number> = {};

    Object.entries(data).forEach(([id, records]) => {
      let name = "";
      let count = 0;
      let totalMinutes = 0;

      Object.values(records).forEach(r => {
        name = r.name;
        if (r.delayMinutes > 0) {
          count += 1;
          totalMinutes += r.delayMinutes;
          if (r.delayMinutes > maxOverall) maxOverall = r.delayMinutes;
          dayMap[r.date] = (dayMap[r.date] || 0) + 1;
        }
      });

      if (count > 0) {
        studentStats.push({ name, count, totalMinutes });
      }
    });

    const topDelayed = studentStats
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
    setData(prev => {
      const updated = { ...prev };
      newRecords.forEach(nr => {
        if (!updated[nr.id]) updated[nr.id] = {};
        // دمج البيانات مع الحفاظ على حالة الإشعار إذا كان السجل موجوداً مسبقاً
        const existing = updated[nr.id][nr.date];
        updated[nr.id][nr.date] = { ...nr, notified: existing?.notified ?? false };
      });
      return updated;
    });
    setView(ViewMode.History);
  };

  const markAsNotified = (studentId: string, dates: string[]) => {
    setData(prev => {
      if (!prev[studentId]) return prev;
      const updatedStudent = { ...prev[studentId] };
      dates.forEach(date => {
        if (updatedStudent[date]) {
          updatedStudent[date] = { ...updatedStudent[date], notified: true };
        }
      });
      return { ...prev, [studentId]: updatedStudent };
    });
  };

  const deleteRecord = (id: string, date: string) => {
    setData(prev => {
      if (!prev[id]) return prev;
      const updatedStudent = { ...prev[id] };
      delete updatedStudent[date];
      
      const newGrouped = { ...prev };
      if (Object.keys(updatedStudent).length === 0) {
        delete newGrouped[id];
      } else {
        newGrouped[id] = updatedStudent;
      }
      return newGrouped;
    });
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
            <button onClick={() => setView(ViewMode.AllStudentsStats)} className={`px-3 py-2 rounded-md transition text-sm font-bold ${view === ViewMode.AllStudentsStats ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>إحصائيات الطلاب</button>
            <button onClick={() => setView(ViewMode.MonthlyReport)} className={`px-3 py-2 rounded-md transition text-sm font-bold ${view === ViewMode.MonthlyReport ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>التقرير الشهري</button>
            <button onClick={() => setView(ViewMode.StudentReport)} className={`px-3 py-2 rounded-md transition text-sm font-bold ${view === ViewMode.StudentReport ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>تقرير طالب</button>
            <button onClick={() => setView(ViewMode.ParentNotifications)} className={`px-3 py-2 rounded-md transition text-sm font-bold ${view === ViewMode.ParentNotifications ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50 border border-red-100'}`}>إشعارات ولي الأمر</button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {view === ViewMode.Dashboard && <Dashboard stats={stats} data={flatData} />}
        {view === ViewMode.Upload && <UploadSection onUpload={handleUpload} />}
        {view === ViewMode.History && <HistoryTable data={flatData} onDelete={deleteRecord} onPrint={() => setView(ViewMode.PrintReport)} />}
        {view === ViewMode.PrintReport && <PrintReport data={flatData} onBack={() => setView(ViewMode.History)} />}
        {view === ViewMode.MonthlyReport && <MonthlyReport data={flatData} onBack={() => setView(ViewMode.Dashboard)} />}
        {view === ViewMode.StudentReport && <StudentReport groupedData={data} onBack={() => setView(ViewMode.Dashboard)} />}
        {view === ViewMode.ParentNotifications && <ParentNotifications data={flatData} onMarkNotified={markAsNotified} onBack={() => setView(ViewMode.Dashboard)} />}
        {view === ViewMode.AllStudentsStats && <AllStudentsStats data={flatData} onBack={() => setView(ViewMode.Dashboard)} />}
      </main>

      <footer className="bg-white border-t py-4 no-print text-center text-slate-400 text-sm">
        جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
