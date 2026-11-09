import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client, youtube, getBaseUrl } from '@/lib/google';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl();
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  const session = await getServerSession(authOptions);

  if (error) {
    console.error('Google OAuth Error:', error);
    return NextResponse.redirect(new URL('/admin/channels?error=oauth_failed', baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin/channels?error=no_code', baseUrl));
  }

  try {
    const oauth2Client = getOAuth2Client();
    
    // Get tokens from Google
    const { tokens } = await oauth2Client.getToken(code);
    
    // Set credentials temporarily to fetch channel info
    oauth2Client.setCredentials(tokens);

    // Fetch the user's YouTube channel
    const response = await youtube.channels.list({
      auth: oauth2Client,
      part: ['snippet'],
      mine: true,
    });

    const channels = response.data.items;
    
    if (!channels || channels.length === 0) {
      return NextResponse.redirect(new URL('/admin/channels?error=no_channel_found', baseUrl));
    }

    const channelInfo = channels[0];
    const channelId = channelInfo.id!;
    const channelTitle = channelInfo.snippet?.title || 'Unknown Channel';

    const isPersonal = state === 'personal';
    let ownerId = null;

    if (isPersonal) {
      if (!session || !session.user) {
        return NextResponse.redirect(new URL('/dashboard/profile?error=unauthorized', baseUrl));
      }
      ownerId = (session.user as any).id;
    }

    // Save or update the channel in the database
    const channel = await prisma.youTubeChannel.upsert({
      where: {
        channelId: channelId,
      },
      update: {
        name: channelTitle,
        accessToken: tokens.access_token ?? null,
        refreshToken: tokens.refresh_token ?? null,
        status: 'CONNECTED',
        ownerId: ownerId,
      },
      create: {
        name: channelTitle,
        channelId: channelId,
        accessToken: tokens.access_token ?? null,
        refreshToken: tokens.refresh_token ?? null,
        status: 'CONNECTED',
        ownerId: ownerId,
      },
    });

    if (isPersonal && ownerId) {
      // Link the channel to the user's personal channel and force mode to PERSONAL
      await prisma.user.update({
        where: { id: ownerId },
        data: {
          personalYouTubeChannelId: channel.id,
          accountMode: 'PERSONAL',
        },
      });
      return NextResponse.redirect(new URL('/dashboard/profile?success=youtube_connected', baseUrl));
    }

    return NextResponse.redirect(new URL('/admin/channels?success=true', baseUrl));
  } catch (error: any) {
    console.error('Error during Google OAuth callback:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(new URL(`/admin/channels?error=server_error&details=${encodeURIComponent(errorMessage)}`, baseUrl));
  }
}
