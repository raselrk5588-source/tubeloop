import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyAdmins } from "@/lib/notifications";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const category = formData.get("category") as string;

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required" }, { status: 400 });
    }

    // Get the user from database to find their assigned channel
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads/videos");
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Save the file
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, filename);
    const fileUrl = `/uploads/videos/${filename}`;

    await fs.writeFile(filePath, buffer);

    // Default placeholder thumbnail
    const defaultThumbnail = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80";

    // Save to database
    const video = await prisma.video.create({
      data: {
        title,
        description,
        tags,
        category,
        fileUrl,
        thumbnail: defaultThumbnail,
        status: "PENDING",
        userId: user.id,
        assignedChannelId: user.assignedChannelId, // Inherit from user
      },
    });

    // Notify admins about the new video upload
    notifyAdmins({
      title: "New Video Upload",
      message: `${user.name || user.email} has uploaded a new video: "${title}". It is waiting for review.`,
      type: "INFO",
      link: "/admin/videos/pending"
    }).catch(console.error);

    return NextResponse.json({ success: true, videoId: video.id }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
