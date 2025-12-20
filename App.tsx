
import React, { useState, useEffect, useMemo } from 'react';
import { ViewMode, StudentRecord, Stats, GroupedData, StudentMetadata } from './types';
import { STORAGE_KEY, LOGO_URL, STUDENTS_METADATA_KEY } from './constants';
import Dashboard from './components/Dashboard';
import UploadSection from './components/UploadSection';
import HistoryTable from './components/HistoryTable';
import PrintReport from './components/PrintReport';
import MonthlyReport from './components/MonthlyReport';
import StudentReport from './components/StudentReport';
import ParentNotifications from './components/ParentNotifications';
import AllStudentsStats from './components/AllStudentsStats';
import StudentListUpload from './components/StudentListUpload';
import StudentManagement from './components/StudentManagement';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.Dashboard);
  const [data, setData] = useState<GroupedData>({});
  const [studentsMetadata, setStudentsMetadata] = useState<StudentMetadata[]>([]);

  // استرجاع البيانات عند التشغيل
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
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
        console.error("Failed to parse stored attendance data", e);
      }
    }

    const savedMetadata = localStorage.getItem(STUDENTS_METADATA_KEY);
    if (savedMetadata) {
      try {
        setStudentsMetadata(JSON.parse(savedMetadata));
      } catch (e) {
        console.error("Failed to parse stored student metadata", e);
      }
    }
  }, []);

  // حفظ البيانات عند التغيير
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(STUDENTS_METADATA_KEY, JSON.stringify(studentsMetadata));
  }, [studentsMetadata]);

  const flatData = useMemo(() => {
    return Object.values(data).flatMap(studentRecords => Object.values(studentRecords));
  }, [data]);

  const stats: Stats = useMemo(() => {
    const studentStats: { id: string; name: string; count: number; totalMinutes: number }[] = [];
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
        studentStats.push({ id, name, count, totalMinutes });
      }
    });

    const topDelayed = studentStats
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, 5);

    const busiestDayEntry = Object.entries(dayMap)
      .sort((a, b) => b[1] - a[1])[0];
    
    let busiestDayStr = "لا يوجد بيانات";
    if (busiestDayEntry) {
      const dateObj = new Date(busiestDayEntry[0]);
      const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(dateObj);
      busiestDayStr = `${dayName} (${busiestDayEntry[0]})`;
    }

    return {
      topDelayedStudents: topDelayed,
      maxDelayOverall: maxOverall,
      busiestDay: busiestDayStr
    };
  }, [data]);

  const handleUpload = (newRecords: StudentRecord[]) => {
    setData(prev => {
      const updated = { ...prev };
      newRecords.forEach(nr => {
        if (!updated[nr.id]) updated[nr.id] = {};
        const existing = updated[nr.id][nr.date];
        updated[nr.id][nr.date] = { ...nr, notified: existing?.notified ?? false };
      });
      return updated;
    });
    setView(ViewMode.History);
  };

  const handleUpdateStudentList = (students: StudentMetadata[]) => {
    setStudentsMetadata(prev => {
        const map = new Map(prev.map(s => [s.id, s]));
        students.forEach(s => map.set(s.id, s));
        return Array.from(map.values());
    });
    setView(ViewMode.StudentManagement);
  };

  const deleteStudentFromMetadata = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطالب من قاعدة البيانات؟")) {
        setStudentsMetadata(prev => prev.filter(s => s.id !== id));
    }
  };

  const clearStudentDatabase = () => {
    if (window.confirm("سيتم حذف كافة بيانات الطلاب المخزنة. هل أنت متأكد؟")) {
        setStudentsMetadata([]);
    }
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

  const NavItem = ({ mode, label, icon, color = "emerald" }: { mode: ViewMode, label: string, icon: React.ReactNode, color?: string }) => {
    const isActive = view === mode;
    return (
      <button 
        onClick={() => setView(mode)}
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 font-bold text-sm ${
          isActive 
          ? `bg-${color}-600 text-white shadow-lg shadow-${color}-200 scale-105` 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      {/* Top Banner (No Print) */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-slate-100 no-print">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-50 p-2 rounded-2xl border border-emerald-100 shadow-sm">
                <img src={LOGO_URL} alt="Logo" className="h-10 w-auto object-contain" />
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">نظام متابعة الانضباط الرقمي</h1>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Hamza Bin Abdulmuttalib School</p>
            </div>
          </div>
          
          <nav className="flex flex-wrap justify-center items-center gap-2">
            <NavItem mode={ViewMode.Dashboard} label="الرئيسية" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
            <NavItem mode={ViewMode.StudentManagement} color="amber" label="الطلاب" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
            <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block"></div>
            <NavItem mode={ViewMode.Upload} label="رصد يومي" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>} />
            <NavItem mode={ViewMode.History} label="السجل" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5" /></svg>} />
            <NavItem mode={ViewMode.AllStudentsStats} label="إحصائيات" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <NavItem mode={ViewMode.MonthlyReport} label="شهري" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <NavItem mode={ViewMode.StudentReport} label="بحث طالب" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
            <NavItem mode={ViewMode.ParentNotifications} color="rose" label="إشعارات" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} />
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-[1600px] mx-auto px-6 py-10 w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="bg-white/40 rounded-[3rem] p-2">
            {view === ViewMode.Dashboard && <Dashboard stats={stats} data={flatData} students={studentsMetadata} />}
            {view === ViewMode.StudentDatabase && <StudentListUpload onUpdate={handleUpdateStudentList} onBack={() => setView(ViewMode.StudentManagement)} />}
            {view === ViewMode.StudentManagement && <StudentManagement students={studentsMetadata} onDelete={deleteStudentFromMetadata} onClear={clearStudentDatabase} onUpload={() => setView(ViewMode.StudentDatabase)} />}
            {view === ViewMode.Upload && <UploadSection onUpload={handleUpload} />}
            {view === ViewMode.History && <HistoryTable data={flatData} students={studentsMetadata} onDelete={deleteRecord} onPrint={() => setView(ViewMode.PrintReport)} />}
            {view === ViewMode.PrintReport && <PrintReport data={flatData} students={studentsMetadata} onBack={() => setView(ViewMode.History)} />}
            {view === ViewMode.MonthlyReport && <MonthlyReport data={flatData} students={studentsMetadata} onBack={() => setView(ViewMode.Dashboard)} />}
            {view === ViewMode.StudentReport && <StudentReport groupedData={data} students={studentsMetadata} onBack={() => setView(ViewMode.Dashboard)} />}
            {view === ViewMode.ParentNotifications && <ParentNotifications data={flatData} students={studentsMetadata} onMarkNotified={markAsNotified} onBack={() => setView(ViewMode.Dashboard)} />}
            {view === ViewMode.AllStudentsStats && <AllStudentsStats data={flatData} students={studentsMetadata} onBack={() => setView(ViewMode.Dashboard)} />}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 no-print">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-400 font-bold text-xs gap-4">
            <p>نظام إدارة الحضور الرقمي &copy; {new Date().getFullYear()} - مدرسة حمزة بن عبدالمطلب</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-emerald-600 transition-colors">الدعم الفني</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">سياسة الخصوصية</a>
                <span className="text-slate-200">|</span>
                <span className="text-emerald-600">الإصدار 2.5.0</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
