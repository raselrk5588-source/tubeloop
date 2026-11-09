"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignUserToChannel(userId: string, channelId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { assignedChannelId: channelId },
    });

    revalidatePath(`/admin/channels/${channelId}`);
    return { success: true };
  } catch (error) {
    console.error("Error assigning user to channel:", error);
    return { success: false, error: "Failed to assign user." };
  }
}

export async function removeUserFromChannel(userId: string, channelId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { assignedChannelId: null },
    });

    revalidatePath(`/admin/channels/${channelId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing user from channel:", error);
    return { success: false, error: "Failed to remove user." };
  }
}
