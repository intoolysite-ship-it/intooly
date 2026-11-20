import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const url = body.get('url') as string;
    const hd = body.get('hd') || '1';

    if (!url || !url.includes('tiktok.com')) {
      return NextResponse.json(
        { code: -1, msg: 'رابط تيك توك غير صالح' },
        { status: 400 }
      );
    }

    console.log('[TikTok API] معالجة الرابط:', url);

    // الاتصال بـ API tikwm مباشرة
    const formData = new URLSearchParams();
    formData.append('url', url);
    formData.append('hd', hd.toString());

    const response = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      body: formData.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('[TikTok API] استجابة:', data.code);

    if (data.code !== 0 || !data.data) {
      return NextResponse.json(
        { 
          code: -1, 
          msg: data.msg || 'لم نتمكن من معالجة الفيديو. تأكد أنه عام (Public).' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      code: 0,
      data: {
        title: data.data.title || 'فيديو تيك توك',
        author: data.data.author?.nickname || 'مستخدم تيك توك',
        cover: data.data.cover,
        duration: data.data.duration || 0,
        videoUrl: data.data.play,
        hdVideoUrl: data.data.hdplay,
        audioUrl: data.data.music,
        noWatermarkUrl: data.data.play,
      }
    });

  } catch (error) {
    console.error('[TikTok API Error]', error);
    return NextResponse.json(
      { 
        code: -1, 
        msg: 'تعذر الاتصال بخادم تيك توك. يرجى المحاولة مرة أخرى.' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url || !url.includes('tiktok.com')) {
    return NextResponse.json(
      { code: -1, msg: 'رابط تيك توك غير صالح' },
      { status: 400 }
    );
  }

  try {
    const formData = new URLSearchParams();
    formData.append('url', url);
    formData.append('hd', '1');

    const response = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: formData.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 0 || !data.data) {
      return NextResponse.json(
        { code: -1, msg: data.msg || 'لم نتمكن من معالجة الفيديو.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      code: 0,
      data: {
        title: data.data.title || 'فيديو تيك توك',
        author: data.data.author?.nickname || 'مستخدم تيك توك',
        cover: data.data.cover,
        duration: data.data.duration || 0,
        videoUrl: data.data.play,
        hdVideoUrl: data.data.hdplay,
        audioUrl: data.data.music,
        noWatermarkUrl: data.data.play,
      }
    });

  } catch (error) {
    console.error('[TikTok API Error]', error);
    return NextResponse.json(
      { code: -1, msg: 'تعذر الاتصال بالخادم.' },
      { status: 500 }
    );
  }
}
