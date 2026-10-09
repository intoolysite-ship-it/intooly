import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import ScrollToTop from '@/components/ScrollToTop';
export const metadata: Metadata = {
  metadataBase: new URL('https://intooly.com'),
  title: {
    default: 'intooly - أدوات مجانية احترافية تعمل محلياً',
    template: '%s | intooly',
  },
  description:
    'منصة أدوات مجانية احترافية لمعالجة الصور والفيديو والنصوص تعمل محلياً 100% في متصفحك لضمان خصوصيتك وسرعتك.',
  keywords: [
    'أدوات مجانية',
    'خصوصية البيانات',
    'معالجة محلية',
    'intooly',
    'ضغط الصور',
    'إزالة الخلفية',
  ],
  authors: [{ name: 'intooly', url: 'https://intooly.com' }],
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
    siteName: 'intooly',
    title: 'intooly - أدوات مجانية احترافية',
    description:
      'منصة أدوات مجانية احترافية تعمل محلياً في متصفحك لضمان خصوصيتك الكاملة.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'intooly',
      },
    ],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111827',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className="overflow-x-hidden"
    >
      <head>
        {/* Schema.org: Organization */}
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'intooly',
              url: 'https://intooly.com',
              logo: 'https://intooly.com/logo.png',
              description:
                'منصة أدوات مجانية احترافية لمعالجة الصور والفيديو والنصوص تعمل محلياً في المتصفح',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'support@intooly.com',
                contactType: 'customer support',
                availableLanguage: ['Arabic', 'English'],
              },
            }),
          }}
        />

        {/* ✅ Google Fonts: Cairo — عبر <link> مباشر */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Google Analytics 4 — مع Cookie Consent Mode */}
        <Script
          id="google-analytics-consent"
          strategy="afterInteractive"
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
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
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