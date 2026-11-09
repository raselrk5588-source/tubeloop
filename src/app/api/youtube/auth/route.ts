import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('mode');
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload'
  ];

  const oauth2Client = getOAuth2Client();

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force to get refresh token
    state: mode === 'personal' ? 'personal' : undefined,
  });

  return NextResponse.redirect(url);
}
