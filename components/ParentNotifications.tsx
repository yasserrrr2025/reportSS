
import React, { useMemo, useState } from 'react';
import { StudentRecord } from '../types';
import { LOGO_URL } from '../constants';

interface Props {
  data: StudentRecord[];
  onMarkNotified: (studentId: string, dates: string[]) => void;
  onBack: () => void;
}

const ParentNotifications: React.FC<Props> = ({ data, onMarkNotified, onBack }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);

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

    // Filter students with 3 or more un-notified delays
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
          <p className="text-xs text-slate-500 font-bold">يتم عرض الطلاب الذين لديهم (3) تأخرات أو أكثر ولم يتم إصدار إشعار لهم بعد</p>
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
              <th className="p-4 font-bold text-slate-600 text-sm text-center">عدد التأخرات غير المبلّغ عنها</th>
              <th className="p-4 font-bold text-slate-600 text-sm">تاريخ آخر تأخر</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.length > 0 ? candidates.map(c => (
              <tr key={c.id} className={`hover:bg-slate-50 transition ${selectedIds.includes(c.id) ? 'bg-emerald-50/30' : ''}`}>
                <td className="p-4 text-center">
                  <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleSelect} onClick={(e) => { e.stopPropagation(); handleSelect(c.id); }} className="w-4 h-4 rounded text-emerald-600 cursor-pointer" />
                </td>
                <td className="p-4 font-bold text-slate-800">{c.name}</td>
                <td className="p-4 font-mono text-slate-500">{c.id}</td>
                <td className="p-4 text-center">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">
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
                   <p className="text-slate-400 font-bold">لا يوجد طلاب مستحقين للإشعار حالياً (كل التأخرات مبلّغ عنها أو أقل من 3)</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Printing Templates (Hidden in UI) */}
      <div className="hidden print:block space-y-0">
        {candidates.filter(c => selectedIds.includes(c.id)).map((student, sIdx) => (
          <div key={student.id} className={`bg-white p-10 min-h-screen relative border-8 border-double border-slate-300 ${sIdx > 0 ? 'page-break-before' : ''}`} style={{ pageBreakBefore: 'always' }}>
            {/* Header Area */}
            <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
               <h1 className="text-xl font-bold mb-2">إشعار تأخر طالب عن الطابور الصباحي والنشيد الوطني</h1>
               <h2 className="text-lg font-bold">للعام الدراسي {new Date().getFullYear()} هـ</h2>
            </div>

            <div className="flex justify-between items-start mb-8">
               <div className="text-right space-y-1 font-bold">
                 <p>المكرم ولي أمر الطالب : <span className="border-b-2 border-dotted border-slate-800 px-4">{student.name}</span> حفظه الله</p>
               </div>
               <div className="text-left text-xs font-bold text-slate-500">
                  <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
               </div>
            </div>

            {/* Main Message */}
            <div className="text-right leading-relaxed mb-10 font-bold text-slate-800">
              <p className="mb-4">نحيطكم علماً بأن ابنكم تأخر عن الطابور الصباحي بشكل متكرر خلال الفترة من <span className="px-2 border-b border-slate-800">{student.records[student.records.length-1].date}</span> إلى فترة <span className="px-2 border-b border-slate-800">{student.records[0].date}</span> م، وهذا يؤثر على درجات المواظبة للطالب لهذا العام وكذلك لما للتأخر من أثر سلبي على ابنكم فإننا نأمل منكم الحضور في الوقت المحدد ومتابعة أسباب تأخر الطالب بشكل متكرر.</p>
            </div>

            {/* Record Table */}
            <table className="w-full border-collapse border-2 border-slate-800 mb-10">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-800 p-2 text-sm">اسم الطالب</th>
                  <th className="border border-slate-800 p-2 text-sm">السجل المدني</th>
                  <th className="border border-slate-800 p-2 text-sm">تاريخ التأخر</th>
                  <th className="border border-slate-800 p-2 text-sm">وقت الوصول</th>
                  <th className="border border-slate-800 p-2 text-sm">توقيع الطالب</th>
                  <th className="border border-slate-800 p-2 text-sm">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {student.records.map((r, rIdx) => (
                  <tr key={rIdx}>
                    {rIdx === 0 && <td rowSpan={student.records.length} className="border border-slate-800 p-2 text-center font-bold text-xs">{student.name}</td>}
                    {rIdx === 0 && <td rowSpan={student.records.length} className="border border-slate-800 p-2 text-center font-mono text-xs">{student.id}</td>}
                    <td className="border border-slate-800 p-2 text-center font-mono text-xs">{r.date}</td>
                    <td className="border border-slate-800 p-2 text-center font-mono text-xs">{r.arrivalTime}</td>
                    <td className="border border-slate-800 p-2"></td>
                    <td className="border border-slate-800 p-2"></td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-black">
                  <td colSpan={2} className="border border-slate-800 p-2 text-center">مجموع أيام التأخر</td>
                  <td colSpan={4} className="border border-slate-800 p-2 text-right px-10">{student.records.length} أيام</td>
                </tr>
              </tbody>
            </table>

            {/* Feedback Section */}
            <div className="border-2 border-slate-800 mb-10">
              <div className="bg-slate-200 p-2 text-center font-bold border-b-2 border-slate-800">الإفادة</div>
              <div className="p-6 text-right space-y-4 font-bold">
                 <p>المكرم / وكيل شؤون الطلاب</p>
                 <p>نفيدكم بأن تأخر ابننا عن الطابور الصباحي بشكل مستمر كان للأسباب التالية:</p>
                 <div className="border-b border-dotted border-slate-400 h-6"></div>
                 <div className="border-b border-dotted border-slate-400 h-6"></div>
                 <div className="border-b border-dotted border-slate-400 h-6"></div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-3 gap-4 mt-20 text-center font-bold">
               <div className="space-y-10">
                  <p className="underline underline-offset-8">ولي الأمر</p>
                  <p>.......................................</p>
               </div>
               <div className="space-y-10">
                  <p className="underline underline-offset-8">الموجه الطلابي</p>
                  <p>.......................................</p>
               </div>
               <div className="space-y-10">
                  <p className="underline underline-offset-8">مدير المدرسة</p>
                  <p>.......................................</p>
               </div>
            </div>

            {/* Footer Ministry Logo */}
            <div className="absolute bottom-10 left-10">
               <img src={LOGO_URL} alt="Logo" className="h-16 opacity-30 grayscale" />
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        @media print {
          body { background-color: white !important; }
          .page-break-before { page-break-before: always !important; }
          @page { margin: 0.5cm; }
        }
      `}</style>
    </div>
  );
};

export default ParentNotifications;
