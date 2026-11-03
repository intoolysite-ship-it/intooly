import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Archive,
  Share2,
  Music,
  Film,
  Image as ImageIcon,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø£ÙˆÙ†Ù„Ø§ÙŠÙ† Ù…Ø¬Ø§Ù†Ù‹Ø§: Ù‚Øµ ÙˆØ¶ØºØ· ÙˆØªØ­ÙˆÙŠÙ„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ | Intooly',
  description:
    'Ø§ÙƒØªØ´Ù Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ù„Ù‚Øµ Ø§Ù„Ù…Ù‚Ø§Ø·Ø¹ ÙˆØ¶ØºØ·Ù‡Ø§ ÙˆØªØ­ÙˆÙŠÙ„Ù‡Ø§ ÙˆØ§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„ØµÙˆØª ÙˆØ¥Ù†Ø´Ø§Ø¡ GIFØŒ Ù…Ø¹ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… ÙˆØ§Ù„Ù‚ÙŠÙˆØ¯ Ù„ÙƒÙ„ Ø£Ø¯Ø§Ø©.',
  alternates: {
    canonical: 'https://intooly.com/tools/video',
  },
  openGraph: {
    title: 'Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø£ÙˆÙ†Ù„Ø§ÙŠÙ† Ù…Ø¬Ø§Ù†Ù‹Ø§ | Intooly',
    description: 'Ù‚Øµ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙˆØ¶ØºØ·Ù‡ ÙˆØªØ­ÙˆÙŠÙ„ ØµÙŠØºØªÙ‡ ÙˆØ§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„ØµÙˆØª ÙˆØ¥Ù†Ø´Ø§Ø¡ ØµÙˆØ± GIF Ù…ØªØ­Ø±ÙƒØ©.',
    url: 'https://intooly.com/tools/video',
    siteName: 'Intooly',
    locale: 'ar_EG',
    type: 'website',
  },
};

const tools = [
  { icon: Archive, title: 'Ø¶ØºØ· Ø§Ù„ÙÙŠØ¯ÙŠÙˆ', description: 'Ù‚Ù„Ù‘Ù„ Ø­Ø¬Ù… Ù…Ù„ÙØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ù„ØªØ³Ù‡ÙŠÙ„ Ø±ÙØ¹Ù‡Ø§ ÙˆÙ…Ø´Ø§Ø±ÙƒØªÙ‡Ø§.', href: '/tools/video-compressor' },
  { icon: Share2, title: 'ØªØ­ÙˆÙŠÙ„ ØµÙŠØº Ø§Ù„ÙÙŠØ¯ÙŠÙˆ', description: 'Ø­ÙˆÙ‘Ù„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¨ÙŠÙ† Ø§Ù„ØµÙŠØº Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ…Ø© Ù…Ø«Ù„ MP4 ÙˆWebM ÙˆMOV.', href: '/tools/video-converter' },
  { icon: Music, title: 'ØªØ­ÙˆÙŠÙ„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¥Ù„Ù‰ ØµÙˆØª', description: 'Ø§Ø³ØªØ®Ø±Ø¬ Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„ØµÙˆØªÙŠ Ù…Ù† Ù…Ù„ÙØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ.', href: '/tools/video-to-audio' },
  { icon: Film, title: 'Ù‚Øµ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ', description: 'Ø­Ø¯Ù‘Ø¯ Ø¨Ø¯Ø§ÙŠØ© ÙˆÙ†Ù‡Ø§ÙŠØ© Ø§Ù„Ù…Ù‚Ø·Ø¹ Ù„Ù‚Øµ Ø§Ù„Ø¬Ø²Ø¡ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨.', href: '/tools/video-trimmer' },
  { icon: Film, title: 'ØªØ­ÙˆÙŠÙ„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¥Ù„Ù‰ GIF', description: 'Ø­ÙˆÙ‘Ù„ Ø¬Ø²Ø¡Ù‹Ø§ Ù…Ù† Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¥Ù„Ù‰ ØµÙˆØ±Ø© GIF Ù…ØªØ­Ø±ÙƒØ©.', href: '/tools/video-to-gif' },
  { icon: ImageIcon, title: 'ØµØ§Ù†Ø¹ Ø§Ù„ØµÙˆØ± Ø§Ù„Ù…ØµØºÙ‘Ø±Ø© Ù„Ù„ÙÙŠØ¯ÙŠÙˆ', description: 'Ø£Ù†Ø´Ø¦ ØµÙˆØ±Ø© Ù…ØµØºÙ‘Ø±Ø© Ø¬Ø°Ø§Ø¨Ø© Ù„Ù„ÙÙŠØ¯ÙŠÙˆØŒ ÙˆØ£Ø¶Ù Ø§Ù„Ù†ØµÙˆØµ ÙˆØµÙ…Ù‘Ù… ØºÙ„Ø§ÙÙ‹Ø§ Ù…Ù†Ø§Ø³Ø¨Ù‹Ø§ Ù„Ù…Ø­ØªÙˆØ§Ùƒ.', href: '/tools/video-thumbnail-maker' },
];

