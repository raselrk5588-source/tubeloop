import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonitorPlay, Users, Video as VideoIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DisconnectButton } from "./disconnect-button";
import { AssignedUsersList } from "./assigned-users-list";
import { AssignUserDialog } from "./assign-user-dialog";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChannelDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  const channel = await prisma.youTubeChannel.findUnique({
    where: { id },
    include: {
      users: true,
      videos: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: {
        select: { videos: true, users: true },
      },
    },
  });

  const unassignedUsers = await prisma.user.findMany({
    where: {
      OR: [
        { assignedChannelId: null },
        { assignedChannelId: { not: id } }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      assignedChannelId: true,
    },
    orderBy: { name: 'asc' }
  });

  if (!channel) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <Link href="/admin/channels" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Channels
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{channel.name}</h1>
              <p className="text-slate-500 text-sm font-mono mt-1">{channel.channelId}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={channel.status === "CONNECTED" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1" : "bg-red-100 text-red-700 hover:bg-red-100 border-none px-3 py-1"}>
                {channel.status}
              </Badge>
              <DisconnectButton channelId={channel.id} status={channel.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Videos</CardTitle>
            <VideoIcon className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{channel._count.videos}</div>
            <p className="text-xs text-slate-500 mt-1">Uploaded to this channel</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Assigned Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{channel._count.users}</div>
            <p className="text-xs text-slate-500 mt-1">Managing this channel</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Connected Date</CardTitle>
            <MonitorPlay className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {new Date(channel.connectedDate).toLocaleDateString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">First authenticated</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm mt-6">
        <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Assigned Users</CardTitle>
            <CardDescription>Users who have access to manage this channel</CardDescription>
          </div>
          <AssignUserDialog channelId={channel.id} unassignedUsers={unassignedUsers} />
        </CardHeader>
        <CardContent className="p-4">
          <AssignedUsersList channelId={channel.id} users={channel.users} />
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm mt-6">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg">Recent Videos</CardTitle>
          <CardDescription>Videos that are assigned or uploaded to this channel</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {channel.videos.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No videos assigned to this channel yet.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700 pl-6">Title</TableHead>
                  <TableHead className="font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="font-semibold text-slate-700">Date Added</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channel.videos.map((video) => (
                  <TableRow key={video.id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6 font-medium text-slate-900">{video.title}</TableCell>
                    <TableCell className="text-slate-600 capitalize">{video.category || "-"}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{video.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        video.status === 'APPROVED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        video.status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }>
                        {video.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
