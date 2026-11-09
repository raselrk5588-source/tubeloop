import { NextRequest, NextResponse } from 'next/server';
import { getDriveOAuth2Client, getDriveBaseUrl } from '@/lib/google-drive-auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const baseUrl = getDriveBaseUrl();
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google Drive OAuth Error:', error);
    return NextResponse.redirect(new URL('/dashboard/drive?error=oauth_failed', baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/drive?error=no_code', baseUrl));
  }

  try {
    const oauth2Client = getDriveOAuth2Client();
    
    // Get tokens from Google
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save tokens to the user's profile
    await prisma.user.update({
      where: {
        id: (session.user as any).id,
      },
      data: {
        driveAccessToken: tokens.access_token ?? null,
        driveRefreshToken: tokens.refresh_token ?? null,
      },
    });

    return NextResponse.redirect(new URL('/dashboard/drive?success=true', baseUrl));
  } catch (error: any) {
    console.error('Error during Google Drive OAuth callback:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(new URL(`/dashboard/drive?error=server_error&details=${encodeURIComponent(errorMessage)}`, baseUrl));
  }
}
