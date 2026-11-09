import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDriveClient, listVideosInFolder, downloadVideoFromDrive } from "@/lib/google-drive";
import { generateVideoMetadata } from "@/lib/gemini";
import { uploadVideoToYouTube } from "@/lib/google";

// Protect this route from public access (optional, e.g., require a secret key from Cron service)
const CRON_SECRET = process.env.CRON_SECRET || "default_dev_secret_123";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Find all users who have driveSyncEnabled and driveFolderId set
    const users = await prisma.user.findMany({
      where: {
        driveSyncEnabled: true,
        driveFolderId: { not: null },
        driveAccessToken: { not: null },
      },
    });

    const results = [];

    for (const user of users) {
      try {
        const drive = await getDriveClient(user.driveAccessToken!, user.driveRefreshToken || "");
        
        // 2. Fetch videos from their drive folder
        const driveVideos = await listVideosInFolder(drive, user.driveFolderId!);
        
        for (const driveVideo of driveVideos) {
          // Check if this video has already been processed
          const existing = await prisma.video.findUnique({
            where: { driveFileId: driveVideo.id },
          });

          if (existing) continue;

          // 3. This is a new video. Generate metadata with Gemini AI
          const metadata = await generateVideoMetadata(driveVideo.name);
          
          const finalDescription = user.defaultVideoDescription
            ? `${metadata.description}\n\n${user.defaultVideoDescription}`
            : metadata.description;

          // 4. Download video from drive
          const fileUrl = await downloadVideoFromDrive(drive, driveVideo.id, driveVideo.name);
          const defaultThumbnail = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80";

          // 5. Determine upload status and channel assignment based on account mode
          const isPersonalMode = user.accountMode === 'PERSONAL';
          
          const newVideo = await prisma.video.create({
            data: {
              title: metadata.title,
              description: finalDescription,
              tags: metadata.tags,
              fileUrl,
              thumbnail: defaultThumbnail,
              status: isPersonalMode ? "READY_FOR_UPLOAD" : "PENDING", // PENDING for platform, READY_FOR_UPLOAD for personal
              userId: user.id,
              assignedChannelId: isPersonalMode ? user.personalYouTubeChannelId : user.assignedChannelId,
              driveFileId: driveVideo.id,
              isAiGenerated: true,
            },
          });

          results.push({ action: "fetched_from_drive", userId: user.id, videoId: newVideo.id, title: newVideo.title });
        }
        
        // --- AUTO UPLOAD LOGIC ---
        const now = new Date();
        let shouldUpload = false;
        
        if (user.driveWarmupEnabled) {
          // Warmup logic overrides custom schedule with fixed intervals
          const uploadCount = await prisma.video.count({
            where: { userId: user.id, isAiGenerated: true, status: "APPROVED" }
          });
          let currentInterval = user.uploadIntervalHours || 5;
          if (uploadCount < 3) currentInterval = 24;
          else if (uploadCount < 10) currentInterval = 12;
          
          const nextUploadTime = user.lastUploadTime 
            ? new Date(user.lastUploadTime.getTime() + currentInterval * 60 * 60 * 1000)
            : new Date(0);
            
          shouldUpload = now >= nextUploadTime;
        } else {
          // Custom Time Slots Logic (Bangladesh Time BST is UTC+6)
          const bstOffset = 6 * 60 * 60 * 1000;
          const scheduleStr = (user as any).uploadScheduleTimes || "10:00,13:30,16:00,18:30,20:30,21:00,22:00,00:30,02:00";
          const scheduledTimes = scheduleStr.split(',').map((t: string) => t.trim()).filter(Boolean);
          
          if (!user.lastUploadTime) {
            shouldUpload = true; // Never uploaded before
          } else {
            const recentScheduledDates: Date[] = [];
            
            for (let i = 0; i <= 1; i++) {
              const bstDate = new Date(now.getTime() + bstOffset - i * 24 * 60 * 60 * 1000);
              
              for (const timeStr of scheduledTimes) {
                const [hours, minutes] = timeStr.split(':').map(Number);
                const schedDateUTC = new Date(Date.UTC(
                  bstDate.getUTCFullYear(),
                  bstDate.getUTCMonth(),
                  bstDate.getUTCDate(),
                  hours,
                  minutes,
                  0
                ));
                schedDateUTC.setTime(schedDateUTC.getTime() - bstOffset);
                recentScheduledDates.push(schedDateUTC);
              }
            }
            
            recentScheduledDates.sort((a, b) => b.getTime() - a.getTime());
            const mostRecentPassedSchedule = recentScheduledDates.find(d => d.getTime() <= now.getTime());
            
            if (mostRecentPassedSchedule && mostRecentPassedSchedule.getTime() > user.lastUploadTime.getTime()) {
              shouldUpload = true;
            }
          }
        }
          
        if (shouldUpload) {
          const uploadStatus = user.accountMode === 'PERSONAL' ? { in: ["READY_FOR_UPLOAD", "PENDING"] } : "APPROVED";

          // Find the oldest pending video for this user
          const videoToUpload = await prisma.video.findFirst({
            where: {
              userId: user.id,
              status: uploadStatus,
              isAiGenerated: true,
            },
            orderBy: { createdAt: "asc" },
            include: { assignedChannel: true }
          });
          
          if (videoToUpload && videoToUpload.assignedChannel) {
            
            try {
              const youtubeVideoId = await uploadVideoToYouTube({
                accessToken: videoToUpload.assignedChannel.accessToken || "",
                refreshToken: videoToUpload.assignedChannel.refreshToken || "",
                title: videoToUpload.title,
                description: videoToUpload.description || "",
                tags: videoToUpload.tags ? videoToUpload.tags.split(',').map(t => t.trim()) : [],
                localFilePath: videoToUpload.fileUrl,
                privacyStatus: 'public', 
              });
              
              await prisma.video.update({
                where: { id: videoToUpload.id },
                data: {
                  status: "UPLOADED", 
                  youtubeVideoId: youtubeVideoId,
                }
              });
              
              results.push({ action: "uploaded_to_youtube", userId: user.id, videoId: videoToUpload.id, youtubeVideoId });
            } catch (uploadErr: any) {
              console.error(`YouTube Upload Error for Video ${videoToUpload.id}:`, uploadErr);
              await prisma.video.update({
                where: { id: videoToUpload.id },
                data: {
                  status: "UPLOAD_FAILED",
                  rejectionReason: uploadErr.message || "Failed to upload to YouTube",
                }
              });
              results.push({ action: "upload_failed", userId: user.id, videoId: videoToUpload.id, error: uploadErr.message });
            }
            
            // Update user's last upload time regardless of success/fail to avoid rapid retries looping
            await prisma.user.update({
              where: { id: user.id },
              data: { lastUploadTime: now }
            });
          }
        }
      } catch (err: any) {
        console.error(`Error processing user ${user.id}:`, err);
        results.push({ userId: user.id, error: err.message });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
