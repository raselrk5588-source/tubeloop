import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, CheckCircle2, Clock, CircleDollarSign, MonitorPlay, UploadCloud } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  
  const userId = (session.user as any).id;

  const [totalVideos, approvedVideos, pendingVideos, earnings, user] = await Promise.all([
    prisma.video.count({ where: { userId } }),
    prisma.video.count({ where: { userId, status: "UPLOADED" } }),
    prisma.video.count({ where: { userId, status: "PENDING" } }),
    prisma.earning.aggregate({
      where: { userId },
      _sum: { amount: true }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { accountMode: true, driveSyncEnabled: true, uploadIntervalHours: true, lastUploadTime: true, driveWarmupEnabled: true, personalYouTubeChannel: true }
    })
  ]);

  const stats = {
    totalVideos,
    approvedVideos,
    pendingVideos,
    totalEarnings: earnings._sum.amount || 0,
  };

  const accountMode = user?.accountMode || "PLATFORM";

  let nextUploadTime = "Not scheduled";
  if (user?.driveSyncEnabled && user?.personalYouTubeChannel) {
    if (user.lastUploadTime) {
      const nextDate = new Date(user.lastUploadTime);
      nextDate.setHours(nextDate.getHours() + (user.uploadIntervalHours || 5));
      if (nextDate < new Date()) {
        nextUploadTime = "Now / Processing";
      } else {
        nextUploadTime = nextDate.toLocaleString();
      }
    } else if (stats.pendingVideos > 0) {
      nextUploadTime = "Now / Processing";
    } else {
      nextUploadTime = "Waiting for videos";
    }
  } else if (!user?.personalYouTubeChannel) {
    nextUploadTime = "Channel not connected";
  } else {
    nextUploadTime = "Sync disabled";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here is your latest overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Videos</CardTitle>
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <Video className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalVideos}</div>
            <p className="text-xs text-slate-400 mt-1">All Time</p>
          </CardContent>
        </Card>
        
        {accountMode === "PLATFORM" ? (
          <>
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Approved Videos</CardTitle>
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.approvedVideos}</div>
                <p className="text-xs text-slate-400 mt-1">All Time</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Pending Videos</CardTitle>
                <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.pendingVideos}</div>
                <p className="text-xs text-slate-400 mt-1">Review</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total Earnings</CardTitle>
                <div className="h-10 w-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                  <CircleDollarSign className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">৳{stats.totalEarnings}</div>
                <p className="text-xs text-slate-400 mt-1">All Time</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Uploaded to Channel</CardTitle>
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <UploadCloud className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.approvedVideos}</div>
                <p className="text-xs text-slate-400 mt-1">Published</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Pending in Queue</CardTitle>
                <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.pendingVideos}</div>
                <p className="text-xs text-slate-400 mt-1">Waiting for upload</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Next Upload</CardTitle>
                <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <MonitorPlay className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-base font-bold text-slate-900 truncate">{nextUploadTime}</div>
                <p className="text-xs text-slate-400 mt-1">Schedule</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {accountMode === "PLATFORM" ? (
          <Card className="col-span-5 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Earnings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chart placeholder - in a real app use Recharts */}
              <div className="h-[300px] w-full bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center">
                <p className="text-slate-400">Chart will be rendered here</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="col-span-5 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Automation Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center p-6 text-center">
                <MonitorPlay className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-700">Automation is {user?.driveSyncEnabled ? 'Active' : 'Paused'}</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                  {user?.driveSyncEnabled 
                    ? `Your Google Drive is being synced. Next upload will happen at the scheduled time.`
                    : `Enable Auto-Sync in Drive settings to automatically upload videos to your channel.`}
                </p>
                <Link href="/dashboard/drive" className="mt-4">
                  <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    Manage Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="col-span-2 space-y-6">
          
          
          <Card className="border-none shadow-sm bg-indigo-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900">Quick Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                {accountMode === "PLATFORM" 
                  ? "Upload a new video and earn money" 
                  : "Upload a new video directly to your channel"}
              </p>
              <Link href="/dashboard/upload">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
