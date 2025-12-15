import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  const filename = req.nextUrl.searchParams.get('filename') || 'download.jpg';

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const headers = new Headers(response.headers);
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download proxy error:', error);
    return NextResponse.json({ error: 'Failed to download image' }, { status: 500 });
  }
}
