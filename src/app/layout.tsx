import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-cairo',
});

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
      className={`${cairo.variable} overflow-x-hidden`}
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
      </head>
      {/* ✅ تم حذف: dark:bg-ink-950, dark:text-ink-100, transition-colors duration-300 */}
      <body className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-ink-50 text-ink-800">
        <Header />
        <main className="flex-grow w-full max-w-full overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}