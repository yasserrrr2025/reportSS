
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
      {/* واجهة التحكم العادية (غير مطبوعة) */}
      <div className="no-print bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div>
          <button onClick={onBack} className="text-slate-400 hover:text-emerald-700 flex items-center gap-2 font-bold mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للوحة التحكم
          </button>
          <h2 className="text-xl font-black text-slate-800">توليد إشعارات أولياء الأمور</h2>
          <p className="text-xs text-slate-500 font-bold">نموذج احترافي يحاكي الخطابات الرسمية لوزارة التعليم</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2 rounded-xl shadow-md transition flex items-center gap-2 font-bold ${selectedIds.length === 0 ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            طباعة الإشعارات ({selectedIds.length})
          </button>
          <button 
            onClick={handleFinalize}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2 rounded-xl border-2 transition font-bold ${selectedIds.length === 0 ? 'border-slate-100 text-slate-300' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
          >
            اعتماد وإغلاق الحالات
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
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-700">{c.records.length}</span>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">{meta?.className || "—"} / {meta?.section || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* قالب الطباعة الاحترافي */}
      <div className="hidden print:block">
        {candidates.filter(c => selectedIds.includes(c.id)).map((student, sIdx) => {
          const meta = studentMap.get(student.id);
          // تقسيم السجلات إلى مجموعات من 6
          const rightTableRecords = student.records.slice(0, 6);
          const leftTableRecords = student.records.length > 6 ? student.records.slice(6, 12) : [];
          
          return (
            <div key={student.id} className={`bg-white min-h-[29cm] relative p-4 ${sIdx > 0 ? 'page-break' : ''}`} style={{ direction: 'rtl' }}>
              {/* الترويسة العلوية */}
              <div className="flex justify-between items-start mb-2" style={{ fontSize: '8pt' }}>
                 <div className="font-bold space-y-0.5">
                   <p>المملكة العربية السعودية</p>
                   <p>وزارة التعليم</p>
                   <p>إدارة التعليم بمنطقة ...........</p>
                   <p>مدرسة حمزة بن عبدالمطلب</p>
                 </div>
                 <div className="text-center">
                    <img src={LOGO_URL} alt="Logo" className="h-14 mx-auto mb-1" />
                 </div>
                 <div className="font-bold space-y-0.5 text-left">
                    <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                    <p>رقم الإشعار: {student.id.slice(-4)}</p>
                 </div>
              </div>

              {/* العنوان والخط الفاصل */}
              <div className="text-center mt-4">
                  <div className="w-full border-t-2 border-black mb-2"></div>
                  <h1 className="text-lg font-black" style={{ fontSize: '14pt' }}>إشعار ولي أمر طالب متأخر</h1>
                  <div className="w-full border-t-2 border-black mt-2"></div>
              </div>

              {/* متن الخطاب */}
              <div className="mt-8 space-y-4" style={{ fontSize: '8pt' }}>
                  <div className="flex justify-between items-center">
                    <p className="font-bold" style={{ fontSize: '11pt' }}>
                        المكرم ولي أمر الطالب : <span className="font-black border-b-2 border-black px-4">{student.name}</span> المحترم
                    </p>
                    <p className="font-black" style={{ fontSize: '11pt' }}>حفظه الله</p>
                  </div>
                  
                  <div className="font-bold">
                    <p>الصف الدراسي: <span className="border-b border-black px-2">{meta?.className || "—"}</span> &nbsp;&nbsp; الفصل: <span className="border-b border-black px-2">{meta?.section || "—"}</span></p>
                  </div>

                  <p className="font-bold mt-4">السلام عليكم ورحمة الله وبركاته وبعد ،،</p>
                  <p className="leading-loose font-bold">نود إفادتكم بأن ابنكم المذكور أعلاه قد تكرر تأخره عن الحضور للمدرسة (الطابور الصباحي) في الأيام الموضحة أدناه، ونظراً لأهمية الحضور المبكر لما له من أثر إيجابي على التحصيل العلمي، نأمل منكم التكرم بمتابعة أسباب هذا التأخير:</p>
              </div>

              {/* الجداول الديناميكية المتجاورة */}
              <div className="mt-6 flex gap-4">
                  {/* الجدول اليمين (الأول) */}
                  <div className="flex-1">
                      <table className="w-full text-center border-2 border-black">
                          <thead className="bg-gray-100">
                              <tr className="border-b-2 border-black">
                                  <th className="p-1 border-l-2 border-black w-8">م</th>
                                  <th className="p-1 border-l-2 border-black">تاريخ التأخر</th>
                                  <th className="p-1 border-l-2 border-black">وقت الوصول</th>
                                  <th className="p-1">المدة</th>
                              </tr>
                          </thead>
                          <tbody>
                              {rightTableRecords.map((r, i) => (
                                  <tr key={i} className="border-b border-black">
                                      <td className="p-1 border-l-2 border-black font-bold">{i + 1}</td>
                                      <td className="p-1 border-l-2 border-black font-mono">{r.date}</td>
                                      <td className="p-1 border-l-2 border-black font-mono">{r.arrivalTime}</td>
                                      <td className="p-1 font-bold">{r.delayMinutes}د</td>
                                  </tr>
                              ))}
                              {/* تكملة الصفوف الفارغة لضمان ثبات الشكل */}
                              {Array.from({ length: 6 - rightTableRecords.length }).map((_, i) => (
                                  <tr key={`empty-r-${i}`} className="border-b border-black h-6">
                                      <td className="border-l-2 border-black">&nbsp;</td>
                                      <td className="border-l-2 border-black"></td>
                                      <td className="border-l-2 border-black"></td>
                                      <td></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>

                  {/* الجدول اليسار (الثاني - يظهر فقط إذا زاد العدد عن 6) */}
                  <div className="flex-1">
                      <table className="w-full text-center border-2 border-black">
                          <thead className="bg-gray-100">
                              <tr className="border-b-2 border-black">
                                  <th className="p-1 border-l-2 border-black w-8">م</th>
                                  <th className="p-1 border-l-2 border-black">تاريخ التأخر</th>
                                  <th className="p-1 border-l-2 border-black">وقت الوصول</th>
                                  <th className="p-1">المدة</th>
                              </tr>
                          </thead>
                          <tbody>
                              {leftTableRecords.map((r, i) => (
                                  <tr key={i} className="border-b border-black">
                                      <td className="p-1 border-l-2 border-black font-bold">{i + 7}</td>
                                      <td className="p-1 border-l-2 border-black font-mono">{r.date}</td>
                                      <td className="p-1 border-l-2 border-black font-mono">{r.arrivalTime}</td>
                                      <td className="p-1 font-bold">{r.delayMinutes}د</td>
                                  </tr>
                              ))}
                              {/* تكملة الصفوف الفارغة */}
                              {Array.from({ length: 6 - leftTableRecords.length }).map((_, i) => (
                                  <tr key={`empty-l-${i}`} className="border-b border-black h-6">
                                      <td className="border-l-2 border-black">&nbsp;</td>
                                      <td className="border-l-2 border-black"></td>
                                      <td className="border-l-2 border-black"></td>
                                      <td></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* تنبيه لائحة السلوك */}
              <div className="mt-4 p-2 bg-gray-50 border border-black text-center font-bold" style={{ fontSize: '7.5pt' }}>
                  نحيطكم علماً بأن تكرار التأخر يؤدي إلى حسم درجات من بند (المواظبة) وفق لائحة السلوك والمواظبة، ونهيب بكم الحرص على تواجد الطالب بالمدرسة بحد أقصى الساعة 7:15 صباحاً.
              </div>

              {/* قسم إفادة ولي الأمر */}
              <div className="mt-8 border-2 border-black p-3 relative" style={{ fontSize: '8pt' }}>
                  <p className="absolute -top-3 right-4 bg-white px-2 font-black">إفادة ولي الأمر</p>
                  <div className="space-y-4 pt-2">
                      <p className="font-bold">أسباب التأخير المتكرر:</p>
                      <div className="border-b border-dotted border-gray-400 h-6 w-full"></div>
                      <div className="border-b border-dotted border-gray-400 h-6 w-full"></div>
                      <div className="flex justify-between items-end mt-8">
                          <div className="space-y-2">
                             <p>الاسم: ...........................................................</p>
                             <p>التوقيع: .........................................................</p>
                          </div>
                          <div className="text-left">
                             <p>رقم الجوال: ...................................................</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* التوقيعات الرسمية */}
              <div className="mt-auto pt-16 grid grid-cols-3 gap-8 text-center font-black" style={{ fontSize: '9pt' }}>
                  <div>
                      <p className="border-b border-black pb-1 mb-16 inline-block w-40">الموجه الطلابي</p>
                      <p>.......................................</p>
                  </div>
                  <div className="flex flex-col items-center justify-center opacity-30 select-none">
                      <div className="w-24 h-24 border-4 border-double border-gray-400 rounded-full flex items-center justify-center rotate-12">
                         <span className="text-[7pt]">ختم المدرسة</span>
                      </div>
                  </div>
                  <div>
                      <p className="border-b border-black pb-1 mb-16 inline-block w-40">مدير المدرسة</p>
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
