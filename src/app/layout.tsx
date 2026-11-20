import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import AhrefsAnalytics from '@/components/AhrefsAnalytics';
import localFont from 'next/font/local';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import ScrollToTop from '@/components/ScrollToTop';

const cairo = localFont({
  src: [
    { path: './fonts/Cairo-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Cairo-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/Cairo-700.woff2', weight: '700', style: 'normal' },
    { path: './fonts/Cairo-800.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-cairo',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://intooly.com'),
  title: {
    default: 'Intooly - أدوات مجانية احترافية تعمل محلياً',
    template: '%s | Intooly',
  },
  description:
    'منصة أدوات مجانية احترافية لمعالجة الصور والفيديو والنصوص تعمل محلياً 100% في متصفحك لضمان خصوصيتك وسرعتك.',
  keywords: [
    'أدوات مجانية',
    'خصوصية البيانات',
    'معالجة محلية',
    'Intooly',
    'ضغط الصور',
    'إزالة الخلفية',
    'أدوات PDF',
  ],
  authors: [{ name: 'Intooly', url: 'https://intooly.com' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://intooly.com',
  },
  openGraph: {
    type: 'website',
    url: 'https://intooly.com',
    siteName: 'Intooly',
    title: 'Intooly - أدوات مجانية احترافية تعمل محلياً',
    description: 'منصة أدوات مجانية احترافية لمعالجة الصور والفيديو والنصوص تعمل محلياً في المتصفح.',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intooly - أدوات مجانية احترافية',
    description: 'منصة أدوات مجانية احترافية تعمل محلياً في المتصفح.',
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111827',
};

// ✅ Schema موحّد (Organization + WebSite + Offer)
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://intooly.com/#organization',
      'name': 'Intooly',
      'url': 'https://intooly.com',
      'logo': 'https://intooly.com/web-app-manifest-512x512.png',
      'description': 'منصة أدوات مجانية احترافية لمعالجة الصور والفيديو والنصوص تعمل محلياً في المتصفح.',
      'email': 'support@intooly.com',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'EG',
      },
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+201130303820',
        'email': 'support@intooly.com',
        'contactType': 'customer support',
        'availableLanguage': ['Arabic', 'English'],
        'areaServed': 'Global',
      },
      'makesOffer': {
        '@type': 'Offer',
        'name': 'Free Online Tools',
        'price': '0',
        'priceCurrency': 'USD',
        'availability': 'https://schema.org/InStock',
        'url': 'https://intooly.com/tools',
      },
      'sameAs': [
        'https://twitter.com/intooly',
        'https://www.linkedin.com/company/intooly',
        'https://github.com/intoolysite-ship-it/intooly',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://intooly.com/#website',
      'name': 'Intooly',
      'alternateName': 'أدوات مجانية احترافية',
      'url': 'https://intooly.com',
      'inLanguage': 'ar',
      'description': 'منصة أدوات مجانية احترافية لمعالجة الصور والفيديو والملفات.',
      'publisher': { '@id': 'https://intooly.com/#organization' },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://intooly.com/tools?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Offer',
      '@id': 'https://intooly.com/#offer',
      'name': 'Free Online Tools',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock',
      'url': 'https://intooly.com/tools',
      'seller': { '@id': 'https://intooly.com/#organization' },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} overflow-x-hidden`}>
      <head>
        {/* Schema.org (موحّد) */}
        <script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />

        {/* رابط بديل Markdown للوكلاء */}
        <link rel="alternate" type="text/markdown" href="/llms.txt" />

        {/* Preconnect: blog.intooly.com */}
        <link rel="preconnect" href="https://blog.intooly.com" />
        <AhrefsAnalytics />

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "za1fi4mh0g");
          `}
        </Script>
        {/* Google Analytics 4 */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7439471977682480"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-ink-50 text-ink-800">
        <Header />
        <main className="flex-grow w-full max-w-full overflow-x-hidden">
          {children}
        </main>
        <Footer />
        <CookieConsent />
        <ScrollToTop />
      </body>
    </html>
  );
}