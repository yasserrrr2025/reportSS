
import React, { useState } from 'react';
import { StudentRecord } from '../types';
import { SCHOOL_START_TIME } from '../constants';
import { parseRawText, extractDateFromText } from '../utils/calculations';

declare const pdfjsLib: any;

interface ProcessingFile {
  name: string;
  status: 'waiting' | 'processing' | 'success' | 'error';
  message?: string;
  count?: number;
}

interface Props {
  onUpload: (records: StudentRecord[]) => void;
}

const UploadSection: React.FC<Props> = ({ onUpload }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(SCHOOL_START_TIME);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filesStatus, setFilesStatus] = useState<ProcessingFile[]>([]);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const items = textContent.items as any[];
      const lines: { [y: number]: any[] } = {};
      
      items.forEach(item => {
        const y = Math.round(item.transform[5]);
        if (!lines[y]) lines[y] = [];
        lines[y].push(item);
      });

      const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);
      
      sortedY.forEach(y => {
        const lineItems = lines[y].sort((a, b) => b.transform[4] - a.transform[4]);
        const lineText = lineItems.map(item => item.str).join(' ');
        fullText += lineText + '\n';
      });
    }
    return fullText;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fixed: Explicitly cast to File[] to avoid 'unknown' type errors during processing
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsProcessing(true);
    setFilesStatus(files.map(f => ({ name: f.name, status: 'waiting' })));

    let allRecords: StudentRecord[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setFilesStatus(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f));

      try {
        let text = '';
        if (file.type === 'application/pdf') {
          text = await extractTextFromPdf(file);
        } else {
          text = await file.text();
        }

        if (text.trim().length < 20) {
          throw new Error("ملف فارغ أو غير نصي");
        }

        const detectedDate = extractDateFromText(text);
        const workingDate = detectedDate || date;
        
        const records = parseRawText(text, workingDate, startTime);
        
        if (records.length === 0) {
          setFilesStatus(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', message: 'لم يتم العثور على بيانات' } : f));
        } else {
          allRecords = [...allRecords, ...records];
          setFilesStatus(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'success', count: records.length } : f));
        }
      } catch (err: any) {
        setFilesStatus(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', message: err.message || 'خطأ في المعالجة' } : f));
      }
    }

    if (allRecords.length > 0) {
      setTimeout(() => {
        onUpload(allRecords);
      }, 1500);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-emerald-600">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">تحميل ملفات الحضور</h2>
          <p className="text-slate-500 mt-2 italic text-sm">يمكنك الآن اختيار عدة ملفات PDF وتحديد وقت بداية الدوام لكل دفعة</p>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100 group hover:border-emerald-200 transition-colors">
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-wider">وقت بداية الدوام (لهذه الملفات)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="time" 
                  step="1"
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white border p-2 rounded-lg font-black text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold">* سيتم احتساب التأخير بناءً على هذا الوقت للملفات المرفوعة أدناه.</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-wider">التاريخ الافتراضي</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border p-2 rounded-lg font-black text-slate-800 outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-2 font-bold">* يستخدم فقط إذا لم يتم اكتشاف التاريخ داخل ملف الـ PDF.</p>
            </div>
          </div>

          <div className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all ${isProcessing ? 'bg-slate-50 border-slate-200 pointer-events-none' : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'}`}>
            <input 
              type="file" 
              accept=".pdf" 
              multiple 
              id="file-upload" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <div className="space-y-4">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${isProcessing ? 'bg-white' : 'bg-white shadow-md'}`}>
                {isProcessing ? (
                  <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <div>
                <span className="text-xl font-black text-slate-700 block">
                  {isProcessing ? 'جاري معالجة الملفات...' : 'اضغط هنا أو اسحب الملفات لرفعها'}
                </span>
                <span className="text-sm text-slate-400 font-bold">يمكنك تحديد أكثر من ملف PDF في المرة الواحدة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Status List */}
      {filesStatus.length > 0 && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <h3 className="font-black text-slate-700 text-sm">حالة معالجة الملفات ({filesStatus.length})</h3>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold uppercase">Batch Processing</span>
          </div>
          <div className="divide-y">
            {filesStatus.map((file, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    file.status === 'success' ? 'bg-emerald-500 animate-pulse' : 
                    file.status === 'error' ? 'bg-red-500' : 
                    file.status === 'processing' ? 'bg-blue-500 animate-bounce' : 'bg-slate-300'
                  }`}></div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 truncate max-w-[250px]">{file.name}</p>
                    {file.message && <p className="text-[10px] text-red-500 font-bold">{file.message}</p>}
                  </div>
                </div>
                <div className="text-left">
                  {file.status === 'success' && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black">
                      تم استخراج {file.count} طالب
                    </span>
                  )}
                  {file.status === 'processing' && <span className="text-[10px] text-blue-600 font-bold">جاري القراءة...</span>}
                  {file.status === 'waiting' && <span className="text-[10px] text-slate-400 font-bold">في الانتظار</span>}
                  {file.status === 'error' && <span className="text-[10px] text-red-600 font-bold">فشل!</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection;
