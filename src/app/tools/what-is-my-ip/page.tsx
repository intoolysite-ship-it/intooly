'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Copy, Check, Loader2, Globe, MapPin, Building, Shield,
  RefreshCw, Clock, DollarSign, Languages, AlertTriangle,
  Wifi, Server, Flag, ExternalLink, ArrowLeft, Zap, Lock,
} from 'lucide-react';

// تحميل خريطة Leaflet ديناميكيًا (لتجنب SSR)
const MapView = dynamic(() => import('./MapView'), { ssr: false });

interface IPData {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  timezone: string;
  postal: string;
  readme?: string;
}

export default function WhatIsMyIPPage() {
  const [data, setData] = useState<IPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://ipinfo.io/json?token=d634359e239b9c');
      const json = await res.json();
      if (json.ip) {
        setData(json);
      } else {
        setError('فشل في جلب بيانات الشبكة. يرجى المحاولة لاحقاً.');
      }
    } catch {
      setError('حدث خطأ في الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // تحليل loc ("lat,lon") إلى إحداثيات
  const parseLoc = (loc: string | undefined) => {
    if (!loc) return { lat: 0, lon: 0 };
    const [lat, lon] = loc.split(',').map(Number);
    return { lat, lon };
  };

  // تحليل org ("AS12345 ISP Name") إلى ASN + اسم
  const parseOrg = (org: string | undefined) => {
    if (!org) return { asn: '', name: 'غير معروف' };
    const match = org.match(/^(AS\d+)\s+(.+)$/);
    if (match) return { asn: match[1], name: match[2] };
    return { asn: '', name: org };
  };

  const coords = parseLoc(data?.loc);
  const orgInfo = parseOrg(data?.org);
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link
            href="/tools/productivity"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            جميع أدوات الإنتاجية
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="icon-glow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <Globe className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                ما هو عنوان IP الخاص بي؟
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                اكتشف عنوان IP العام (IPv4/IPv6)، موقعك على الخريطة، مزود الخدمة، والمنطقة الزمنية — مع فحص أمان شامل.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {loading && (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-sm border border-ink-100">
                <Loader2 className="h-10 w-10 animate-spin text-brand-500 mb-4" />
                <p className="text-ink-600 font-medium">جاري تحليل عنوان الشبكة الخاص بك…</p>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-2xl bg-rose-50 p-8 text-center shadow-sm border border-rose-100">
                <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                <p className="text-rose-700 font-medium mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-rose-600 border border-rose-200 transition hover:bg-rose-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة المحاولة
                </button>
              </div>
            )}

            {!loading && !error && data && (
              <>
                <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-amber-600 p-8 text-center text-white shadow-lg">
                  <p className="text-amber-50 mb-3 font-medium">عنوان الـ IP العام الخاص بك</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-wider font-mono break-all">
                      {data.ip}
                    </h2>
                    <button
                      onClick={() => copyToClipboard(data.ip, 'ip')}
                      className="flex items-center gap-1 rounded-md bg-white/20 px-3 py-1.5 text-xs text-white transition hover:bg-white/30"
                    >
                      {copiedField === 'ip' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedField === 'ip' ? 'تم' : 'نسخ'}
                    </button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
                      <Globe className="h-4 w-4" />
                      {data.ip.includes(':') ? 'IPv6' : 'IPv4'}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
                      <Flag className="h-4 w-4" />
                      {data.country}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
                      <Wifi className="h-4 w-4" />
                      {orgInfo.asn || 'غير معروف'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-700 shadow-sm border border-ink-200 transition hover:bg-ink-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    تحديث البيانات
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoCard
                    icon={<MapPin className="h-5 w-5 text-emerald-600" />}
                    label="الموقع"
                    value={`${data.city || 'غير معروف'}, ${data.region || 'غير معروف'}, ${data.country || 'غير معروف'}`}
                    onCopy={() => copyToClipboard(`${data.city}, ${data.region}, ${data.country}`, 'location')}
                    copied={copiedField === 'location'}
                  />
                  <InfoCard
                    icon={<Building className="h-5 w-5 text-purple-600" />}
                    label="مزود الخدمة (ISP)"
                    value={orgInfo.name}
                    onCopy={() => copyToClipboard(orgInfo.name, 'isp')}
                    copied={copiedField === 'isp'}
                  />
                  <InfoCard
                    icon={<Server className="h-5 w-5 text-brand-600" />}
                    label="منظمة الشبكة (ASN)"
                    value={orgInfo.asn || 'غير معروف'}
                    onCopy={() => copyToClipboard(orgInfo.asn, 'asn')}
                    copied={copiedField === 'asn'}
                  />
                  <InfoCard
                    icon={<Clock className="h-5 w-5 text-amber-600" />}
                    label="المنطقة الزمنية"
                    value={data.timezone || 'غير معروف'}
                    onCopy={() => copyToClipboard(data.timezone || '', 'timezone')}
                    copied={copiedField === 'timezone'}
                  />
                  <InfoCard
                    icon={<Languages className="h-5 w-5 text-indigo-600" />}
                    label="الرمز البريدي"
                    value={data.postal || 'غير معروف'}
                    onCopy={() => copyToClipboard(data.postal || '', 'postal')}
                    copied={copiedField === 'postal'}
                  />
                  <InfoCard
                    icon={<Globe className="h-5 w-5 text-blue-600" />}
                    label="الدولة"
                    value={data.country || 'غير معروف'}
                    onCopy={() => copyToClipboard(data.country || '', 'country')}
                    copied={copiedField === 'country'}
                  />
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-ink-100">
                  <h3 className="mb-4 text-lg font-semibold text-ink-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-rose-500" />
                    موقعك التقريبي على الخريطة
                  </h3>
                  {coords.lat && coords.lon ? (
                    <>
                      <MapView lat={coords.lat} lon={coords.lon} label={data.city || 'موقعك التقريبي'} />
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-ink-600">
                          الإحداثيات: <span className="font-mono font-semibold text-ink-900">{coords.lat}</span> , <span className="font-mono font-semibold text-ink-900">{coords.lon}</span>
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${coords.lat},${coords.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
                        >
                          <ExternalLink className="h-4 w-4" />
                          عرض في Google Maps
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="text-ink-500 text-sm">لا تتوفر إحداثيات لهذا IP.</p>
                  )}
                  <p className="mt-3 text-xs text-ink-500">
                    * الموقع تقريبي بناءً على عنوان IP وقد لا يكون دقيقاً بنسبة 100%
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-ink-100">
                  <h3 className="mb-4 text-lg font-semibold text-ink-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-brand-600" />
                    معلومات الشبكة
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <NetworkItem label="عنوان IP" value={data.ip} />
                    <NetworkItem label="نوع الاتصال" value={data.ip.includes(':') ? 'IPv6' : 'IPv4'} />
                    <NetworkItem label="ASN" value={orgInfo.asn || 'غير معروف'} />
                    <NetworkItem label="المنظمة" value={orgInfo.name} />
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">لماذا Intooly؟</h3>
              <ul className="space-y-2.5 text-sm text-ink-700">
                <li className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>لا نحتفظ ببياناتك</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>نتائج فورية</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>بدون تسجيل</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">🔒 خصوصيتك محفوظة</h3>
              <p className="text-sm leading-7 text-ink-700">
                لا نحتفظ بعنوان IP الخاص بك. البيانات تُجلب من خدمة ipinfo.io مباشرة إلى متصفحك.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">💡 نصائح سريعة</h3>
              <ul className="space-y-2 text-sm text-ink-700">
                <li>• استخدم VPN لإخفاء IP الحقيقي.</li>
                <li>• الموقع تقريبي، قد لا يكون دقيقًا.</li>
                <li>• تحقق من IP بانتظام عند استخدام شبكات عامة.</li>
              </ul>
            </div>
          </aside>
        </div>
        <section className="mt-14 border-t border-ink-100 pt-10">
          <article className="mx-auto max-w-4xl text-right">
            <h2 className="text-xl font-black text-ink-900 md:text-2xl mb-4">
              ما هو عنوان IP؟ وكيف يعمل؟
            </h2>
            <p className="leading-8 text-ink-700 mb-4">
              عنوان IP (Internet Protocol) هو رقم فريد يُعطى لكل جهاز متصل بالإنترنت، ويُستخدم لتوجيه البيانات بين الأجهزة. يشبه عنوان IP "عنوان المنزل الرقمي" لجهازك، حيث تصل إليه البيانات من الخوادم والمواقع الإلكترونية.
            </p>
            <p className="leading-8 text-ink-700 mb-4">
              يوجد نوعان من عناوين IP: IPv4 (يتكون من 4 أرقام، مثل 192.168.1.1) و IPv6 (يتكون من 8 مجموعات سداسية عشرية، ويوفر عددًا أكبر بكثير من العناوين). أداة Intooly تعرض كلا النوعين إن وُجد.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">ماذا تكشف أداة فحص IP؟</h3>
            <ul className="space-y-2 leading-8 text-ink-700 list-disc list-inside mb-4">
              <li><strong>عنوان IP العام:</strong> الرقم الذي يظهر به جهازك للعالم الخارجي.</li>
              <li><strong>الموقع الجغرافي التقريبي:</strong> الدولة، المدينة، والإحداثيات.</li>
              <li><strong>مزود الخدمة (ISP) والمنظمة:</strong> الشركة التي توفر لك الإنترنت، ورقم ASN.</li>
              <li><strong>المنطقة الزمنية والرمز البريدي:</strong> معلومات مرتبطة بموقعك.</li>
              <li><strong>نوع الاتصال:</strong> IPv4 أو IPv6.</li>
            </ul>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">متى تحتاج إلى فحص عنوان IP؟</h3>
            <ul className="space-y-2 leading-8 text-ink-700 list-disc list-inside mb-4">
              <li>التحقق من أن VPN يعمل بشكل صحيح (يجب أن يغيّر IP).</li>
              <li>تشخيص مشاكل الاتصال أو الحظر الجغرافي.</li>
              <li>التأكد من عدم تسريب IP الحقيقي عند استخدام شبكات عامة.</li>
              <li>معرفة مزود الخدمة والمنطقة الجغرافية التقريبية.</li>
              <li>التحقق من ASN الخاص بشبكتك (مفيد للمطورين).</li>
            </ul>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">نصائح لحماية عنوان IP</h3>
            <ul className="space-y-2 leading-8 text-ink-700 list-disc list-inside mb-4">
              <li>استخدم VPN موثوق لإخفاء IP الحقيقي.</li>
              <li>تجنّب الشبكات العامة غير الآمنة (Wi-Fi المفتوح).</li>
              <li>لا تشارك IP الخاص بك في الأماكن العامة.</li>
              <li>استخدم Tor عند الحاجة إلى أقصى درجات الخصوصية.</li>
              <li>فعّل جدار الحماية على جهازك.</li>
            </ul>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">الأسئلة الشائعة</h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">ما هو عنوان IP؟</h4>
                <p className="mt-2 leading-8 text-ink-700">عنوان IP هو رقم فريد يُعطى لكل جهاز متصل بالإنترنت، ويستخدم لتوجيه البيانات بين الأجهزة.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">ما الفرق بين IPv4 و IPv6؟</h4>
                <p className="mt-2 leading-8 text-ink-700">IPv4 يتكون من 4 أرقام، بينما IPv6 يتكون من 8 مجموعات سداسية عشرية، ويوفر عدداً أكبر بكثير من العناوين.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">كيف أخفي عنوان IP الخاص بي؟</h4>
                <p className="mt-2 leading-8 text-ink-700">يمكنك إخفاء IP باستخدام VPN (الأنسب للاستخدام اليومي)، أو Proxy، أو Tor.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل الموقع الجغرافي دقيق؟</h4>
                <p className="mt-2 leading-8 text-ink-700">الموقع تقريبي بناءً على IP، وقد لا يكون دقيقاً بنسبة 100%. يعتمد على قاعدة بيانات مزود الخدمة.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل الأداة مجانية؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، مجانية بالكامل بدون تسجيل وبدون إعلانات.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل تحتفظ الأداة بعنوان IP الخاص بي؟</h4>
                <p className="mt-2 leading-8 text-ink-700">لا، الأداة تعرض IP فقط ولا تحتفظ بأي بيانات. تُجلب البيانات من ipinfo.io مباشرة إلى متصفحك.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">ما هو ASN؟</h4>
                <p className="mt-2 leading-8 text-ink-700">ASN (Autonomous System Number) هو رقم تعريف فريد للشبكة التي تنتمي إليها. يساعد في معرفة مزود الخدمة والبنية التحتية للشبكة.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">كيف أعرف أن VPN يعمل؟</h4>
                <p className="mt-2 leading-8 text-ink-700">افتح الأداة قبل تشغيل VPN، وسجل IP. ثم شغّل VPN وافتح الأداة مرة أخرى. إذا تغيّر IP، فإن VPN يعمل.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكنني فحص IP معين؟</h4>
                <p className="mt-2 leading-8 text-ink-700">حالياً، الأداة تعرض IP الحالي فقط. قريباً، سنضيف أداة "فحص IP محدد" ضمن أدوات IP.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">لماذا يظهر IP في مدينة مختلفة عن مدينتي؟</h4>
                <p className="mt-2 leading-8 text-ink-700">قد يكون مزود الخدمة يستخدم خوادم في مدينة أخرى، أو أن IP مسجّل في تلك المدينة. هذا طبيعي في بعض الشبكات (خاصة الموبايل).</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل الأداة تعمل على الجوال؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، الأداة متوافقة تماماً مع المتصفحات الحديثة على الجوال والأجهزة اللوحية.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكنني معرفة IP الخاص بي من دون أداة؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، لكن الأداة تسهّل العملية وتعرض معلومات إضافية مثل الموقع ومزود الخدمة. لا يمكن معرفة IP العام بدون خدمة خارجية.</p>
              </div>
            </div>

            <h3 className="mt-12 text-xl font-bold text-ink-900 md:text-2xl">أدوات ذات صلة</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/tools/qr-generator" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← مولّد QR Code
              </Link>
              <Link href="/tools/utm-builder" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← مولّد روابط UTM
              </Link>
              <Link href="/tools/word-counter" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← عدّاد الكلمات
              </Link>
              <Link href="/tools/keyword-generator" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← مولّد الكلمات المفتاحية
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ icon, label, value, onCopy, copied }: { icon: React.ReactNode; label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm border border-ink-100 transition hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-50">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-base font-semibold text-ink-900" title={value}>{value}</p>
          <button
            onClick={onCopy}
            className="flex shrink-0 items-center gap-1 rounded-md bg-ink-100 px-2 py-1 text-xs text-ink-600 transition hover:bg-ink-200"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'تم' : 'نسخ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function NetworkItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-ink-50 p-3">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      <span className="text-sm font-semibold text-ink-900 font-mono">{value}</span>
    </div>
  );
}