const faqs = [
  { q: 'Ù‡Ù„ Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ù…Ø¬Ø§Ù†ÙŠØ©ØŸ', a: 'ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© Ù…Ø¬Ø§Ù†Ù‹Ø§ ÙˆÙÙ‚Ù‹Ø§ Ù„Ù„ÙˆØ¸Ø§Ø¦Ù ÙˆØ§Ù„Ù‚ÙŠÙˆØ¯ Ø§Ù„Ù…ÙˆØ¶Ø­Ø© ÙÙŠ ØµÙØ­Ø© ÙƒÙ„ Ø£Ø¯Ø§Ø©.' },
  { q: 'Ù…Ø§ Ø§Ù„ØµÙŠØº Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ…Ø©ØŸ', a: 'ØªØ®ØªÙ„Ù Ø§Ù„ØµÙŠØº Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ…Ø© Ø­Ø³Ø¨ Ø§Ù„Ø£Ø¯Ø§Ø©. Ø±Ø§Ø¬Ø¹ ØµÙØ­Ø© ÙƒÙ„ Ø£Ø¯Ø§Ø© Ù„Ù…Ø¹Ø±ÙØ© Ø§Ù„ØµÙŠØº Ø§Ù„ØªÙŠ ØªØ¯Ø¹Ù…Ù‡Ø§.' },
  { q: 'ÙƒÙ… ÙŠØ³ØªØºØ±Ù‚ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„ÙÙŠØ¯ÙŠÙˆØŸ', a: 'ØªØ¹ØªÙ…Ø¯ Ù…Ø¯Ø© Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø¹Ù„Ù‰ Ø­Ø¬Ù… Ø§Ù„Ù…Ù„Ù ÙˆØµÙŠØºØªÙ‡ ÙˆÙ‚Ø¯Ø±Ø§Øª Ø§Ù„Ø¬Ù‡Ø§Ø² ÙˆØ§Ù„Ù…ØªØµÙØ­.' },
  { q: 'Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø£Ø¯ÙˆØ§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø¬ÙˆØ§Ù„ØŸ', a: 'Ù†Ø¹Ù…ØŒ Ù…Ø¹ Ù…Ø±Ø§Ø¹Ø§Ø© Ø£Ù† Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„ÙƒØ¨ÙŠØ±Ø© Ù‚Ø¯ ØªØ­ØªØ§Ø¬ Ù…ÙˆØ§Ø±Ø¯ Ø£ÙƒØ¨Ø±.' },
];

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ â€” Intooly',
  url: 'https://intooly.com/tools/video',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Ù…Ø¬Ù…ÙˆØ¹Ø© Ø£Ø¯ÙˆØ§Øª Ù…Ø¬Ø§Ù†ÙŠØ© Ù„ØªØ­ÙˆÙŠÙ„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙˆØ¶ØºØ·Ù‡ ÙˆÙ‚ØµÙ‡ ÙˆØ§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„ØµÙˆØª Ù…Ù†Ù‡ Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…ØªØµÙØ­.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©', item: 'https://intooly.com' },
    { '@type': 'ListItem', position: 2, name: 'Ø§Ù„Ø£Ø¯ÙˆØ§Øª', item: 'https://intooly.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ', item: 'https://intooly.com/tools/video' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Ù‡Ù„ Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ù…Ø¬Ø§Ù†ÙŠØ©ØŸ',
      acceptedAnswer: { '@type': 'Answer', text: 'Ù†Ø¹Ù…ØŒ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¯ÙˆØ§Øª Ù…Ø¬Ø§Ù†ÙŠØ© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ Ø¨Ø¯ÙˆÙ† ØªØ³Ø¬ÙŠÙ„.' },
    },
    {
      '@type': 'Question',
      name: 'Ù…Ø§ Ø§Ù„ØµÙŠØº Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ…Ø©ØŸ',
      acceptedAnswer: { '@type': 'Answer', text: 'Ù†Ø¯Ø¹Ù… MP4 Ùˆ WebM Ùˆ MOV ÙˆØºÙŠØ±Ù‡Ø§. Ø±Ø§Ø¬Ø¹ ØµÙØ­Ø© ÙƒÙ„ Ø£Ø¯Ø§Ø© Ù„Ù„ØªÙØ§ØµÙŠÙ„.' },
    },
    {
      '@type': 'Question',
      name: 'Ù‡Ù„ ÙÙŠØ¯ÙŠÙˆÙ‡Ø§ØªÙŠ Ø¢Ù…Ù†Ø©ØŸ',
      acceptedAnswer: { '@type': 'Answer', text: 'Ù†Ø¹Ù…ØŒ Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª ØªÙØ¹Ø§Ù„Ø¬ Ø¯Ø§Ø®Ù„ Ù…ØªØµÙØ­Ùƒ Ù…Ø¨Ø§Ø´Ø±Ø©.' },
    },
    {
      '@type': 'Question',
      name: 'Ù‡Ù„ ØªØ¹Ù…Ù„ Ø¹Ù„Ù‰ Ø§Ù„Ø¬ÙˆØ§Ù„ØŸ',
      acceptedAnswer: { '@type': 'Answer', text: 'Ù†Ø¹Ù…ØŒ Ø§Ù„Ø£Ø¯ÙˆØ§Øª Ù…ØªÙˆØ§ÙÙ‚Ø© Ù…Ø¹ Ø§Ù„Ù…ØªØµÙØ­Ø§Øª Ø§Ù„Ø­Ø¯ÙŠØ«Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø¬ÙˆØ§Ù„ ÙˆØ§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø§Ù„Ù„ÙˆØ­ÙŠØ©.' },
    },
  ],
};

