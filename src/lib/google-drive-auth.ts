import { google } from 'googleapis';

export const getDriveBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://tubeloop.vxsbd.com';
};

// Create a separate OAuth client for Drive to avoid conflicting redirect URIs
export const getDriveOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${getDriveBaseUrl()}/api/drive/callback`
  );
};
