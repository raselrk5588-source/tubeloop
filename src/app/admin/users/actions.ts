"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleUserApproval(userId: string, isApproved: boolean) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isApproved },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error toggling user approval:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function toggleUserRole(userId: string, role: "ADMIN" | "USER") {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Optional: Prevent admins from demoting themselves (if you want this safety check)
    if (session.user.email && role === "USER") {
      const userToDemote = await prisma.user.findUnique({ where: { id: userId } });
      if (userToDemote?.email === session.user.email) {
        return { success: false, error: "You cannot remove your own admin privileges." };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
