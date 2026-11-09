'use server'

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function processAllPendingWithdrawals() {
  try {
    const pendingWithdrawals = await prisma.withdrawal.findMany({
      where: { status: "PENDING" }
    });

    if (pendingWithdrawals.length === 0) return { success: true };

    await prisma.withdrawal.updateMany({
      where: {
        status: "PENDING"
      },
      data: {
        status: "PAID",
        paymentDate: new Date()
      }
    });

    import("@/lib/notifications").then(({ createNotification }) => {
      pendingWithdrawals.forEach(withdrawal => {
        createNotification({
          userId: withdrawal.userId,
          title: "Withdrawal PAID",
          message: `Your withdrawal request for ৳${withdrawal.amount} has been paid.`,
          type: "SUCCESS",
          link: "/dashboard/withdrawal"
        }).catch(console.error);
      });
    });

    revalidatePath("/admin/withdrawals");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to process withdrawals:", error);
    return { success: false, error: "Failed to process withdrawals" };
  }
}

export async function updateWithdrawalStatus(id: string, status: string) {
  try {
    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
    if (!withdrawal) throw new Error("Withdrawal not found");

    await prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        paymentDate: status === 'PAID' ? new Date() : undefined
      }
    });

    import("@/lib/notifications").then(({ createNotification }) => {
      createNotification({
        userId: withdrawal.userId,
        title: `Withdrawal ${status}`,
        message: `Your withdrawal request for ৳${withdrawal.amount} has been ${status.toLowerCase()}.`,
        type: status === "PAID" ? "SUCCESS" : status === "REJECTED" ? "ERROR" : "INFO",
        link: "/dashboard/withdrawal"
      }).catch(console.error);
    });

    revalidatePath("/admin/withdrawals");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update withdrawal:", error);
    return { success: false, error: "Failed to update withdrawal" };
  }
}
