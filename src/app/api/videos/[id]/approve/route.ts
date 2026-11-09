import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOAuth2Client, youtube } from "@/lib/google";
import fs from "fs";
import path from "path";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const videoId = params.id;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        assignedChannel: true,
        user: {
          include: {
            assignedChannel: true,
            personalYouTubeChannel: true,
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.status !== "PENDING" && video.status !== "UPLOAD_FAILED") {
      return NextResponse.json({ error: "Video cannot be approved in its current state" }, { status: 400 });
    }

    // Resolve channel: video's assigned channel -> user's assigned channel -> user's personal channel -> any connected channel
    let channel = video.assignedChannel || video.user?.assignedChannel || video.user?.personalYouTubeChannel;

    if (!channel) {
      channel = await prisma.youTubeChannel.findFirst({
        where: { status: "CONNECTED" },
        orderBy: { connectedDate: "desc" }
      });
    }

    if (!channel || (!channel.accessToken && !channel.refreshToken)) {
      return NextResponse.json({ error: "Assigned YouTube channel is missing or not fully connected" }, { status: 400 });
    }

    // Bind this channel to the video if it wasn't set
    if (video.assignedChannelId !== channel.id) {
      await prisma.video.update({
        where: { id: video.id },
        data: { assignedChannelId: channel.id }
      });
    }

    const relativePath = video.fileUrl.startsWith('/') ? video.fileUrl.slice(1) : video.fileUrl;
    const filePath = path.join(process.cwd(), "public", relativePath);
    
    if (!fs.existsSync(filePath)) {
       return NextResponse.json({ error: "Video file not found on disk" }, { status: 404 });
    }

    // Set up OAuth2 Client with the channel's credentials
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken
    });

    // Handle token refresh automatically by listening to events (optional but good practice)
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        await prisma.youTubeChannel.update({
          where: { id: channel.id },
          data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token
          }
        });
      } else if (tokens.access_token) {
         await prisma.youTubeChannel.update({
          where: { id: channel.id },
          data: {
            accessToken: tokens.access_token,
          }
        });
      }
    });

    // Helper to map legacy category strings to YouTube numeric IDs
    const getCategoryId = (cat: string | null) => {
      if (!cat) return "22"; // Default to People & Blogs
      const map: Record<string, string> = {
        entertainment: "24",
        education: "27",
        comedy: "23",
        gaming: "20",
      };
      // If it's already a number string (e.g. "24"), this will just fall through to `cat`
      return map[cat.toLowerCase()] || cat || "22";
    };

    // Upload to YouTube
    const res = await youtube.videos.insert({
      auth: oauth2Client,
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: video.title,
          description: video.description || "",
          tags: video.tags ? video.tags.split(",").map(t => t.trim()) : [],
          categoryId: getCategoryId(video.category)
        },
        status: {
          privacyStatus: "public" // Changed to public as requested
        }
      },
      media: {
        body: fs.createReadStream(filePath),
      }
    });

    const youtubeVideoId = res.data.id;

    if (!youtubeVideoId) {
      throw new Error("Failed to get YouTube Video ID after upload");
    }

    // Check for rewardAmount in the request body
    let rewardAmount = 10;
    try {
      const body = await req.json();
      if (body.rewardAmount && typeof body.rewardAmount === 'number') {
        rewardAmount = body.rewardAmount;
      }
    } catch (e) {
      // Body might be empty or invalid JSON, ignore and use default
    }

    // Update video status to UPLOADED and create earning
    await prisma.$transaction([
      prisma.video.update({
        where: { id: videoId },
        data: { 
          status: "UPLOADED",
          youtubeVideoId: youtubeVideoId 
        }
      }),
      prisma.earning.upsert({
        where: { videoId: videoId },
        update: { amount: rewardAmount },
        create: {
          amount: rewardAmount,
          userId: video.userId,
          videoId: videoId,
        }
      })
    ]);

    import("@/lib/notifications").then(({ createNotification }) => {
      createNotification({
        userId: video.userId,
        title: "Video Approved & Uploaded",
        message: `Your video "${video.title}" has been approved and uploaded to YouTube. You earned ৳${rewardAmount}!`,
        type: "SUCCESS",
        link: "/dashboard/videos"
      }).catch(console.error);
    });

    return NextResponse.json({ success: true, youtubeVideoId }, { status: 200 });
  } catch (error: any) {
    console.error("Approve API Error:", error);
    
    // Update status to UPLOAD_FAILED if it's a youtube API error
    if (videoId) {
      await prisma.video.update({
          where: { id: videoId },
          data: { status: "UPLOAD_FAILED" }
      }).catch(e => console.error("Failed to update status to UPLOAD_FAILED", e));
    }

    const message = error?.response?.data?.error?.message || error.message || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
