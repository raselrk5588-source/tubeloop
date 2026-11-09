import prisma from "@/lib/prisma";

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

interface CreateNotificationParams {
  userId?: string | null; // If null, means it's for all admins
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

export async function createNotification(data: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: data.userId || null,
        title: data.title,
        message: data.message,
        type: data.type || "INFO",
        link: data.link,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function notifyAdmins(data: Omit<CreateNotificationParams, "userId">) {
  // First, find all admins
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true }
  });

  // Then create a notification for each admin
  if (admins.length > 0) {
    try {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: data.title,
          message: data.message,
          type: data.type || "INFO",
          link: data.link,
        }))
      });
      return true;
    } catch (error) {
      console.error("Failed to notify admins:", error);
      return false;
    }
  }
  return false;
}
