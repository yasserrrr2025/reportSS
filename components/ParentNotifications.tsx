
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
      {/* UI Control Bar */}
      <div className="no-print bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div>
          <button onClick={onBack} className="text-slate-400 hover:text-emerald-700 flex items-center gap-2 font-bold mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للوحة التحكم
          </button>
          <h2 className="text-xl font-black text-slate-800">توليد إشعارات أولياء الأمور</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2 rounded-xl shadow-md transition font-bold ${selectedIds.length === 0 ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            طباعة الإشعارات ({selectedIds.length})
          </button>
          <button 
            onClick={handleFinalize}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2 rounded-xl border-2 transition font-bold ${selectedIds.length === 0 ? 'border-slate-100 text-slate-300' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
          >
            اعتماد الحالات
          </button>
        </div>
      </div>

      {/* List for selection */}
      <div className="no-print bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 w-12 text-center">
                <input type="checkbox" checked={selectedIds.length === candidates.length && candidates.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded text-emerald-600" />
              </th>
              <th className="p-4 font-bold text-slate-600 text-sm">اسم الطالب</th>
              <th className="p-4 font-bold text-slate-600 text-sm text-center">عدد التأخرات</th>
              <th className="p-4 font-bold text-slate-600 text-sm">الصف الدراسي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map(c => {
              const meta = studentMap.get(c.id);
              return (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-center">
                    <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleSelect(c.id)} className="w-4 h-4 rounded text-emerald-600 cursor-pointer" />
                  </td>
                  <td className="p-4 font-bold text-slate-800">{c.name}</td>
                  <td className="p-4 text-center font-black text-red-600">{c.records.length}</td>
                  <td className="p-4 text-slate-500 text-sm">{meta?.className || "—"} / {meta?.section || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Professional Printing Template */}
      <div className="hidden print:block">
        {candidates.filter(c => selectedIds.includes(c.id)).map((student, sIdx) => {
          const meta = studentMap.get(student.id);
          
          // تقسيم ذكي للسجلات: 6 سجلات لكل جدول متجاور
          const tableChunks = [];
          for (let i = 0; i < student.records.length; i += 6) {
            tableChunks.push(student.records.slice(i, i + 6));
          }

          return (
            <div key={student.id} className={`bg-white min-h-[29.7cm] p-0 mb-4 ${sIdx > 0 ? 'page-break-before-always' : ''}`} style={{ pageBreakBefore: sIdx > 0 ? 'always' : 'auto' }}>
              {/* Header */}
              <div className="flex justify-between items-start mb-2" style={{ fontSize: '8pt' }}>
                 <div className="font-bold space-y-0.5">
                   <p>المملكة العربية السعودية</p>
                   <p>وزارة التعليم</p>
                   <p>مدرسة حمزة بن عبدالمطلب</p>
                 </div>
                 <div className="text-center">
                    <img src={LOGO_URL} alt="Logo" className="h-14 mx-auto mb-1" />
                 </div>
                 <div className="font-bold space-y-0.5 text-left">
                    <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                    <p>رقم الإشعار: {student.id.slice(-4)}-{new Date().getMonth()+1}</p>
                 </div>
              </div>

              {/* Title Area */}
              <div className="text-center mb-6">
                  <div className="w-full border-t border-black mb-1"></div>
                  <h1 className="font-black" style={{ fontSize: '13pt' }}>إشعار ولي أمر طالب متأخر</h1>
                  <div className="w-full border-t border-black mt-1"></div>
              </div>

              {/* Body Text */}
              <div className="space-y-4" style={{ fontSize: '8pt' }}>
                  <div className="flex justify-between items-center">
                    <p className="font-bold">
                        المكرم ولي أمر الطالب : <span className="font-black border-b border-black px-4" style={{ fontSize: '12pt' }}>{student.name}</span> المحترم
                    </p>
                    <p className="font-black">حفظه الله</p>
                  </div>
                  
                  <div className="font-bold flex gap-8">
                    <p>الصف الدراسي: <span className="border-b border-black px-4">{meta?.className || "—"}</span></p>
                    <p>الفصل: <span className="border-b border-black px-4">{meta?.section || "—"}</span></p>
                  </div>

                  <p className="font-bold mt-2 leading-relaxed">السلام عليكم ورحمة الله وبركاته وبعد ،،</p>
                  <p className="leading-normal font-bold">نود إفادتكم بأن ابنكم المذكور أعلاه قد تكرر تأخره عن الحضور للمدرسة (الطابور الصباحي) في الأيام الموضحة أدناه، ونظراً لأهمية الحضور المبكر لما له من أثر إيجابي على التحصيل العلمي، نأمل منكم التكرم بمتابعة أسباب هذا التأخير:</p>
              </div>

              {/* Dynamic Side-by-Side Tables */}
              <div className="mt-4 flex gap-4 items-start">
                  {tableChunks.slice(0, 2).map((chunk, chunkIdx) => (
                    <div key={chunkIdx} className="flex-1">
                      <table className="w-full text-center border-2 border-black" style={{ fontSize: '8pt' }}>
                        <thead className="bg-gray-100">
                          <tr className="border-b border-black font-black">
                            <th className="p-1 border-l border-black w-8">م</th>
                            <th className="p-1 border-l border-black">التاريخ</th>
                            <th className="p-1 border-l border-black">وقت الحضور</th>
                            <th className="p-1">مدة التأخير</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chunk.map((r, rIdx) => (
                            <tr key={rIdx} className="border-b border-black last:border-0">
                              <td className="p-1 border-l border-black">{(chunkIdx * 6) + rIdx + 1}</td>
                              <td className="p-1 border-l border-black font-mono">{r.date}</td>
                              <td className="p-1 border-l border-black font-mono">{r.arrivalTime}</td>
                              <td className="p-1 font-bold">{r.delayMinutes} د</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
              </div>

              {/* Reminder Box */}
              <div className="mt-4 p-2 border border-black text-center font-bold bg-gray-50" style={{ fontSize: '7.5pt' }}>
                  نحيطكم علماً بأن تكرار التأخر يؤدي إلى حسم درجات من بند (المواظبة) وفق لائحة السلوك والمواظبة، ونهيب بكم الحرص على تواجد الطالب بالمدرسة بحد أقصى الساعة 7:15 صباحاً.
              </div>

              {/* Feedback Section */}
              <div className="mt-6 border border-black p-3 relative" style={{ fontSize: '8pt' }}>
                  <p className="absolute -top-3 right-4 bg-white px-2 font-black">إفادة ولي الأمر</p>
                  <div className="space-y-3 pt-1">
                      <p className="font-bold underline">أسباب التأخير المتكرر:</p>
                      <div className="border-b border-dotted border-gray-400 h-6"></div>
                      <div className="border-b border-dotted border-gray-400 h-6"></div>
                      <div className="flex justify-between items-end mt-6 font-bold">
                          <div className="space-y-4">
                             <p>الاسم: ...........................................................</p>
                             <p>التوقيع: .........................................................</p>
                          </div>
                          <div className="text-left space-y-4">
                             <p>رقم الجوال: ...................................................</p>
                             <p>&nbsp;</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Official Signatures */}
              <div className="mt-auto pt-10 grid grid-cols-3 gap-8 text-center font-black" style={{ fontSize: '9pt' }}>
                  <div>
                      <p className="border-b border-black pb-1 mb-12 inline-block w-40">الموجه الطلابي</p>
                      <p>.......................................</p>
                  </div>
                  <div className="flex flex-col items-center justify-center opacity-40 select-none grayscale">
                      <div className="w-24 h-24 border-2 border-double border-gray-900 rounded-full flex items-center justify-center rotate-12">
                         <span className="text-[7pt] font-black">ختم المدرسة</span>
                      </div>
                  </div>
                  <div>
                      <p className="border-b border-black pb-1 mb-12 inline-block w-40">مدير المدرسة</p>
                      <p>.......................................</p>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParentNotifications;
