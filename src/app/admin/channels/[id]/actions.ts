"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function disconnectChannel(id: string) {
  try {
    await prisma.youTubeChannel.update({
      where: { id },
      data: {
        accessToken: null,
        refreshToken: null,
        status: "DISCONNECTED",
      },
    });

    revalidatePath("/admin/channels");
    revalidatePath(`/admin/channels/${id}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error disconnecting channel:", error);
    return { success: false, error: "Failed to disconnect channel." };
  }
}
