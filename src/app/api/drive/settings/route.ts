import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { driveFolderId, driveSyncEnabled, driveWarmupEnabled, uploadScheduleTimes, defaultVideoDescription, accountMode } = await req.json();

    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        driveFolderId,
        driveSyncEnabled,
        driveWarmupEnabled,
        defaultVideoDescription,
        accountMode: accountMode || "PLATFORM",
        uploadScheduleTimes: uploadScheduleTimes || "10:00,13:30,16:00,18:30,20:30,21:00,22:00,00:30,02:00",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating drive settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
