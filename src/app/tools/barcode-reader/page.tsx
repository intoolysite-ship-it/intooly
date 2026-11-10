"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, Upload, Clipboard, Trash2, Download, Copy, CheckCircle2, AlertTriangle, Barcode, FileText, RefreshCw } from "lucide-react";

type ScanResult = {
  id: string;
  format: string;
  text: string;
  timestamp: string;
  isValidCheckDigit?: boolean;
  gs1Data?: Record<string, string>;
};

const faqQuestions = [
  { q: "ما هو قارئ الباركود؟", a: "قارئ الباركود هو أداة تقوم بمسح الرمز الشريطي وفك ترميزه لاستخراج الأرقام أو النصوص أو البيانات المخزنة بداخله." },
  { q: "كيف أقرأ الباركود أونلاين؟", a: "افتح قارئ الباركود من Intooly، ثم اختر رفع صورة أو تشغيل الكاميرا، ووجّه الكاميرا نحو الرمز أو حمّل الصورة التي تحتوي عليه." },
  { q: "هل يمكن قراءة الباركود من صورة أو لقطة شاشة؟", a: "نعم، يمكنك رفع صورة تحتوي على باركود أو لصق لقطة شاشة مباشرة (Ctrl+V) إلى الأداة." },
  { q: "ما أنواع الباركود التي يدعمها القارئ؟", a: "يدعم القارئ أنواعاً واسعة مثل EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF, ISBN, Data Matrix, PDF417, Aztec, و QR Code." },
  { q: "هل يتم رفع الصور إلى خادم عند استخدام قارئ الباركود؟", a: "لا، الأداة مصممة لمعالجة الصور وفك الترميز محلياً داخل متصفحك فقط، مما يضمن خصوصية تامة." }
];

