
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { StudentRecord } from '../types';
import { LOGO_URL } from '../constants';
import { formatMinutes, normalizeArabic } from '../utils/calculations';

interface Props {
  data: StudentRecord[];
  onBack: () => void;
}

const StudentReport: React.FC<Props> = ({ data, onBack }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Unique list of students
  const students = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach(r => map.set(r.id, r.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  // Find currently selected student name
  const selectedStudentName = useMemo(() => {
    return students.find(s => s.id === selectedStudentId)?.name || "";
  }, [students, selectedStudentId]);

  // ADVANCED FILTERING LOGIC
  const filteredStudents = useMemo(() => {
    const normalizedTerm = normalizeArabic(searchTerm.toLowerCase());
    
    // If search term is empty or exactly matches the selected student's name, show all (or first 100 for performance)
    if (!normalizedTerm || normalizedTerm === normalizeArabic(selectedStudentName)) {
      return students;
    }

    return students.filter(s => 
      normalizeArabic(s.name).includes(normalizedTerm) || 
      s.id.includes(normalizedTerm)
    );
  }, [students, searchTerm, selectedStudentName]);

  const studentRecords = useMemo(() => {
    if (!selectedStudentId) return [];
    return data
      .filter(r => r.id === selectedStudentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data, selectedStudentId]);

  const studentStats = useMemo(() => {
    if (studentRecords.length === 0) return null;
    const totalDays = studentRecords.length;
    const lateDays = studentRecords.filter(r => r.delayMinutes > 0).length;
    const totalDelayMinutes = studentRecords.reduce((acc, curr) => acc + curr.delayMinutes, 0);
    const studentName = studentRecords[0].name;

    return { totalDays, lateDays, totalDelayMinutes, studentName };
  }, [studentRecords]);

  const handleSelectStudent = (id: string, name: string) => {
    setSelectedStudentId(id);
    setSearchTerm(name); // Set search term to name so it's visible in the box
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchTerm("");
    setSelectedStudentId("");
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handlePrint = () => {
    if (!selectedStudentId) return;
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* PROFESSIONAL SEARCH BAR */}
      <div className="no-print bg-white p-6 rounded-3xl border shadow-xl flex flex-wrap items-center justify-between gap-6 relative z-[100]">
        <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-3 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 rounded-2xl transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            
            <div className="relative flex flex-col" ref={dropdownRef}>
                <label className="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-[0.2em] mr-1">قاعدة بيانات الطلاب</label>
                <div className="relative min-w-[400px]">
                    <div 
                        className={`flex items-center gap-3 px-4 py-3 border-2 rounded-2xl transition-all cursor-text shadow-sm ${isOpen ? 'border-emerald-500 ring-4 ring-emerald-50 bg-white' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}
                        onClick={() => setIsOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isOpen ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        
                        <input 
                            ref={inputRef}
                            type="text"
                            placeholder="ابحث بالاسم، الهوية، أو الكلمات المفتاحية..."
                            value={searchTerm}
                            onFocus={() => setIsOpen(true)}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setIsOpen(true);
                                // If manually changing, we temporarily deselect to show results
                                if (e.target.value !== selectedStudentName) {
                                    // Don't clear ID immediately to avoid flickering the report
                                }
                            }}
                            className="bg-transparent border-none outline-none w-full font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
                        />

                        {searchTerm && (
                            <button onClick={handleClear} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        
                        <div className="h-4 w-px bg-slate-200 mx-1"></div>
                        
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {/* RESULTS LIST */}
                    {isOpen && (
                        <div className="absolute z-[200] w-full mt-3 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl max-h-[350px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                            <div className="p-2 sticky top-0 bg-slate-50/90 backdrop-blur-sm border-b text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between px-4">
                                <span>نتائج البحث ({filteredStudents.length})</span>
                                {searchTerm && <span>فلترة ذكية</span>}
                            </div>
                            
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSelectStudent(s.id, s.name)}
                                        className={`w-full text-right px-5 py-3.5 hover:bg-emerald-50 border-b border-slate-50 last:border-0 flex justify-between items-center group transition-all ${selectedStudentId === s.id ? 'bg-emerald-50' : ''}`}
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className={`font-bold text-base transition-colors ${selectedStudentId === s.id ? 'text-emerald-700' : 'text-slate-700 group-hover:text-emerald-800'}`}>
                                                {s.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${selectedStudentId === s.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {s.id}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedStudentId === s.id ? (
                                            <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="opacity-0 group-hover:opacity-100 text-emerald-300 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm">عذراً، لم نجد أي طالب يطابق "{searchTerm}"</p>
                                    <button onClick={() => setSearchTerm("")} className="mt-2 text-emerald-600 font-black text-xs hover:underline uppercase tracking-widest">عرض جميع الطلاب</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <button 
            onClick={handlePrint}
            disabled={!selectedStudentId}
            className={`px-10 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-3 font-black text-sm tracking-tight ${!selectedStudentId ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 shadow-emerald-200'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة التقرير الرسمي
        </button>
      </div>

      {/* REPORT CONTENT AREA */}
      {!selectedStudentId ? (
        <div className="bg-emerald-50/50 border-4 border-dashed border-emerald-100 rounded-[3rem] p-32 text-center animate-pulse">
            <div className="bg-white w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg border-8 border-emerald-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <h2 className="text-4xl font-black text-emerald-900 mb-4 tracking-tighter">بانتظار اختيار الطالب...</h2>
            <p className="text-emerald-700 text-xl max-w-lg mx-auto leading-relaxed font-bold opacity-60">
                استخدم محرك البحث الذكي أعلاه للوصول السريع لبيانات أي طالب في النظام وتوليد التقرير الرسمي له.
            </p>
        </div>
      ) : (
        <div className="bg-white p-20 shadow-2xl border-2 border-slate-50 min-h-[1200px] print:shadow-none print:border-none print:p-0 rounded-[3rem] animate-in slide-in-from-bottom-10 duration-700">
            {/* OFFICIAL HEADER */}
            <div className="flex justify-between items-start mb-16 border-b-8 border-double border-emerald-800 pb-12">
                <div className="text-right space-y-3">
                    <h2 className="font-black text-2xl text-slate-900 tracking-tighter">المملكة العربية السعودية</h2>
                    <h3 className="font-bold text-xl text-slate-600">وزارة التعليم</h3>
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-2xl border border-emerald-100 text-sm font-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        مدرسة حمزة بن عبدالمطلب
                    </div>
                </div>
                <div className="text-center group">
                    <img src={LOGO_URL} alt="Ministry Logo" className="h-32 w-auto mb-4 transition-transform group-hover:scale-110 duration-500" />
                </div>
                <div className="text-left space-y-2 text-sm font-bold text-slate-500">
                    <div className="bg-slate-50 p-2 px-5 rounded-2xl border border-slate-100 flex justify-between gap-8">
                        <span>تاريخ الطباعة:</span>
                        <span className="font-mono text-slate-800">{new Date().toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="bg-slate-50 p-2 px-5 rounded-2xl border border-slate-100 flex justify-between gap-8">
                        <span>نوع التقرير:</span>
                        <span className="text-emerald-700">بيان انضباط طالب</span>
                    </div>
                    <div className="bg-emerald-900 text-white p-2 px-5 rounded-2xl shadow-lg shadow-emerald-900/20 flex justify-between gap-8">
                        <span>رقم الملف:</span>
                        <span className="font-mono">{selectedStudentId}</span>
                    </div>
                </div>
            </div>

            {/* IDENTITY CARD */}
            <div className="bg-slate-900 p-10 rounded-[2.5rem] mb-12 border border-slate-800 flex justify-between items-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 flex items-center gap-10">
                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-emerald-400 border border-white/10 group-hover:border-emerald-500/50 transition-all duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <span className="block text-xs text-emerald-500 font-black mb-2 uppercase tracking-[0.3em] opacity-70">الاسم الكامل للطالب:</span>
                        <span className="text-4xl font-black text-white tracking-tight">{studentStats?.studentName}</span>
                    </div>
                </div>
                <div className="relative z-10 text-left bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
                    <span className="block text-xs text-slate-500 font-black mb-2 uppercase tracking-[0.3em]">رقم السجل المدني</span>
                    <span className="text-3xl font-black font-mono text-emerald-500 tracking-[0.25em]">{selectedStudentId}</span>
                </div>
            </div>

            {/* STATS TILES */}
            <div className="grid grid-cols-3 gap-8 mb-16">
                <div className="p-8 border-2 border-slate-100 rounded-[2rem] bg-slate-50 text-center group hover:bg-white hover:border-emerald-400 hover:shadow-2xl transition-all duration-500">
                    <span className="block text-xs text-slate-400 font-black mb-3 uppercase tracking-widest">إجمالي الحضور</span>
                    <span className="text-5xl font-black text-slate-800 group-hover:text-emerald-700">{studentStats?.totalDays}</span>
                    <span className="block mt-2 text-slate-400 font-bold">أيام مسجلة</span>
                </div>
                <div className="p-8 border-2 border-red-50 rounded-[2rem] bg-red-50/20 text-center group hover:bg-red-50 hover:border-red-400 hover:shadow-2xl transition-all duration-500">
                    <span className="block text-xs text-red-400 font-black mb-3 uppercase tracking-widest">التأخرات الصباحية</span>
                    <span className="text-5xl font-black text-red-700">{studentStats?.lateDays}</span>
                    <span className="block mt-2 text-red-400 font-bold">مرات تأخر</span>
                </div>
                <div className="p-8 border-2 border-emerald-50 rounded-[2rem] bg-emerald-50/20 text-center group hover:bg-emerald-600 hover:shadow-2xl transition-all duration-500">
                    <span className="block text-xs text-emerald-500 font-black mb-3 group-hover:text-emerald-100 uppercase tracking-widest">إجمالي الدقائق</span>
                    <span className="text-5xl font-black text-emerald-800 group-hover:text-white">{studentStats?.totalDelayMinutes}</span>
                    <span className="block mt-2 text-emerald-600 group-hover:text-emerald-100 font-bold">دقيقة تأخير</span>
                </div>
            </div>

            {/* DETAILED LOG */}
            <div className="mb-16">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                    <span className="w-1.5 h-10 bg-emerald-600 rounded-full"></span>
                    بيانات السجل اليومي التفصيلي
                </h3>
                <div className="rounded-[2.5rem] overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-200/50 border-b-2 border-slate-200">
                                <th className="p-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">م</th>
                                <th className="p-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">تاريخ السجل</th>
                                <th className="p-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">وقت الوصول</th>
                                <th className="p-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">الحالة الإدارية</th>
                                <th className="p-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">مدة التأخر</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentRecords.map((r, idx) => (
                                <tr key={idx} className={`border-b border-white/50 last:border-0 hover:bg-white transition-colors ${r.delayMinutes > 0 ? "bg-red-50/30" : "bg-emerald-50/5"}`}>
                                    <td className="p-6 text-center text-sm font-black text-slate-300">{idx + 1}</td>
                                    <td className="p-6 text-right text-sm font-black text-slate-800">{r.date}</td>
                                    <td className="p-6 text-center text-sm font-mono text-emerald-700 font-bold">{r.arrivalTime}</td>
                                    <td className="p-6 text-center">
                                        {r.delayMinutes > 0 ? (
                                            <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ring-1 ring-red-200">تأخر صباحي</span>
                                        ) : (
                                            <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ring-1 ring-emerald-200">انضباط تام</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-center text-sm font-black text-slate-900">
                                        {r.delayMinutes > 0 ? formatMinutes(r.delayMinutes) : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADVISORY BOX */}
            <div className="p-10 border-4 border-emerald-100 rounded-[2.5rem] bg-emerald-50/40 text-base leading-relaxed text-slate-800 relative overflow-hidden mb-20">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] grayscale pointer-events-none">
                    <img src={LOGO_URL} alt="watermark" className="w-64" />
                </div>
                <p className="font-black text-emerald-900 text-xl mb-4 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    إشادة وتوصية إدارية:
                </p>
                <p className="font-bold text-lg">نحيطكم علماً بأن الطالب الموضح بياناته أعلاه هو محل اهتمامنا الدائم. يهدف هذا البيان لتعزيز قنوات التواصل بين المدرسة والأسرة لمتابعة انضباط الطالب وضمان حضوره المبكر للطابور الصباحي، لما لذلك من أثر مباشر على التحصيل العلمي والسلوك الانضباطي.</p>
            </div>

            {/* SIGNATURES SECTION */}
            <div className="mt-32 flex justify-between items-end px-16 font-black text-slate-800">
                <div className="text-center space-y-20">
                    <div className="space-y-2">
                        <p className="text-xl">وكيل شؤون الطلاب</p>
                        <p className="text-slate-400 text-sm font-normal">أ/ ............................</p>
                    </div>
                    <p className="text-slate-200 font-normal">............................</p>
                </div>
                
                {/* SEAL */}
                <div className="text-center mb-4 opacity-10 rotate-12 grayscale select-none pointer-events-none">
                    <div className="w-44 h-44 border-[8px] border-double border-slate-600 rounded-full flex items-center justify-center text-slate-800 text-[10px] leading-tight font-black p-4">
                        <div className="text-center">
                            <p>المملكة العربية السعودية</p>
                            <p className="my-2 border-y-2 border-slate-400 py-1 font-mono tracking-widest">CERTIFIED OFFICIAL</p>
                            <p>مدرسة حمزة بن عبدالمطلب</p>
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-20">
                    <div className="space-y-2">
                        <p className="text-xl">مدير المدرسة</p>
                        <p className="text-slate-400 text-sm font-normal">أ/ ............................</p>
                    </div>
                    <p className="text-slate-200 font-normal">............................</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
