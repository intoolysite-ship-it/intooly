import Link from "next/link";
import { 
  Video, Image as ImageIcon, FileText, Music, 
  Search, Briefcase, Activity, Wrench
} from "lucide-react";

const categories = [
  {
    icon: Video,
    title: "أدوات الفيديو",
    description: "أدوات متكاملة لتحويل، ضغط، قص، وتحرير ملفات الفيديو بصيغ مختلفة.",
    href: "/tools/video",
    badge: null,
  },
  {
    icon: ImageIcon,
    title: "أدوات الصور",
    description: "حوّل، قص، غيّر حجم، وعدّل صورك بسهولة مع أدوات احترافية مجانية.",
    href: "/tools/images",
    badge: null,
  },
  {
    icon: FileText,
    title: "أدوات PDF",
    description: "دمج، تقسيم، تحويل، وحماية ملفات PDF بسهولة وأمان.",
    href: "/tools/pdf",
    badge: null,
  },
  {
    icon: Music,
    title: "أدوات الصوت",
    description: "حوّل الصوت إلى نص، حرّر الملفات الصوتية، واستخرج الصوت من الفيديو.",
    href: "/tools/audio",
    badge: null,
  },
  {
    icon: Search,
    title: "أدوات SEO",
    description: "حسّن ظهور موقعك في محركات البحث مع أدوات تحليل وتحسين متقدمة.",
    href: "/tools/seo",
    badge: null,
  },
  {
    icon: Briefcase,
    title: "أدوات الإنتاجية",
    description: "أدوات عملية لزيادة إنتاجيتك وتنظيم عملك اليومي.",
    href: "/tools/productivity",
    badge: null,
  },
  {
    icon: ImageIcon,
    title: "قارئ بيانات الصور EXIF",
    description: "استخرج معلومات الكاميرا، إعدادات التصوير، والموقع الجغرافي من صورك محلياً وبأمان.",
    href: "/tools/exif-viewer",
  },
  {
    icon: Activity,
    title: "فاحص الروابط المعطلة",
    description: "اكتشف الروابط المعطلة والتالفة وروابط 404 في موقعك مجانًا مع تقرير تفصيلي.",
    href: "/tools/broken-link-checker",
  },
  {
    icon: ImageIcon,
    title: "قارئ بيانات الصور EXIF",
    description: "استخرج معلومات الكاميرا، إعدادات التصوير، والموقع الجغرافي من صورك محلياً وبأمان.",
    href: "/tools/exif-viewer",
  },
  {
    icon: Activity,
    title: "الصحة واللياقة البدنية",
    description: "حاسبات صحية مجانية لمؤشر كتلة الجسم، الوزن المثالي، السعرات الحرارية، وأدوات التغذية واللياقة.",
    href: "/tools/health-fitness",
    badge: "جديد",
  },
];

export const metadata = {
  title: "جميع الأدوات المجانية أونلاين | Intooly",
  description: "اكتشف مجموعة أدوات Intooly المجانية: أدوات الفيديو، الصور، PDF، الصوت، SEO، الإنتاجية، والصحة واللياقة البدنية. جميعها تعمل مباشرة من المتصفح.",
};

export default function ToolsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
            <Wrench size={16} />
            أكثر من 40 أداة مجانية
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            جميع أدوات Intooly المجانية
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-slate-600">
            مجموعة متكاملة من الأدوات المجانية التي تعمل مباشرة من متصفحك. لا تحتاج إلى تسجيل أو تثبيت برامج.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">تصفح حسب التصنيف</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg"
              >
                {category.badge && (
                  <span className="absolute top-4 left-4 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">
                    {category.badge}
                  </span>
                )}
                <div className="mb-4 inline-flex rounded-xl bg-orange-100 p-3 text-orange-600 group-hover:bg-orange-200 transition">
                  <category.icon size={28} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{category.title}</h3>
                <p className="mb-4 text-sm leading-6 text-slate-600">{category.description}</p>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-orange-600 group-hover:text-orange-700">
                    استكشف ←
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">لماذا تستخدم أدوات Intooly؟</h2>
          <div className="grid gap-6 sm:grid-cols-3 mt-6">
            <div>
              <div className="text-3xl mb-2">🆓</div>
              <h3 className="font-bold text-slate-900 mb-1">مجانية بالكامل</h3>
              <p className="text-sm text-slate-600">جميع الأدوات مجانية بدون قيود أو علامات مائية.</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-bold text-slate-900 mb-1">خصوصية تامة</h3>
              <p className="text-sm text-slate-600">ملفاتك لا تُرفع إلى أي خادم. كل شيء يتم محلياً.</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold text-slate-900 mb-1">سريعة وسهلة</h3>
              <p className="text-sm text-slate-600">تعمل مباشرة من المتصفح بدون تثبيت برامج.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}