export default function VideoToolsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
        <div className="container relative mx-auto px-4 py-12 md:py-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
            <BookOpen className="h-4 w-4" />
            Intooly Video Suite
          </span>
          <h1 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-black tracking-tight text-ink-900">
            Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø£ÙˆÙ†Ù„Ø§ÙŠÙ† Ù„Ù‚Øµ Ø§Ù„Ù…Ù‚Ø§Ø·Ø¹ ÙˆØ¶ØºØ·Ù‡Ø§ ÙˆØªØ­ÙˆÙŠÙ„Ù‡Ø§
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
            Ø§Ø³ØªÙƒØ´Ù Ø£Ø¯ÙˆØ§Øª Ù„Ù‚Øµ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙˆØ¶ØºØ·Ù‡ ÙˆØªØ­ÙˆÙŠÙ„ ØµÙŠØºØªÙ‡ Ø£Ùˆ Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„ØµÙˆØª ÙˆØ¥Ù†Ø´Ø§Ø¡ ØµÙˆØ± GIF Ù…ØªØ­Ø±ÙƒØ©.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-black text-ink-900 md:text-2xl">Ø¬Ù…ÙŠØ¹ Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø§Ù„Ù…ØªØ§Ø­Ø©</h2>
          <p className="mt-3 text-base text-ink-600 max-w-3xl mx-auto leading-8">Ø§Ø®ØªØ± Ø§Ù„Ø£Ø¯Ø§Ø© Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù…Ù‡Ù…ØªÙƒ.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const IconComp = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 text-right transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 transition-transform group-hover:scale-110">
                  <IconComp className="h-5 w-5 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-ink-900 transition-colors group-hover:text-brand-600">{tool.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-600">{tool.description}</p>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                    Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø£Ø¯Ø§Ø©
                    <ArrowLeft className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white">
        <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
          <div className="text-right">
            <h2 className="mb-6 text-xl font-black text-ink-900 md:text-2xl">Ù‚Øµ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙˆØªØ­ÙˆÙŠÙ„Ù‡ ÙˆØªÙ‚Ù„ÙŠÙ„ Ø­Ø¬Ù…Ù‡ Ø£ÙˆÙ†Ù„Ø§ÙŠÙ†</h2>
            <p className="mb-4 leading-8 text-ink-700">
              ØªÙˆÙÙ‘Ø± Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¹Ù„Ù‰ Intooly Ù…Ø¬Ù…ÙˆØ¹Ø© Ù…Ù† Ø§Ù„ÙˆØ¸Ø§Ø¦Ù Ø§Ù„ØªÙŠ ØªØ³Ø§Ø¹Ø¯Ùƒ Ø¹Ù„Ù‰ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ù…Ù‚Ø§Ø·Ø¹ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¹Ø¨Ø± Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª. ÙŠÙ…ÙƒÙ†Ùƒ Ù‚Øµ Ø¬Ø²Ø¡ Ù…Ø­Ø¯Ø¯ Ù…Ù† Ø§Ù„ÙÙŠØ¯ÙŠÙˆØŒ ÙˆØªÙ‚Ù„ÙŠÙ„ Ø­Ø¬Ù… Ø§Ù„Ù…Ù„Ù Ù„ÙŠÙƒÙˆÙ† Ù…Ù†Ø§Ø³Ø¨Ù‹Ø§ Ù„Ù„Ø±ÙØ¹ØŒ ÙˆØªØ­ÙˆÙŠÙ„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¨ÙŠÙ† Ø§Ù„ØµÙŠØº Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ…Ø© Ù…Ø«Ù„ MP4 ÙˆWebM ÙˆMOV.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              ØªØ´Ù…Ù„ Ø£Ø¯ÙˆØ§Øª Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø£ÙŠØ¶Ù‹Ø§ Ø¥Ù…ÙƒØ§Ù†ÙŠØ© Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„ØµÙˆØªÙŠ Ù…Ù† Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙˆØªØ­ÙˆÙŠÙ„Ù‡ Ø¥Ù„Ù‰ Ù…Ù„Ù ØµÙˆØªÙŠØŒ ÙˆØªØ­ÙˆÙŠÙ„ Ø¬Ø²Ø¡ Ù…Ù† Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¥Ù„Ù‰ ØµÙˆØ±Ø© GIF Ù…ØªØ­Ø±ÙƒØ©. Ù‡Ø°Ù‡ Ø§Ù„ÙˆØ¸Ø§Ø¦Ù Ù…ÙÙŠØ¯Ø© Ù„ØµÙ†Ù‘Ø§Ø¹ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙˆØ§Ù„Ù…Ø³ÙˆÙ‚ÙŠÙ† ÙˆØ£ØµØ­Ø§Ø¨ Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„Ø°ÙŠÙ† ÙŠØ­ØªØ§Ø¬ÙˆÙ† Ø¥Ù„Ù‰ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø³Ø±ÙŠØ¹Ø© Ù„Ù„ÙÙŠØ¯ÙŠÙˆ.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              ØªØ¹ØªÙ…Ø¯ Ù…Ø¯Ø© Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø¹Ù„Ù‰ Ø­Ø¬Ù… Ø§Ù„Ù…Ù„Ù ÙˆØµÙŠØºØªÙ‡ ÙˆÙ‚Ø¯Ø±Ø§Øª Ø§Ù„Ø¬Ù‡Ø§Ø² ÙˆØ§Ù„Ù…ØªØµÙØ­. Ù‚Ø¨Ù„ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ù…Ù‚Ø§Ø·Ø¹ Ø§Ù„ÙƒØ¨ÙŠØ±Ø©ØŒ ØªØ­Ù‚Ù‚ Ù…Ù† Ù…ØªØ·Ù„Ø¨Ø§Øª Ø§Ù„Ø£Ø¯Ø§Ø© ÙˆØ­Ø¯ÙˆØ¯ Ø­Ø¬Ù… Ø§Ù„Ù…Ù„Ù ÙˆØ§Ù„ØµÙŠØº Ø§Ù„ØªÙŠ ØªØ¯Ø¹Ù…Ù‡Ø§.
            </p>

            <h3 className="mb-4 mt-10 text-xl font-bold text-ink-900 md:text-2xl">Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©</h3>
            <div className="space-y-5">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h4 className="mb-2 text-base font-bold text-ink-900 md:text-lg">{faq.q}</h4>
                  <p className="leading-8 text-ink-700">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </main>
    </>
  );
}