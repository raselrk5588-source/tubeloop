import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DriveSettingsClient } from "./drive-settings-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { HardDrive, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow, addHours } from "date-fns";
import { EditVideoDialog } from "./edit-video-dialog";

export default async function DrivePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true,
      driveFolderId: true,
      driveSyncEnabled: true,
      driveWarmupEnabled: true,
      uploadIntervalHours: true,
      uploadScheduleTimes: true,
      defaultVideoDescription: true,
      accountMode: true,
      personalYouTubeChannel: true,
      driveAccessToken: true,
      lastUploadTime: true,
    }
  });

  if (!user) return null;

  const isConnected = !!user.driveAccessToken;

  // Fetch pending queue
  const pendingVideos = await prisma.video.findMany({
    where: {
      userId: user.id,
      isAiGenerated: true,
      status: "PENDING"
    },
    orderBy: { createdAt: "asc" }
  });

  // Calculate real intervals considering warmup mode
  const getIntervalForVideo = async () => {
    let currentInterval = user.uploadIntervalHours;
    if (user.driveWarmupEnabled) {
      const uploadCount = await prisma.video.count({
        where: { userId: user.id, isAiGenerated: true, status: "APPROVED" }
      });
      if (uploadCount < 3) currentInterval = 24;
      else if (uploadCount < 10) currentInterval = 12;
    }
    return currentInterval;
  };
  
  const currentIntervalHours = await getIntervalForVideo();

  // Calculate ETAs
  let nextUploadTime = user.lastUploadTime 
    ? addHours(user.lastUploadTime, currentIntervalHours)
    : new Date();
  
  if (nextUploadTime < new Date()) {
    nextUploadTime = new Date();
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 relative">
        {/* Subtle background glow */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-xl">
            <HardDrive className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          Google Drive Auto-Upload
        </h1>
        <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">
          Connect your Google Drive and set up an automated schedule. Our AI will automatically generate YouTube titles, descriptions, and tags based on the video filename and upload them to your channel.
        </p>
      </div>

      {!isConnected ? (
        <Card className="max-w-xl border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-500" />
              Connect Google Drive
            </CardTitle>
            <CardDescription>
              To automate uploads, you need to grant us read access to your Google Drive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/api/drive/auth" 
              className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto")}
            >
              Authorize Google Drive
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <DriveSettingsClient 
              initialFolderId={user.driveFolderId || ""} 
              initialSyncEnabled={user.driveSyncEnabled} 
              initialWarmupEnabled={user.driveWarmupEnabled}
              initialInterval={user.uploadIntervalHours}
              initialScheduleTimes={(user as any).uploadScheduleTimes || "10:00,13:30,16:00,18:30,20:30,21:00,22:00,00:30,02:00"}
              initialDefaultDescription={user.defaultVideoDescription || ""}
            />
          </div>
          
          <div className="xl:col-span-1">
            <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-md shadow-indigo-100/20 dark:shadow-none bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl" />
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  Upcoming Queue
                </CardTitle>
                <CardDescription>
                  Videos fetched from Drive awaiting upload.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingVideos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-4 border border-dashed rounded-xl bg-white/50 dark:bg-slate-900/50">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3">
                      <CheckCircle2 className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">No videos in queue</p>
                    <p className="text-xs text-muted-foreground mt-1">Make sure your Drive folder has videos and sync is enabled.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingVideos.map((video, index) => {
                      const eta = addHours(nextUploadTime, index * currentIntervalHours);
                      return (
                        <div key={video.id} className="group flex items-start gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800">
                          <div className="bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/50 dark:to-violet-900/50 text-indigo-700 dark:text-indigo-300 h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm border border-indigo-200/50 dark:border-indigo-800/50">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200" title={video.title}>{video.title}</p>
                            <div className="flex items-center text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 gap-1.5">
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                              </span>
                              <span>{formatDistanceToNow(eta, { addSuffix: true })}</span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <EditVideoDialog video={video} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
