"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSettings(formData: FormData) {
  const rewardOptions = formData.get("reward") as string;
  const minWithdraw = formData.get("min-withdraw") as string;
  const maxUploads = formData.get("max-uploads") as string;
  const youtubeQuota = formData.get("youtube-quota") as string;

  try {
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: "REWARD_OPTIONS" },
        update: { value: rewardOptions || "10" },
        create: { key: "REWARD_OPTIONS", value: rewardOptions || "10" }
      }),
      prisma.systemSetting.upsert({
        where: { key: "MIN_WITHDRAW" },
        update: { value: minWithdraw || "500" },
        create: { key: "MIN_WITHDRAW", value: minWithdraw || "500" }
      }),
      prisma.systemSetting.upsert({
        where: { key: "MAX_UPLOADS" },
        update: { value: maxUploads || "20" },
        create: { key: "MAX_UPLOADS", value: maxUploads || "20" }
      }),
      prisma.systemSetting.upsert({
        where: { key: "YOUTUBE_QUOTA" },
        update: { value: youtubeQuota || "90" },
        create: { key: "YOUTUBE_QUOTA", value: youtubeQuota || "90" }
      })
    ]);

    revalidatePath("/admin/settings");
    revalidatePath("/admin/reviews");
    
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}
