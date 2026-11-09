"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateAccountMode(mode: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { error: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        accountMode: mode,
      },
    });

    revalidatePath("/dashboard/layout");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/drive");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating account mode:", error);
    return { error: "Failed to update account mode." };
  }
}
