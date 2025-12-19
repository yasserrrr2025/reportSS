
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
    if (window.confirm("سيتم اعتماد هذه الحالات وإخفاؤها من القائمة. هل أنت متأكد؟")) {
      selectedIds.forEach(id => {
        const student = candidates.find(c => c.id === id);
        if (student) {
          const dates = student.records.map(r => r.date);
          onMarkNotified(id, dates);
        }
      });
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control UI */}
      <div className="no-print bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div>
          <button onClick={onBack} className="text-slate-400 hover:text-emerald-700 flex items-center gap-2 font-bold mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للوحة التحكم
          </button>
          <h2 className="text-xl font-black text-slate-800">إشعارات أولياء الأمور</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} disabled={selectedIds.length === 0} className={`px-6 py-2 rounded-xl shadow-md transition font-bold ${selectedIds.length === 0 ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
            طباعة المختار ({selectedIds.length})
          </button>
          <button onClick={handleFinalize} disabled={selectedIds.length === 0} className={`px-6 py-2 rounded-xl border-2 transition font-bold ${selectedIds.length === 0 ? 'border-slate-100 text-slate-300' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>
            اعتماد الحالات
          </button>
        </div>
      </div>

      <div className="no-print bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 w-12 text-center">
                <input type="checkbox" checked={selectedIds.length === candidates.length && candidates.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded text-emerald-600" />
              </th>
              <th className="p-4 font-bold text-slate-600 text-sm">اسم الطالب</th>
              <th className="p-4 font-bold text-slate-600 text-sm text-center">عدد التأخرات</th>
              <th className="p-4 font-bold text-slate-600 text-sm">الصف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="p-4 text-center">
                  <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleSelect(c.id)} className="w-4 h-4 rounded text-emerald-600" />
                </td>
                <td className="p-4 font-bold text-slate-800">{c.name}</td>
                <td className="p-4 text-center font-black text-red-600">{c.records.length}</td>
                <td className="p-4 text-slate-500 text-sm">{studentMap.get(c.id)?.className || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Printing Template */}
      <div className="hidden print:block">
        {candidates.filter(c => selectedIds.includes(c.id)).map((student, sIdx) => {
          const meta = studentMap.get(student.id);
          const tableChunks = [];
          for (let i = 0; i < student.records.length; i += 6) {
            tableChunks.push(student.records.slice(i, i + 6));
          }

          return (
            <div key={student.id} className="bg-white p-0" style={{ pageBreakBefore: sIdx > 0 ? 'always' : 'auto', pageBreakAfter: 'auto' }}>
              <div className="flex justify-between items-start mb-2" style={{ fontSize: '8pt' }}>
                 <div className="font-bold">
                   <p>المملكة العربية السعودية</p>
                   <p>وزارة التعليم</p>
                   <p>مدرسة حمزة بن عبدالمطلب</p>
                 </div>
                 <div className="text-center"><img src={LOGO_URL} alt="Logo" className="h-12 mx-auto" /></div>
                 <div className="font-bold text-left">
                    <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                    <p>رقم الإشعار: {student.id.slice(-4)}</p>
                 </div>
              </div>

              <div className="text-center mb-4">
                  <div className="w-full border-t-2 border-black mb-1"></div>
                  <h1 className="font-black" style={{ fontSize: '14pt' }}>إشعار ولي أمر طالب متأخر</h1>
                  <div className="w-full border-t-2 border-black mt-1"></div>
              </div>

              <div className="space-y-4" style={{ fontSize: '9pt' }}>
                  <div className="flex justify-between items-center">
                    <p className="font-bold">المكرم ولي أمر الطالب : <span className="font-black border-b-2 border-black px-4" style={{ fontSize: '13pt', color: '#000000' }}>{student.name}</span> المحترم</p>
                    <p className="font-black">حفظه الله</p>
                  </div>
                  <div className="font-bold flex gap-6">
                    <p>الصف الدراسي: <span className="border-b border-black px-4">{meta?.className || "—"}</span></p>
                    <p>الفصل: <span className="border-b border-black px-4">{meta?.section || "—"}</span></p>
                  </div>
                  <p className="font-bold">السلام عليكم ورحمة الله وبركاته وبعد ،،</p>
                  <p className="leading-relaxed font-bold text-justify">نود إفادتكم بأن ابنكم المذكور أعلاه قد تكرر تأخره عن الحضور للمدرسة (الطابور الصباحي) في الأيام الموضحة أدناه، ونأمل منكم التكرم بمتابعة أسباب هذا التأخير:</p>
              </div>

              <div className="mt-4 flex gap-4">
                  {tableChunks.slice(0, 2).map((chunk, chunkIdx) => (
                    <div key={chunkIdx} className="flex-1">
                      <table className="w-full text-center border-2 border-black" style={{ fontSize: '8pt' }}>
                        <thead className="bg-gray-100"><tr className="border-b-2 border-black">
                          <th className="p-1 border-l-2 border-black">م</th>
                          <th className="p-1 border-l-2 border-black">التاريخ</th>
                          <th className="p-1 border-l-2 border-black">الحضور</th>
                          <th className="p-1">المدة</th>
                        </tr></thead>
                        <tbody>{chunk.map((r, rIdx) => (
                          <tr key={rIdx} className="border-b border-black last:border-0">
                            <td className="p-1 border-l-2 border-black">{(chunkIdx * 6) + rIdx + 1}</td>
                            <td className="p-1 border-l-2 border-black font-mono">{r.date}</td>
                            <td className="p-1 border-l-2 border-black font-mono">{r.arrivalTime}</td>
                            <td className="p-1 font-bold">{r.delayMinutes}د</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  ))}
              </div>

              <div className="mt-4 p-2 border border-black text-center font-bold bg-gray-50" style={{ fontSize: '8pt' }}>نحيطكم علماً بأن تكرار التأخر يؤدي إلى حسم درجات من بند (المواظبة) وفق لائحة السلوك والمواظبة.</div>

              <div className="mt-6 border-2 border-black p-3 relative" style={{ fontSize: '9pt' }}>
                  <p className="absolute -top-3 right-4 bg-white px-2 font-black">إفادة ولي الأمر</p>
                  <div className="space-y-4 pt-1">
                      <p className="font-bold underline">أسباب التأخير المتكرر:</p>
                      <div className="border-b border-dotted border-gray-500 h-6"></div>
                      <div className="border-b border-dotted border-gray-500 h-6"></div>
                      <div className="flex justify-between items-end mt-4 font-bold">
                          <div className="space-y-2">
                             <p>الاسم: ........................................... التوقيع: ...........................................</p>
                          </div>
                          <div><p>رقم الجوال: ...........................................</p></div>
                      </div>
                  </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-8 text-center font-black" style={{ fontSize: '10pt' }}>
                  <div><p className="border-b border-black pb-1 mb-12 inline-block w-40">الموجه الطلابي</p></div>
                  <div className="flex justify-center"><div className="w-20 h-20 border-2 border-gray-400 rounded-full flex items-center justify-center rotate-12 opacity-30 text-[7pt]">ختم المدرسة</div></div>
                  <div><p className="border-b border-black pb-1 mb-12 inline-block w-40">مدير المدرسة</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParentNotifications;
