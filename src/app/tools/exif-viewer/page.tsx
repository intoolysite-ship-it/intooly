"use client";

import { useState, useCallback } from "react";
import * as exifr from "exifr";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { 
  Upload, Image as ImageIcon, ShieldAlert, ShieldCheck, 
  MapPin, Camera, Calendar, Settings, Download, FileJson, 
  FileSpreadsheet, FileText, Search, AlertTriangle, CheckCircle2, X
} from "lucide-react";

type ImageData = {
  file: File;
  preview: string;
  exif: any;
  gps: any;
  iptc: any;
  xmp: any;
  privacyScore: number;
  privacyIssues: string[];
  error?: string;
};

const faqQuestions: Array<{ q: string; a: string }> = [
  { q: "ما هو قارئ بيانات الصور EXIF؟", a: "هو أداة تستخرج المعلومات الوصفية المخزنة داخل الصور الرقمية، مثل نوع الكاميرا، تاريخ الالتقاط، إعدادات التصوير، والموقع الجغرافي إذا كان متاحاً." },
  { q: "كيف أعرف نوع الكاميرا التي التقطت الصورة؟", a: "افتح الصورة باستخدام الأداة، وابحث عن حقول 'Make' (الشركة المصنعة) و 'Model' (طراز الجهاز)." },
  { q: "هل يمكن معرفة مكان التقاط الصورة؟", a: "نعم، إذا كانت الصورة تحتوي على إحداثيات GPS، ستعرض الأداة خط العرض والطول مع رابط لموقعها على الخريطة." },
  { q: "هل تحتوي جميع الصور على بيانات EXIF؟", a: "لا، فبعض التطبيقات تحذف هذه البيانات تلقائياً عند الضغط أو المشاركة لحماية الخصوصية." },
  { q: "هل قراءة بيانات الصور آمنة وتحمي خصوصيتي؟", a: "نعم، 100%. الأداة تعالج الصور محلياً داخل متصفحك فقط. لا يتم رفع أي صورة إلى خوادم Intooly." },
  { q: "ما الفرق بين EXIF و IPTC و XMP؟", a: "EXIF تحتوي على بيانات تقنية (كاميرا، إعدادات، GPS). IPTC تحتوي على بيانات صحفية (مصور، حقوق). XMP تحتوي على بيانات تحرير البرامج." }
];

