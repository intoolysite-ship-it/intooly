'use client';

import Script from 'next/script';

export default function AhrefsAnalytics() {
  return (
    <Script
      id="ahrefs-analytics"
      src="https://analytics.ahrefs.com/analytics.js"
      data-key="EpC8A9XfuON9MmLMHyublA"
      strategy="afterInteractive"
    />
  );
}