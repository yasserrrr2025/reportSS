
import React, { useMemo, useState } from 'react';
import { StudentRecord, StudentMetadata } from '../types';
import { LOGO_URL } from '../constants';

interface Props {
  data: StudentRecord[];
  students: StudentMetadata[];
  onMarkNotified: (studentId: string, dates: string[]) => void;
  onBack: () => void;
}

const ParentNotifications: React.FC<Props> = ({ data, students, onMarkNotified, onBack }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);

  const studentMap = useMemo(() => {
    return new Map(students.map(s => [s.id, s]));
  }, [students]);

  // Group un-notified delays by student
  const candidates = useMemo(() => {
    const map = new Map<string, { id: string; name: string; records: StudentRecord[] }>();
    data.forEach(r => {
      if (r.delayMinutes > 0 && !r.notified) {
        if (!map.has(r.id)) {
          map.set(r.id, { id: r.id, name: r.name, records: [] });
        }
        map.get(r.id)!.records.push(r);
      }
    });

    // عرض الطلاب الذين لديهم 3 تأخرات فأكثر (بحد أقصى 12 للعرض في صفحة واحدة)
    return Array.from(map.values())
      .filter(s => s.records.length >= 3)
      .sort((a, b) => b.records.length - a.records.length);
  }, [data]);

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map(c => c.id));
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleFinalize = () => {
    if (window.confirm("سيتم وضع علامة 'تم التبليغ' على هذه السجلات ولن تظهر في قائمة الإشعارات مرة أخرى. هل أنت متأكد؟")) {
      selectedIds.forEach(id => {
        const student = candidates.find(c => c.id === id);
        if (student) {
          const dates = student.records.map(r => r.date);
          onMarkNotified(id, dates);
        }
      });
      setSelectedIds([]);
      alert("تم إغلاق الحالات بنجاح");
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="no-print bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div>
          <button onClick={onBack} className="text-slate-400 hover:text-emerald-700 flex items-center gap-2 font-bold mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للوحة التحكم
          </button>
          <h2 className="text-xl font-black text-slate-800">توليد إشعارات أولياء الأمور</h2>
          <p className="text-xs text-slate-500 font-bold">يتم عرض الطلاب الذين لديهم 3 تأخرات فأكثر</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2 rounded-xl shadow-md transition flex items-center gap-2 font-bold ${selectedIds.length === 0 ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة الإشعارات المختارة ({selectedIds.length})
          </button>
          
          <button 
            onClick={handleFinalize}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2 rounded-xl border-2 transition flex items-center gap-2 font-bold ${selectedIds.length === 0 ? 'border-slate-100 text-slate-300' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            اعتماد وإغلاق الحالات
          </button>
        </div>
      </div>

      {/* Candidate List */}
      <div className="no-print bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 w-12 text-center">
                <input type="checkbox" checked={selectedIds.length === candidates.length && candidates.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded text-emerald-600" />
              </th>
              <th className="p-4 font-bold text-slate-600 text-sm">اسم الطالب</th>
              <th className="p-4 font-bold text-slate-600 text-sm">رقم الهوية</th>
              <th className="p-4 font-bold text-slate-600 text-sm text-center">عدد التأخرات</th>
              <th className="p-4 font-bold text-slate-600 text-sm">تاريخ آخر تأخر</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.length > 0 ? candidates.map(c => (
              <tr key={c.id} className={`hover:bg-slate-50 transition ${selectedIds.includes(c.id) ? 'bg-emerald-50/30' : ''}`}>
                <td className="p-4 text-center">
                  <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => {}} onClick={(e) => { e.stopPropagation(); handleSelect(c.id); }} className="w-4 h-4 rounded text-emerald-600 cursor-pointer" />
                </td>
                <td className="p-4 font-bold text-slate-800">{c.name}</td>
                <td className="p-4 font-mono text-slate-500">{c.id}</td>
                <td className="p-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-700">
                    {c.records.length} تأخرات
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-sm">{c.records[0].date}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-16 text-center">
                   <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                   </div>
                   <p className="text-slate-400 font-bold">لا يوجد طلاب مستحقين للإشعار حالياً</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Printing Templates - Faithful to the provided image */}
      <div className="hidden print:block space-y-0">
        {candidates.filter(c => selectedIds.includes(c.id)).map((student, sIdx) => {
          const meta = studentMap.get(student.id);
          const leftTable = student.records.slice(0, 6);
          const rightTable = student.records.length > 6 ? student.records.slice(6, 12) : [];
          
          return (
            <div key={student.id} className={`bg-white p-12 min-h-[29.7cm] relative border-[8px] border-double border-slate-900 ${sIdx > 0 ? 'page-break-before' : ''}`} style={{ pageBreakBefore: 'always', fontSize: '8pt' }}>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                 <div className="text-right space-y-0.5 font-bold">
                   <p>المملكة العربية السعودية</p>
                   <p>وزارة التعليم</p>
                   <p>مدرسة حمزة بن عبدالمطلب</p>
                 </div>
                 <div className="text-center flex flex-col items-center">
                   <img src={LOGO_URL} alt="Logo" className="h-16 mb-2" />
                   <h1 className="text-xl font-black border-b-2 border-slate-900 px-4 pb-1">إشعار ولي أمر طالب متأخر</h1>
                 </div>
                 <div className="text-left font-bold">
                    <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                    <p>رقم الإشعار: {student.id.slice(-4)}-{new Date().getMonth()+1}</p>
                 </div>
              </div>

              {/* Student Info */}
              <div className="text-right space-y-4 font-bold mt-8 mb-6">
                 <div className="flex justify-between items-center text-[12pt]">
                    <p>المكرم ولي أمر الطالب : <span className="border-b-2 border-slate-900 px-4 font-black">{student.name}</span></p>
                    <p>حفظه الله</p>
                 </div>
                 <p className="text-[10pt]">الصف: <span className="border-b border-slate-800 px-4">{meta?.className || "—"}</span> الفصل: <span className="border-b border-slate-800 px-4">{meta?.section || "—"}</span></p>
                 <p className="leading-relaxed mt-4">السلام عليكم ورحمة الله وبركاته وبعد ،،</p>
                 <p className="leading-relaxed">نود إفادتكم بأن ابنكم المذكور أعلاه قد تكرر تأخره عن الحضور للمدرسة (الطابور الصباحي) في الأيام الموضحة أدناه، ونظراً لأهمية الحضور المبكر لما له من أثر إيجابي على التحصيل العلمي، نأمل منكم التكرم بمتابعة أسباب هذا التأخير:</p>
              </div>

              {/* Dynamic Tables Layout */}
              <div className="flex gap-4 mb-6">
                 {/* Table 1 (Right/First) */}
                 <div className="flex-1">
                   <table className="w-full border-collapse border-2 border-slate-900 text-center">
                     <thead>
                       <tr className="bg-slate-100">
                         <th className="border-2 border-slate-900 p-1 w-8">م</th>
                         <th className="border-2 border-slate-900 p-1">تاريخ التأخر</th>
                         <th className="border-2 border-slate-900 p-1">وقت الوصول</th>
                         <th className="border-2 border-slate-900 p-1">مدة التأخير</th>
                       </tr>
                     </thead>
                     <tbody>
                       {leftTable.map((r, rIdx) => (
                         <tr key={rIdx}>
                           <td className="border-2 border-slate-900 p-1">{rIdx + 1}</td>
                           <td className="border-2 border-slate-900 p-1 font-mono">{r.date}</td>
                           <td className="border-2 border-slate-900 p-1 font-mono">{r.arrivalTime}</td>
                           <td className="border-2 border-slate-900 p-1 font-bold">{r.delayMinutes} دقيقة</td>
                         </tr>
                       ))}
                       {/* Fill empty rows to maintain height if needed */}
                       {[...Array(Math.max(0, 6 - leftTable.length))].map((_, i) => (
                         <tr key={`empty-l-${i}`}><td className="border-2 border-slate-900 p-1">&nbsp;</td><td className="border-2 border-slate-900 p-1"></td><td className="border-2 border-slate-900 p-1"></td><td className="border-2 border-slate-900 p-1"></td></tr>
                       ))}
                     </tbody>
                   </table>
                 </div>

                 {/* Table 2 (Left/Second) - only visible/populated if delays > 6 */}
                 {student.records.length > 6 && (
                   <div className="flex-1">
                     <table className="w-full border-collapse border-2 border-slate-900 text-center">
                       <thead>
                         <tr className="bg-slate-100">
                           <th className="border-2 border-slate-900 p-1 w-8">م</th>
                           <th className="border-2 border-slate-900 p-1">تاريخ التأخر</th>
                           <th className="border-2 border-slate-900 p-1">وقت الوصول</th>
                           <th className="border-2 border-slate-900 p-1">مدة التأخير</th>
                         </tr>
                       </thead>
                       <tbody>
                         {rightTable.map((r, rIdx) => (
                           <tr key={rIdx}>
                             <td className="border-2 border-slate-900 p-1">{rIdx + 7}</td>
                             <td className="border-2 border-slate-900 p-1 font-mono">{r.date}</td>
                             <td className="border-2 border-slate-900 p-1 font-mono">{r.arrivalTime}</td>
                             <td className="border-2 border-slate-900 p-1 font-bold">{r.delayMinutes} دقيقة</td>
                           </tr>
                         ))}
                         {[...Array(Math.max(0, 6 - rightTable.length))].map((_, i) => (
                           <tr key={`empty-r-${i}`}><td className="border-2 border-slate-900 p-1">&nbsp;</td><td className="border-2 border-slate-900 p-1"></td><td className="border-2 border-slate-900 p-1"></td><td className="border-2 border-slate-900 p-1"></td></tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
              </div>

              <div className="text-right font-bold leading-relaxed mb-6 bg-slate-50 p-4 border-2 border-slate-900 rounded-xl">
                 <p>نحيطكم علماً بأن تكرار التأخر يؤدي إلى حسم درجات من بند (المواظبة) وفق لائحة السلوك والمواظبة، ونهيب بكم الحرص على تواجد الطالب بالمدرسة بحد أقصى الساعة 7:15 صباحاً.</p>
              </div>

              {/* Guardian Feedback Section */}
              <div className="border-2 border-slate-900 p-4 mb-8 rounded-xl bg-white shadow-inner">
                <div className="text-center font-black border-b-2 border-slate-900 pb-2 mb-4 text-[10pt]">إفادة ولي الأمر</div>
                <div className="space-y-4">
                  <p className="font-bold">أسباب التأخير المتكرر:</p>
                  <div className="border-b border-dotted border-slate-400 h-8"></div>
                  <div className="border-b border-dotted border-slate-400 h-8"></div>
                  <div className="flex justify-between items-end mt-8">
                     <div className="text-right space-y-2">
                        <p>الاسم: ...........................................................</p>
                        <p>التوقيع: .........................................................</p>
                     </div>
                     <div className="text-left">
                        <p>رقم الجوال: ...................................................</p>
                     </div>
                  </div>
                </div>
              </div>

              {/* Official Signatures */}
              <div className="grid grid-cols-3 gap-8 mt-auto pt-10 text-center font-black">
                 <div className="space-y-16">
                    <p className="underline underline-offset-8">الموجه الطلابي</p>
                    <p>.......................................</p>
                 </div>
                 <div className="flex flex-col items-center justify-center opacity-30 select-none">
                    <div className="w-28 h-28 border-4 border-double border-slate-400 rounded-full flex items-center justify-center rotate-12">
                      <span className="text-[9pt] text-center font-black">ختم<br/>المدرسة</span>
                    </div>
                 </div>
                 <div className="space-y-16">
                    <p className="underline underline-offset-8">مدير المدرسة</p>
                    <p>.......................................</p>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @media print {
          body { background-color: white !important; }
          .page-break-before { page-break-before: always !important; }
          @page { margin: 0.5cm; size: A4 portrait; }
        }
      `}</style>
    </div>
  );
};

export default ParentNotifications;
