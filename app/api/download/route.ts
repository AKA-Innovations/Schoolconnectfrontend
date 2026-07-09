import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  new URL(process.env.NEXT_PUBLIC_API_URL || 'https://skoolconnectbackend.onrender.com').hostname,
  'localhost',
  '127.0.0.1',
  'res.cloudinary.com',
  'storage.googleapis.com',
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download';

  if (!fileUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(fileUrl);
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      return NextResponse.json({ error: 'Forbidden host' }, { status: 403 });
    }

    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const headers = new Headers();
    
    // Set headers to trigger a browser download
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Download proxy error:', error);
    return NextResponse.json({ error: error.message || 'Failed to download file' }, { status: 500 });
  }
}
