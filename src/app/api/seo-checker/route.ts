/**
 * Route Handler — جلب HTML من رابط عبر الخادم.
 * يعمل بدون CORS (لأن الطلب من الخادم وليس المتصفح).
 * يحمي من SSRF (Server-Side Request Forgery).
 */

import { NextRequest, NextResponse } from 'next/server';
import type { FetchResponse } from '@/lib/seo-checker/types';

const TIMEOUT_MS = 10000;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// ============================================
// حماية SSRF: منع عناوين داخلية
// ============================================

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();

  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h.endsWith('.local') ||
    h.endsWith('.internal')
  ) {
    return true;
  }

  // IPv4 private ranges
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const m = h.match(ipv4);
  if (m) {
    const [, a, b] = m.map(Number);
    if (
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 127
    ) {
      return true;
    }
  }

  return false;
}

// ============================================
// POST /api/seo-checker
// ============================================

export async function POST(req: NextRequest): Promise<NextResponse<FetchResponse>> {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'طلب غير صالح', errorCode: 'INVALID_URL' },
      { status: 400 }
    );
  }

  const rawUrl = (body?.url || '').trim();

  if (!rawUrl) {
    return NextResponse.json(
      { success: false, error: 'الرابط مطلوب', errorCode: 'INVALID_URL' },
      { status: 400 }
    );
  }

  let url: URL;
  try {
    url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  } catch {
    return NextResponse.json(
      { success: false, error: 'صيغة الرابط غير صحيحة', errorCode: 'INVALID_URL' },
      { status: 400 }
    );
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return NextResponse.json(
      { success: false, error: 'يُسمح فقط بـ http/https', errorCode: 'INVALID_URL' },
      { status: 400 }
    );
  }

  if (isPrivateHost(url.hostname)) {
    return NextResponse.json(
      {
        success: false,
        error: 'لا يُسمح بجلب العناوين الداخلية أو المحلية.',
        errorCode: 'INVALID_URL',
      },
      { status: 403 }
    );
  }

  // ============ الجلب ============
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startTime = Date.now();

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; IntoolySEOChecker/1.0; +https://intooly.com/tools/seo-checker)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en;q=0.9',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const responseTimeMs = Date.now() - startTime;

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: `الخادم أعاد حالة ${res.status} ${res.statusText}`,
        errorCode: 'NETWORK',
        fetchInfo: {
          url: url.toString(),
          status: res.status,
          statusText: res.statusText,
          contentType: res.headers.get('content-type') || '',
          responseTimeMs,
          finalUrl: res.url,
          redirected: res.url !== url.toString(),
        },
      });
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();

    if (!contentType.includes('html') && !contentType.includes('xml') && !contentType.includes('text')) {
      return NextResponse.json({
        success: false,
        error: `نوع المحتوى غير مدعوم: ${contentType || 'غير معروف'}. الأداة تفحص صفحات HTML فقط.`,
        errorCode: 'NOT_HTML',
        fetchInfo: {
          url: url.toString(),
          status: res.status,
          statusText: res.statusText,
          contentType,
          responseTimeMs,
          finalUrl: res.url,
          redirected: res.url !== url.toString(),
        },
      });
    }

    const contentLength = res.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_SIZE) {
      return NextResponse.json({
        success: false,
        error: `حجم الصفحة كبير جدًا (الحد 5MB). الحجم: ${(Number(contentLength) / 1024 / 1024).toFixed(1)}MB.`,
        errorCode: 'TOO_LARGE',
      });
    }

    const html = await res.text();

    if (html.length > MAX_SIZE) {
      return NextResponse.json({
        success: false,
        error: `حجم HTML تجاوز 5MB.`,
        errorCode: 'TOO_LARGE',
      });
    }

    if (!html.trim()) {
      return NextResponse.json({
        success: false,
        error: 'الصفحة فارغة أو تُحمّل بالجافاسكربت.',
        errorCode: 'NETWORK',
      });
    }

    return NextResponse.json({
      success: true,
      html,
      fetchInfo: {
        url: url.toString(),
        status: res.status,
        statusText: res.statusText,
        contentType,
        responseTimeMs,
        finalUrl: res.url,
        redirected: res.url !== url.toString(),
      },
    });
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        success: false,
        error: `انتهت المهلة (${TIMEOUT_MS / 1000} ثانية). الصفحة بطيئة أو لا تستجيب.`,
        errorCode: 'TIMEOUT',
      });
    }

    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? `تعذّر الاتصال: ${error.message}`
          : 'تعذّر الاتصال بالصفحة.',
      errorCode: 'NETWORK',
    });
  }
}

// ============================================
// OPTIONS /api/seo-checker (CORS preflight)
// ============================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
