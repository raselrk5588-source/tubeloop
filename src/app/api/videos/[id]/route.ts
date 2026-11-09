import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, tags } = body;

    // Verify ownership
    const video = await prisma.video.findUnique({
      where: { id },
      select: { userId: true, status: true }
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update video
    const updated = await prisma.video.update({
      where: { id },
      data: {
        title,
        description,
        tags
      }
    });

    return NextResponse.json({ success: true, video: updated });
  } catch (error: any) {
    console.error("Error updating video:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
