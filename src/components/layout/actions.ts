"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAdminBadgeCounts() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  
  try {
    const [pendingReviews, pendingWithdrawals] = await Promise.all([
      prisma.video.count({ where: { status: "PENDING" } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } })
    ]);
    
    return { pendingReviews, pendingWithdrawals };
  } catch (error) {
    console.error("Error fetching admin badge counts:", error);
    return null;
  }
}
