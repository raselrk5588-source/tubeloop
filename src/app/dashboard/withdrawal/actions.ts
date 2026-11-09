"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function requestWithdrawal(amount: number, bkashNumber: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }
  const userId = (session.user as any).id;
  
  if (!amount || isNaN(amount) || amount <= 0) {
    return { error: "Invalid amount" };
  }
  if (!bkashNumber || bkashNumber.trim().length < 11) {
    return { error: "Invalid bKash number" };
  }

  try {
    // Calculate available balance
    const [earnings, withdrawals, minWithdrawSetting] = await Promise.all([
      prisma.earning.aggregate({
        where: { userId },
        _sum: { amount: true }
      }),
      prisma.withdrawal.findMany({
        where: { userId }
      }),
      prisma.systemSetting.findUnique({
        where: { key: "MIN_WITHDRAW" }
      })
    ]);

    const totalEarned = earnings._sum.amount || 0;
    const totalWithdrawnOrPending = withdrawals
      .filter(w => w.status !== "REJECTED")
      .reduce((sum, w) => sum + w.amount, 0);
      
    const availableBalance = totalEarned - totalWithdrawnOrPending;
    const minWithdraw = parseInt(minWithdrawSetting?.value || "500");

    if (amount < minWithdraw) {
      return { error: `Minimum withdrawal amount is ৳${minWithdraw}` };
    }

    if (amount > availableBalance) {
      return { error: "Insufficient balance" };
    }

    // Create withdrawal request and optionally update user's saved bKash number
    await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          userId,
          amount,
          bKashNumber: bkashNumber,
          status: "PENDING"
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { bKashNumber: bkashNumber }
      })
    ]);

    revalidatePath("/dashboard/withdrawal");
    revalidatePath("/dashboard");
    revalidatePath("/admin/payments");
    
    import("@/lib/notifications").then(({ notifyAdmins }) => {
      notifyAdmins({
        title: "New Withdrawal Request",
        message: `A user has requested a withdrawal of ৳${amount} to ${bkashNumber}.`,
        type: "WARNING",
        link: "/admin/withdrawals"
      }).catch(console.error);
    });

    return { success: true };
  } catch (error: any) {
    console.error("Withdrawal error:", error);
    return { error: error.message || "Failed to process withdrawal request" };
  }
}