export default function BarcodeReaderPage() {
  const [mode, setMode] = useState<"camera" | "file" | "clipboard">("file");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  const validateCheckDigit = (code: string): boolean => {
    if (!/^\d{12,13}$/.test(code)) return true;
    const digits = code.split("").map(Number);
    const checkDigit = digits.pop()!;
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    return (10 - (sum % 10)) % 10 === checkDigit;
  };

  const parseGS1 = (text: string): Record<string, string> | null => {
    if (!text.includes("(") && !text.includes(")")) return null;
    const gs1Data: Record<string, string> = {};
    const regex = /\((\d{2,4})\)([^\(]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const ai = match[1];
      const value = match[2];
      if (ai === "01") gs1Data["GTIN"] = value;
      else if (ai === "10") gs1Data["Batch/Lot"] = value;
      else if (ai === "17") gs1Data["Expiry Date"] = value;
      else if (ai === "21") gs1Data["Serial Number"] = value;
      else gs1Data[`AI ${ai}`] = value;
    }
    return Object.keys(gs1Data).length > 0 ? gs1Data : null;
  };

  const handleScan = useCallback((decodedText: string, decodedResult: any) => {
    const isValid = validateCheckDigit(decodedText);
    const gs1Data = parseGS1(decodedText);
    
    const newResult: ScanResult = {
      id: crypto.randomUUID(),
      format: decodedResult.result.format?.formatName || "Unknown",
      text: decodedText,
      timestamp: new Date().toLocaleTimeString("ar-EG"),
      isValidCheckDigit: isValid,
      gs1Data: gs1Data || undefined,
    };

    setLastResult(newResult);
    setResults((prev) => [newResult, ...prev]);
    setError("");
  }, []);

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCameraId(devices[0].id);
        setPermissionDenied(false);
      } else {
        setError("لم يتم العثور على كاميرا متصلة بالجهاز.");
      }
    } catch (err) {
      setPermissionDenied(true);
      setError("لم يتم منح إذن الوصول إلى الكاميرا. يرجى السماح بالوصول من إعدادات المتصفح ثم إعادة المحاولة.");
    }
  };

  const startCamera = async () => {
    setError("");
    setPermissionDenied(false);
    
    // أولاً، نحصل على قائمة الكاميرات
    await getCameras();
    
    if (cameras.length === 0 && !permissionDenied) return;
    
    setIsScanning(true);
    
    // ننتظر قليلاً للتأكد من أن العنصر #reader موجود في DOM
    setTimeout(async () => {
      try {
        if (scannerRef.current) {
          await scannerRef.current.stop().catch(() => {});
          scannerRef.current.clear();
        }
        
        scannerRef.current = new Html5Qrcode("reader", { verbose: false });
        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };
        
        const cameraId = selectedCameraId || cameras[0]?.id;
        
        if (cameraId) {
          await scannerRef.current.start(
            cameraId,
            config,
            handleScan,
            (errorMessage: string) => { /* Ignore continuous scan errors */ }
          );
        } else {
          // Fallback: استخدام facingMode
          await scannerRef.current.start(
            { facingMode: "environment" },
            config,
            handleScan,
            (errorMessage: string) => { /* Ignore continuous scan errors */ }
          );
        }
      } catch (err: any) {
        console.error("Camera start error:", err);
        setIsScanning(false);
        
        if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
          setPermissionDenied(true);
          setError("تم رفض إذن الوصول إلى الكاميرا. يرجى السماح بالوصول من إعدادات المتصفح (أيقونة القفل بجانب شريط العنوان) ثم إعادة تحميل الصفحة.");
        } else if (err?.name === "NotFoundError") {
          setError("لم يتم العثور على كاميرا في جهازك. يرجى التأكد من توصيل كاميرا أو استخدام وضع رفع الصورة.");
        } else if (err?.name === "NotReadableError") {
          setError("الكاميرا مستخدمة من قبل تطبيق آخر. يرجى إغلاق التطبيقات الأخرى التي تستخدم الكاميرا ثم إعادة المحاولة.");
        } else {
          setError(`تعذر تشغيل الكاميرا: ${err?.message || "خطأ غير معروف"}. جرب استخدام وضع رفع الصورة.`);
        }
      }
    }, 300);
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Stop camera error:", err);
      }
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const scanner = new Html5Qrcode("reader-file", { verbose: false });
      const result = await scanner.scanFile(file, true);
      handleScan(result, { result: { format: { formatName: "File Scan" } } });
    } catch (err) {
      setError("لم يتم العثور على باركود واضح في الصورة. يرجى تحسين الإضاءة أو اقتصاص الصورة.");
    }
  };

  const switchCamera = async () => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const newCameraId = cameras[nextIndex].id;
    setSelectedCameraId(newCameraId);
    
    if (isScanning) {
      await stopCamera();
      setTimeout(() => startCamera(), 300);
    }
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (mode !== "clipboard") return;
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const file = new File([blob], "clipboard.png", { type: blob.type });
            try {
              const scanner = new Html5Qrcode("reader-clipboard", { verbose: false });
              const result = await scanner.scanFile(file, true);
              handleScan(result, { result: { format: { formatName: "Clipboard" } } });
            } catch {
              setError("لم يتم العثور على باركود في الصورة الملصقة.");
            }
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
      stopCamera();
    };
  }, [mode]);

  const exportResults = (format: "csv" | "json") => {
    if (results.length === 0) return;
    let content = "";
    let type = "";
    let filename = "";

    if (format === "json") {
      content = JSON.stringify(results, null, 2);
      type = "application/json";
      filename = "barcode-results.json";
    } else {
      const headers = "التاريخ,النوع,القيمة,رقم الفحص صالح,بيانات GS1\n";
      const rows = results.map(r => 
        `${r.timestamp},${r.format},"${r.text}",${r.isValidCheckDigit ? "نعم" : "لا"},"${r.gs1Data ? JSON.stringify(r.gs1Data).replace(/"/g, '""') : ""}"`
      ).join("\n");
      content = "\uFEFF" + headers + rows;
      type = "text/csv;charset=utf-8;";
      filename = "barcode-results.csv";
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setResults([]);
    setLastResult(null);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500">
          <Link href="/tools/productivity" className="font-medium transition hover:text-orange-600">أدوات الإنتاجية</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">قارئ الباركود</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Barcode size={16} />
            معالجة محلية 100% - خصوصية تامة
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            قارئ الباركود أونلاين – اقرأ الباركود من الصورة أو الكاميرا
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            استخدم قارئ الباركود المجاني من Intooly لقراءة وفك رموز EAN وUPC وCode 128 وغيرها من الكاميرا أو الصور. امسح الباركود بسهولة، واعرض النتيجة وانسخها دون تثبيت تطبيق.
          </p>
        </header>

        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap gap-2">
            <button onClick={() => { setMode("camera"); stopCamera(); }} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "camera" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              <Camera size={16} /> الكاميرا
            </button>
            <button onClick={() => { setMode("file"); stopCamera(); }} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "file" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              <Upload size={16} /> رفع صورة
            </button>
            <button onClick={() => { setMode("clipboard"); stopCamera(); }} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "clipboard" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              <Clipboard size={16} /> لصق من الحافظة
            </button>
          </div>

          <div ref={readerContainerRef} className="mb-6 min-h-[300px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center relative overflow-hidden">
            {mode === "camera" && !isScanning && !permissionDenied && (
              <button onClick={startCamera} className="flex flex-col items-center gap-3 text-slate-600 hover:text-orange-600">
                <Camera size={48} />
                <span className="font-bold">اضغط لبدء الكاميرا</span>
                <span className="text-xs text-slate-400">سيطلب المتصفح إذن الوصول للكاميرا</span>
              </button>
            )}
            
            {mode === "camera" && permissionDenied && (
              <div className="flex flex-col items-center gap-3 text-red-600 p-8 text-center">
                <AlertTriangle size={48} />
                <span className="font-bold">تم رفض إذن الكاميرا</span>
                <p className="text-sm text-slate-600 max-w-md">
                  يرجى الضغط على أيقونة القفل 🔒 في شريط عنوان المتصفح، ثم السماح بالوصول إلى الكاميرا، وأعد تحميل الصفحة.
                </p>
                <button 
                  onClick={() => { setPermissionDenied(false); startCamera(); }}
                  className="mt-2 flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
                >
                  <RefreshCw size={16} /> إعادة المحاولة
                </button>
              </div>
            )}
            
            {mode === "camera" && isScanning && (
              <div className="w-full">
                <div id="reader" className="w-full"></div>
                {cameras.length > 1 && (
                  <div className="mt-3 flex justify-center gap-2">
                    <select 
                      value={selectedCameraId} 
                      onChange={(e) => { setSelectedCameraId(e.target.value); }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      {cameras.map((cam) => (
                        <option key={cam.id} value={cam.id}>{cam.label || `كاميرا ${cameras.indexOf(cam) + 1}`}</option>
                      ))}
                    </select>
                    <button 
                      onClick={switchCamera}
                      className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-300"
                    >
                      تبديل الكاميرا
                    </button>
                    <button 
                      onClick={stopCamera}
                      className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                    >
                      إيقاف
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {mode === "file" && (
              <label className="flex flex-col items-center gap-3 cursor-pointer text-slate-600 hover:text-orange-600 w-full h-full justify-center p-8">
                <Upload size={48} />
                <span className="font-bold">اضغط لاختيار صورة أو اسحبها هنا</span>
                <span className="text-xs text-slate-400">JPG, PNG, WEBP</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            )}

            {mode === "clipboard" && (
              <div className="flex flex-col items-center gap-3 text-slate-600 w-full h-full justify-center p-8 text-center">
                <Clipboard size={48} />
                <span className="font-bold">اضغط Ctrl + V (أو Cmd + V) للصق لقطة شاشة تحتوي على باركود</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-2">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" /> 
              <div>
                <p className="font-semibold">{error}</p>
                {permissionDenied && (
                  <p className="mt-2 text-sm">
                    💡 <strong>الحل:</strong> انقر على أيقونة القفل 🔒 أو أيقونة الكاميرا 📷 في شريط عنوان المتصفح (أعلى الصفحة)، واختر "السماح" (Allow) للكاميرا، ثم أعد تحميل الصفحة.
                  </p>
                )}
              </div>
            </div>
          )}

          {lastResult && (
            <div className="mb-6 rounded-2xl border-2 border-green-200 bg-green-50 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                  <CheckCircle2 size={20} /> تم القراءة بنجاح
                </h3>
                <span className="text-xs font-mono bg-green-200 text-green-800 px-2 py-1 rounded">{lastResult.format}</span>
              </div>
              <div className="bg-white rounded-xl p-4 mb-3 border border-green-100">
                <p className="text-2xl font-extrabold text-slate-900 break-all" dir="ltr">{lastResult.text}</p>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">رقم الفحص (Check Digit):</span>
                  <span className={lastResult.isValidCheckDigit ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                    {lastResult.isValidCheckDigit ? "صالح ✅" : "غير صالح ❌"}
                  </span>
                </div>
                {lastResult.gs1Data && (
                  <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-700 mb-2 flex items-center gap-2"><FileText size={16}/> تحليل بيانات GS1:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(lastResult.gs1Data).map(([key, val]) => (
                        <div key={key} className="text-xs">
                          <span className="font-semibold text-slate-500">{key}:</span>
                          <span className="font-mono text-slate-800 mr-1" dir="ltr">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigator.clipboard.writeText(lastResult.text)}
                className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700"
              >
                <Copy size={18} /> نسخ القيمة
              </button>
            </div>
          )}
        </section>

        {results.length > 0 && (
          <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900">سجل القراءات ({results.length})</h3>
              <div className="flex gap-2">
                <button onClick={() => exportResults("csv")} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Download size={16} /> تصدير CSV
                </button>
                <button onClick={() => exportResults("json")} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Download size={16} /> تصدير JSON
                </button>
                <button onClick={clearResults} className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                  <Trash2 size={16} /> مسح الكل
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">الوقت</th>
                    <th className="px-4 py-3 font-bold">النوع</th>
                    <th className="px-4 py-3 font-bold">القيمة</th>
                    <th className="px-4 py-3 font-bold">الفحص</th>
                    <th className="px-4 py-3 font-bold">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{r.timestamp}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.format}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900" dir="ltr">{r.text}</td>
                      <td className="px-4 py-3">
                        <span className={r.isValidCheckDigit ? "text-green-600" : "text-red-600"}>
                          {r.isValidCheckDigit ? "✅" : "❌"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigator.clipboard.writeText(r.text)} className="text-orange-600 hover:text-orange-800">
                          <Copy size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mt-12 space-y-8 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هو قارئ الباركود؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              قارئ الباركود هو أداة رقمية تستخدم تقنية التعرف على الرموز الشريطية وفك ترميزها لاستخراج المعلومات المخزنة داخلها. تساعدك أداة قارئ الباركود من Intooly على فك شفرة الرمز واستخراج محتواه بدقة، مع عرض القيمة ونوع الباركود، وإمكانية نسخ النتيجة أو تحليل بيانات GS1 المتقدمة.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيفية قراءة الباركود باستخدام Intooly</h2>
            <ol className="mt-4 list-decimal list-inside space-y-2 leading-8 text-slate-600">
              <li>افتح أداة قارئ الباركود واختر طريقة القراءة (الكاميرا، رفع صورة، أو لصق من الحافظة).</li>
              <li>إذا اخترت الكاميرا، وجّهها نحو الباركود مع ضمان وضوح الإضاءة.</li>
              <li>انتظر حتى يتم التعرف على الرمز وفك ترميزه تلقائياً.</li>
              <li>راجع النتيجة، وتحقق من صحة رقم الفحص (Check Digit) إن وجد، وانسخ البيانات لاستخدامها.</li>
            </ol>
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-3">أدوات Intooly ذات صلة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/tools/qr-generator" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">مولد أكواد QR</span>
                <span className="text-sm text-slate-600">إنشاء رموز استجابة سريعة مخصصة</span>
              </Link>
              <Link href="/tools/convert-image-to-text" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">استخراج النص من الصور (OCR)</span>
                <span className="text-sm text-slate-600">تحويل النصوص في الصور إلى نصوص قابلة للتحرير</span>
              </Link>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول قارئ الباركود</h2>
            <div className="mt-4 space-y-4">
              {faqQuestions.map((item, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-4 open:border-orange-200 open:bg-orange-50/30 transition">
                  <summary className="cursor-pointer list-none font-bold text-slate-800 marker:hidden flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-xl text-orange-600 transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}