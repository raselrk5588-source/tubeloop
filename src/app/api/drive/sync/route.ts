import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getDriveClient, listVideosInFolder, downloadVideoFromDrive } from "@/lib/google-drive";
import { generateVideoMetadata } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!user || !user.driveFolderId || !user.driveAccessToken) {
      return NextResponse.json({ error: "Google Drive is not fully connected" }, { status: 400 });
    }

    const drive = await getDriveClient(user.driveAccessToken, user.driveRefreshToken || "");
    const driveVideos = await listVideosInFolder(drive, user.driveFolderId);
    
    let addedCount = 0;

    for (const driveVideo of driveVideos) {
      const existing = await prisma.video.findUnique({
        where: { driveFileId: driveVideo.id },
      });

      if (existing) continue;

      // New video found, generate metadata and save
      const metadata = await generateVideoMetadata(driveVideo.name);
      
      const finalDescription = user.defaultVideoDescription
        ? `${metadata.description}\n\n${user.defaultVideoDescription}`
        : metadata.description;
      
      // In a real production app, downloading large files synchronously in an API route is bad 
      // because it might hit Vercel's 10-60s timeout. But for this demo/local app, it's fine.
      const fileUrl = await downloadVideoFromDrive(drive, driveVideo.id, driveVideo.name);
      const defaultThumbnail = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80";

      const isPersonalMode = user.accountMode === 'PERSONAL';

      await prisma.video.create({
        data: {
          title: metadata.title,
          description: finalDescription,
          tags: metadata.tags,
          fileUrl,
          thumbnail: defaultThumbnail,
          status: isPersonalMode ? "READY_FOR_UPLOAD" : "PENDING",
          userId: user.id,
          assignedChannelId: isPersonalMode ? user.personalYouTubeChannelId : undefined,
          driveFileId: driveVideo.id,
          isAiGenerated: true,
        },
      });
      
      addedCount++;
    }

    return NextResponse.json({ success: true, addedCount });
  } catch (error: any) {
    console.error("Manual Sync Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync videos" }, { status: 500 });
  }
}
