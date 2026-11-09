import { google } from 'googleapis';

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://tubeloop.vxsbd.com';
};

export const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${getBaseUrl()}/api/youtube/callback`
  );
};

export const youtube = google.youtube('v3');

import fs from 'fs';
import path from 'path';

export interface YouTubeUploadParams {
  accessToken: string;
  refreshToken: string;
  title: string;
  description: string;
  tags: string[];
  localFilePath: string;
  privacyStatus?: 'public' | 'unlisted' | 'private';
}

export async function uploadVideoToYouTube(params: YouTubeUploadParams): Promise<string> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
  });

  const yt = google.youtube({ version: 'v3', auth: oauth2Client });

  // Resolve absolute path from public path
  // The DB stores fileUrl like "/uploads/videos/123-filename.mp4"
  // We need to map it to absolute local path
  let absolutePath = params.localFilePath;
  if (absolutePath.startsWith('/uploads')) {
    absolutePath = path.join(process.cwd(), 'public', absolutePath);
  }

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Local file not found: ${absolutePath}`);
  }

  const fileSize = fs.statSync(absolutePath).size;

  const res = await yt.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: params.title.substring(0, 100), // Max 100 chars
        description: params.description.substring(0, 5000), // Max 5000 chars
        tags: params.tags,
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: params.privacyStatus || 'public',
        selfDeclaredMadeForKids: false,
        // Ensure YouTube tags this as AI-generated/synthetic media
        // If the library typing doesn't support it yet, we can use any
        // @ts-ignore
        containsSyntheticMedia: true,
      },
    },
    media: {
      body: fs.createReadStream(absolutePath),
    },
  });

  if (res.data && res.data.id) {
    return res.data.id;
  } else {
    throw new Error('Failed to get video ID from YouTube API response');
  }
}
