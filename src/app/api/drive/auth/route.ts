import { NextRequest, NextResponse } from 'next/server';
import { getDriveOAuth2Client } from '@/lib/google-drive-auth';

export async function GET(req: NextRequest) {
  const oauth2Client = getDriveOAuth2Client();
  
  // Generate a url that asks permissions for Google Drive read-only scopes
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force to get refresh token
  });

  return NextResponse.redirect(url);
}
