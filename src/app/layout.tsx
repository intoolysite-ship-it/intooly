import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Cairo } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import ScrollToTop from '@/components/ScrollToTop';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800'],
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
      'max-image-preview': 'large',
    },
  },
  verification: {
    google: 'oOXc7sK6VZPHb2T_EnFtgjFQxi1Q0wKpIaOBl5U0JG8',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://intooly.com',
    siteName: 'Intooly',
    title: 'Intooly - أدوات مجانية احترافية',
    description:
      'منصة أدوات مجانية احترافية تعمل محلياً في متصفحك لضمان خصوصيتك الكاملة.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Intooly',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon-144x144.png', type: 'image/png', sizes: '144x144' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111827',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Intooly',
  url: 'https://intooly.com',
  logo: 'https://intooly.com/web-app-manifest-512x512.png',
  description:
    'منصة أدوات مجانية احترافية لمعالجة الصور والفيديو والنصوص تعمل محلياً في المتصفح',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@intooly.com',
    contactType: 'customer support',
    availableLanguage: ['Arabic', 'English'],
  },
  sameAs: [],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Intooly',
  alternateName: 'أدوات مجانية احترافية',
  url: 'https://intooly.com',
  inLanguage: 'ar',
  description:
    'منصة أدوات مجانية احترافية لمعالجة الصور والفيديو والملفات',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} overflow-x-hidden`}>
      <head>
        {/* Schema.org: Organization */}
        <script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* Schema.org: WebSite */}
        <script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />

        {/* Preconnect: blog.intooly.com (لتحسين LCP) */}
        <link rel="preconnect" href="https://blog.intooly.com" />

        {/* Google Analytics 4 — مع Cookie Consent Mode (lazyOnload) */}
        <Script
          id="google-analytics-consent"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                wait_for_update: 500,
              });
              try {
                if (localStorage.getItem('cookie-consent') === 'accepted') {
                  gtag('consent', 'update', {
                    analytics_storage: 'granted',
                  });
                }
              } catch (e) {}
            `,
          }}
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-GB8VLXYS9Z"
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GB8VLXYS9Z', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {/* Google AdSense (lazyOnload) */}
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