export default function ExifViewerPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const processImage = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file);
    let exifData: any = {};
    let gpsData: any = null;
    let iptcData: any = {};
    let xmpData: any = {};
    let privacyIssues: string[] = [];
    let privacyScore = 0; // 0: Safe, 1: Warning, 2: High Risk

    try {
      // استخراج جميع البيانات في عملية واحدة آمنة وسريعة
      const parsed = await exifr.parse(file, { 
        exif: true, gps: true, iptc: true, xmp: true,
        translateKeys: true, translateValues: true, reviveValues: true 
      }) || {};

      exifData = parsed;
      iptcData = parsed.iptc || {};
      xmpData = parsed.xmp || {};

      // 3. تحليل الخصوصية
      if (parsed.latitude && parsed.longitude) {
        privacyIssues.push("يحتوي على إحداثيات موقع جغرافي (GPS)");
        privacyScore = Math.max(privacyScore, 2);
        gpsData = {
          lat: parsed.latitude,
          lng: parsed.longitude,
          mapLink: `https://www.openstreetmap.org/?mlat=${parsed.latitude}&mlon=${parsed.longitude}#map=15/${parsed.latitude}/${parsed.longitude}`
        };
      }
      if (exifData.SerialNumber || exifData.BodySerialNumber) {
        privacyIssues.push("يحتوي على رقم تسلسلي للجهاز");
        privacyScore = Math.max(privacyScore, 1);
      }
      if (exifData.Artist || exifData.Copyright || iptcData.Byline) {
        privacyIssues.push("يحتوي على معلومات المؤلف أو حقوق النشر");
        privacyScore = Math.max(privacyScore, 1);
      }

    } catch (err) {
      console.error("Error parsing EXIF:", err);
      return {
        file, preview, exif: {}, gps: null, iptc: {}, xmp: {},
        privacyScore: 0, privacyIssues: [],
        error: "تعذر قراءة بيانات هذه الصورة. قد تكون الصيغة غير مدعومة أو الملف تالفاً."
      };
    }

    return { file, preview, exif: exifData, gps: gpsData, iptc: iptcData, xmp: xmpData, privacyScore, privacyIssues };
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setIsProcessing(true);
    const newImages: ImageData[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/") || file.name.match(/\.(heic|heif|dng|cr2|nef|arw)$/i)) {
        const processed = await processImage(file);
        newImages.push(processed);
      }
    }
    
    setImages(prev => [...prev, ...newImages]);
    setIsProcessing(false);
  };

  const activeImage = images[activeImageIndex];

  const exportJSON = () => {
    if (!activeImage) return;
    const data = { ...activeImage.exif, gps: activeImage.gps, iptc: activeImage.iptc, xmp: activeImage.xmp };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    saveAs(blob, `${activeImage.file.name}_metadata.json`);
  };

  const exportCSV = () => {
    if (images.length === 0) return;
    const headers = ["اسم الملف", "الشركة", "الموديل", "التاريخ", "GPS", "حالة الخصوصية"];
    const rows = images.map(img => [
      img.file.name,
      img.exif.Make || "-",
      img.exif.Model || "-",
      img.exif.DateTimeOriginal || "-",
      img.gps ? "موجود" : "غير موجود",
      img.privacyScore === 2 ? "عالي الخطورة" : img.privacyScore === 1 ? "تحذير" : "آمن"
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    saveAs(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), "exif_report.csv");
  };

  const exportPDF = () => {
    if (!activeImage) return;
    const doc = new jsPDF(); // Note: jsPDF Arabic support is limited, using basic layout
    doc.setFontSize(18);
    doc.text("تقرير بيانات الصورة - Intooly", 190, 20, { align: "right" });
    doc.setFontSize(12);
    doc.text(`الملف: ${activeImage.file.name}`, 190, 35, { align: "right" });
    
    const tableData = Object.entries(activeImage.exif).slice(0, 30).map(([key, value]) => [key, String(value)]);
    
    autoTable(doc, {
      head: [["الحقل", "القيمة"]],
      body: tableData,
      startY: 45,
      theme: "grid",
      styles: { font: "helvetica", halign: "right" },
      headStyles: { fillColor: [234, 88, 12] } // Intooly Orange
    });
    
    doc.save(`${activeImage.file.name}_report.pdf`);
  };

  // دمج كل البيانات للبحث
  const allData = activeImage ? { ...activeImage.exif, ...activeImage.iptc, ...activeImage.xmp } : {};
  const filteredData = Object.entries(allData).filter(([key, value]) => 
    key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrivacyBadge = (score: number) => {
    if (score === 2) return <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"><ShieldAlert size={14} /> عالي الخطورة</span>;
    if (score === 1) return <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700"><AlertTriangle size={14} /> تحذير</span>;
    return <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"><ShieldCheck size={14} /> آمن</span>;
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500">
          <a href="/tools/images" className="font-medium transition hover:text-orange-600">أدوات الصور</a>
          <span className="mx-2">/</span>
          <span className="text-slate-700">قارئ بيانات الصور EXIF</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <ShieldCheck size={16} />
            معالجة محلية 100% - لا يتم رفع صورك
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            قارئ بيانات الصور EXIF – استخراج وعرض معلومات الصور أونلاين
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            أداة احترافية لفحص خصوصية صورك، استخراج بيانات الكاميرا، إعدادات التصوير، والموقع الجغرافي (GPS) مباشرة من متصفحك بدون رفع الملفات.
          </p>
        </header>

        {/* Dropzone */}
        <section className="mb-8 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-orange-400 hover:bg-orange-50/30">
          <input
            type="file"
            id="fileInput"
            multiple
            accept="image/*,.heic,.heif,.dng,.cr2,.nef,.arw"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            <Upload className="mx-auto mb-4 h-12 w-12 text-orange-500" />
            <p className="text-lg font-bold text-slate-800">اسحب الصور هنا أو انقر للاختيار</p>
            <p className="mt-2 text-sm text-slate-500">يدعم: JPG, PNG, WebP, HEIC, TIFF (المعالجة تتم على جهازك)</p>
          </label>
        </section>

        {isProcessing && (
          <div className="mb-8 text-center text-slate-600">جاري تحليل البيانات الوصفية للصور...</div>
        )}

        {images.length > 0 && !isProcessing && (
          <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
            {/* Sidebar: Image List & Preview */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 font-bold text-slate-800">الصور ({images.length})</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-xl p-2 text-right transition ${
                        activeImageIndex === idx ? "bg-orange-50 ring-2 ring-orange-500" : "hover:bg-slate-50"
                      }`}
                    >
                      <img src={img.preview} alt="preview" className="h-12 w-12 rounded-lg object-cover" />
                      <div className="flex-1 truncate text-sm">
                        <p className="font-semibold text-slate-800 truncate">{img.file.name}</p>
                        <p className="text-xs text-slate-500">{(img.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      {getPrivacyBadge(img.privacyScore)}
                    </button>
                  ))}
                </div>
              </div>

              {activeImage && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <img src={activeImage.preview} alt="Active" className="mb-4 w-full rounded-xl" />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <button onClick={exportJSON} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 hover:bg-slate-50">
                      <FileJson size={16} /> JSON
                    </button>
                    <button onClick={exportCSV} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 hover:bg-slate-50">
                      <FileSpreadsheet size={16} /> CSV
                    </button>
                    <button onClick={exportPDF} className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 hover:bg-slate-50">
                      <FileText size={16} /> تقرير PDF
                    </button>
                  </div>
                </div>
              )}
            </aside>

            {/* Main Content: Analysis */}
            {activeImage && (
              <section className="space-y-6">
                {activeImage.error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    <AlertTriangle className="mb-2" /> {activeImage.error}
                  </div>
                ) : (
                  <>
                    {/* Privacy Alert */}
                    {activeImage.privacyScore > 0 && (
                      <div className={`rounded-2xl border p-6 ${activeImage.privacyScore === 2 ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}>
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
                          <ShieldAlert className="text-red-600" /> تقرير فحص الخصوصية
                        </h3>
                        <ul className="space-y-2">
                          {activeImage.privacyIssues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-800">
                              <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 text-xs text-slate-600">
                          تنبيه: يُنصح بإزالة هذه البيانات قبل مشاركة الصورة على وسائل التواصل الاجتماعي أو المنتديات العامة.
                        </p>
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                          <Camera size={16} /> الكاميرا
                        </div>
                        <p className="font-bold text-slate-900">{activeImage.exif.Make || "غير متاح"}</p>
                        <p className="text-sm text-slate-600">{activeImage.exif.Model || "-"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                          <Calendar size={16} /> تاريخ الالتقاط
                        </div>
                        <p className="font-bold text-slate-900">
                          {activeImage.exif.DateTimeOriginal ? new Date(activeImage.exif.DateTimeOriginal).toLocaleDateString("ar-EG") : "غير متاح"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                          <Settings size={16} /> إعدادات التصوير
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          ISO: {activeImage.exif.ISO || "-"} | f/{activeImage.exif.FNumber || "-"} | {activeImage.exif.ExposureTime ? `1/${Math.round(1/activeImage.exif.ExposureTime)}s` : "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                          <MapPin size={16} /> الموقع الجغرافي
                        </div>
                        {activeImage.gps ? (
                          <a href={activeImage.gps.mapLink} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-orange-600 hover:underline">
                            عرض على الخريطة ↗
                          </a>
                        ) : (
                          <p className="text-sm text-slate-600">غير متضمن</p>
                        )}
                      </div>
                    </div>

                    {/* Detailed Data Table */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-200 p-4">
                        <h3 className="font-bold text-slate-900">البيانات الوصفية التفصيلية</h3>
                        <div className="mt-3 relative">
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            placeholder="ابحث عن حقل (مثل: ISO, GPS, Make)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 py-2 pr-10 pl-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                          />
                        </div>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-sm text-right">
                          <thead className="sticky top-0 bg-slate-50 text-slate-700">
                            <tr>
                              <th className="px-4 py-3 font-bold">اسم الحقل (Tag)</th>
                              <th className="px-4 py-3 font-bold">القيمة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredData.length === 0 ? (
                              <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-500">لا توجد نتائج مطابقة للبحث، أو الصورة لا تحتوي على بيانات وصفية.</td></tr>
                            ) : (
                              filteredData.map(([key, value], i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 font-medium text-slate-700">{key}</td>
                                  <td className="px-4 py-3 text-slate-600 break-all">
                                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}
          </div>
        )}

        {/* SEO Content Section - محتوى SEO احترافي موسع */}
        <section className="mt-16 space-y-8 max-w-4xl mx-auto text-right">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هو قارئ بيانات الصور EXIF؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              قارئ بيانات الصور EXIF هو أداة تساعدك على استخراج وعرض المعلومات الوصفية المخزنة داخل ملفات الصور الرقمية، والتي لا تظهر عادةً عند مشاهدة الصورة بالطريقة العادية. تُعرف هذه المعلومات باسم Metadata أو البيانات الوصفية، وتشمل تفاصيل الجهاز المستخدم في التصوير، وتاريخ التقاط الصورة، وإعدادات الكاميرا والعدسة، وأبعاد الصورة، والموقع الجغرافي إذا كانت بيانات GPS محفوظة داخل الملف.
            </p>
            <p className="mt-3 leading-8 text-slate-600">
              باستخدام قارئ بيانات الصور من Intooly، يمكنك معرفة تفاصيل الصور وفحص المعلومات المخفية داخلها بسهولة، دون الحاجة إلى تثبيت برامج متخصصة أو التعامل مع أدوات تقنية معقدة. لا تقتصر قراءة معلومات الصور على بيانات EXIF فقط؛ فقد تتضمن بعض الملفات بيانات إضافية مثل IPTC وXMP وملفات تعريف الألوان ICC.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما المقصود ببيانات EXIF في الصور؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              EXIF هو اختصار لعبارة Exchangeable Image File Format، وهو معيار يُستخدم لتخزين معلومات وصفية داخل الصور الرقمية، خصوصًا الصور الملتقطة بالكاميرات والهواتف الذكية. تساعد بيانات EXIF على معرفة تفاصيل عملية التصوير، مثل نوع الجهاز المستخدم، وإعدادات التعريض، وتاريخ الالتقاط، والعدسة، ومعلومات الموقع الجغرافي عند توفرها.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما المعلومات التي يمكن استخراجها من الصور؟</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-bold text-slate-900">استخراج معلومات الكاميرا والهاتف</h3>
                <p className="text-sm leading-7 text-slate-600">
                  يمكنك استخدام قارئ EXIF لمعرفة نوع الجهاز الذي التقط الصورة، بما في ذلك اسم الشركة المصنعة، موديل الجهاز، نوع العدسة، الرقم التسلسلي، وإصدار البرنامج الثابت.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-bold text-slate-900">قراءة إعدادات التصوير EXIF</h3>
                <p className="text-sm leading-7 text-slate-600">
                  يمكنك الاطلاع على إعدادات التصوير مثل ISO، فتحة العدسة Aperture، سرعة الغالق Shutter Speed، البعد البؤري Focal Length، ومعلومات الفلاش وتوازن اللون الأبيض.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-bold text-slate-900">معرفة تاريخ ووقت التقاط الصورة</h3>
                <p className="text-sm leading-7 text-slate-600">
                  قد تتضمن البيانات عدة حقول زمنية مثل DateTimeOriginal (تاريخ الالتقاط الأصلي)، CreateDate (تاريخ الإنشاء)، وModifyDate (تاريخ التعديل).
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-bold text-slate-900">استخراج موقع التقاط الصورة GPS</h3>
                <p className="text-sm leading-7 text-slate-600">
                  عند توفر بيانات GPS، يمكن عرض خط العرض، خط الطول، الارتفاع، اتجاه التصوير، ورابط لعرض الموقع على الخريطة.
                </p>
              </div>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">فحص خصوصية الصور قبل مشاركتها</h2>
            <p className="mt-3 leading-8 text-slate-600">
              قد تحتوي الصور الرقمية على معلومات لا تظهر عند مشاهدتها، مثل الموقع الجغرافي أو اسم الجهاز أو الرقم التسلسلي أو اسم المصور. لهذا السبب، يُنصح بمراجعة بيانات الصور قبل نشرها على مواقع التواصل الاجتماعي أو إرسالها إلى أشخاص آخرين، خصوصًا إذا كانت ملتقطة في المنزل أو في أماكن خاصة.
            </p>
            <p className="mt-3 leading-8 text-slate-600">
              تساعدك ميزة فحص خصوصية الصور على اكتشاف المعلومات الوصفية الحساسة التي قد تكون محفوظة داخل الملف، ومعرفة ما إذا كانت الصورة تتضمن بيانات موقع أو معلومات أخرى تحتاج إلى مراجعتها.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما الفرق بين EXIF وIPTC وXMP؟</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">نوع البيانات</th>
                    <th className="px-4 py-3 font-bold">المعلومات التي يحتوي عليها</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr><td className="px-4 py-3 font-medium">EXIF</td><td className="px-4 py-3">معلومات الكاميرا والتصوير والتاريخ والموقع</td></tr>
                  <tr><td className="px-4 py-3 font-medium">IPTC</td><td className="px-4 py-3">وصف الصورة واسم المصور وحقوق النشر والكلمات المفتاحية</td></tr>
                  <tr><td className="px-4 py-3 font-medium">XMP</td><td className="px-4 py-3">بيانات وصفية قابلة للتوسع ومعلومات التحرير والتقييم</td></tr>
                  <tr><td className="px-4 py-3 font-medium">ICC Profile</td><td className="px-4 py-3">معلومات ملف تعريف الألوان</td></tr>
                </tbody>
              </table>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الصيغ المدعومة لقراءة بيانات الصور</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">الصيغة</th>
                    <th className="px-4 py-3 font-bold">الاستخدام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr><td className="px-4 py-3 font-medium">JPG / JPEG</td><td className="px-4 py-3">الصور الرقمية الشائعة وبيانات EXIF</td></tr>
                  <tr><td className="px-4 py-3 font-medium">PNG</td><td className="px-4 py-3">الصور والبيانات الوصفية المدعومة في الصيغة</td></tr>
                  <tr><td className="px-4 py-3 font-medium">WebP</td><td className="px-4 py-3">صور الويب</td></tr>
                  <tr><td className="px-4 py-3 font-medium">HEIC / HEIF</td><td className="px-4 py-3">صور الهواتف الحديثة</td></tr>
                  <tr><td className="px-4 py-3 font-medium">TIFF</td><td className="px-4 py-3">الصور عالية الجودة والتصوير الاحترافي</td></tr>
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-3">أدوات Intooly ذات صلة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href="/tools/image-compressor" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">ضغط الصور أونلاين</span>
                <span className="text-sm text-slate-600">فحص الصورة بعد ضغطها</span>
              </a>
              <a href="/tools/image-resizer" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">تغيير حجم الصور</span>
                <span className="text-sm text-slate-600">فحص البيانات بعد تغيير الأبعاد</span>
              </a>
              <a href="/tools/image-converter" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">تحويل صيغ الصور</span>
                <span className="text-sm text-slate-600">فحص بيانات الصيغ المختلفة</span>
              </a>
              <a href="/tools/heic-to-jpg" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">تحويل HEIC إلى JPG</span>
                <span className="text-sm text-slate-600">قراءة بيانات الصور قبل التحويل وبعده</span>
              </a>
              <a href="/tools/background-remover" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">إزالة خلفية الصور</span>
                <span className="text-sm text-slate-600">فحص الصورة قبل وبعد المعالجة</span>
              </a>
              <a href="/tools/image-color-picker" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">استخراج الألوان من الصور</span>
                <span className="text-sm text-slate-600">أدوات مرتبطة بتحليل الصور</span>
              </a>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول قارئ بيانات الصور EXIF</h2>
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