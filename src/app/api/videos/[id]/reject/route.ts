import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
      where: { id: videoId }
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    await prisma.video.update({
      where: { id: videoId },
      data: { status: "REJECTED" }
    });

    import("@/lib/notifications").then(({ createNotification }) => {
      createNotification({
        userId: video.userId,
        title: "Video Rejected",
        message: `Your video "${video.title}" was not approved for upload.`,
        type: "ERROR",
        link: "/dashboard/videos"
      }).catch(console.error);
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Reject API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
