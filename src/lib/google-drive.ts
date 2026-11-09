import { google } from 'googleapis';
import { getDriveOAuth2Client } from './google-drive-auth';
import fs from 'fs';
import path from 'path';

export interface DriveVideo {
  id: string;
  name: string;
  mimeType: string;
}

export async function getDriveClient(accessToken: string, refreshToken: string) {
  const oauth2Client = getDriveOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function listVideosInFolder(drive: any, folderId: string): Promise<DriveVideo[]> {
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'video/') and trashed = false`,
      fields: 'files(id, name, mimeType)',
      orderBy: 'createdTime asc',
    });
    return res.data.files || [];
  } catch (error) {
    console.error('Error listing Drive videos:', error);
    throw error;
  }
}

export async function downloadVideoFromDrive(drive: any, fileId: string, filename: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public/uploads/videos');
  
  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueName = `${Date.now()}-${cleanFilename}`;
  const destPath = path.join(uploadDir, uniqueName);
  
  const dest = fs.createWriteStream(destPath);
  
  try {
    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    
    return new Promise((resolve, reject) => {
      res.data
        .on('end', () => {
          resolve(`/uploads/videos/${uniqueName}`);
        })
        .on('error', (err: any) => {
          console.error('Error downloading file.');
          reject(err);
        })
        .pipe(dest);
    });
  } catch (error) {
    console.error('Error in Drive API get:', error);
    throw error;
  }
}
export async function uploadVideoToDrive(drive: any, filePath: string, filename: string, folderId: string) {
  try {
    const fileMetadata = {
      name: filename,
      parents: [folderId]
    };
    const media = {
      mimeType: 'video/mp4',
      body: fs.createReadStream(filePath)
    };
    
    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id'
    });
    
    return res.data;
  } catch (error) {
    console.error('Error uploading video to Drive:', error);
    throw error;
  }
}
