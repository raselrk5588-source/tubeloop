import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MonitorPlay, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";

import prisma from "@/lib/prisma";

export default async function AdminChannelsPage() {
  const dbChannels = await prisma.youTubeChannel.findMany({
    orderBy: { connectedDate: 'desc' },
    include: { _count: { select: { users: true } } }
  });

  const channels = dbChannels.map(ch => ({
    id: ch.id,
    name: ch.name,
    channelId: ch.channelId,
    users: ch._count.users,
    status: ch.status === "CONNECTED" ? "Connected" : "Disconnected",
    lastUpload: ch.lastUpload ? new Date(ch.lastUpload).toLocaleDateString() : "Never",
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">YouTube Channels</h1>
          <p className="text-slate-500 text-sm">Dashboard &gt; Channels</p>
        </div>
        
        <Dialog>
          <DialogTrigger render={<Button className="bg-red-600 hover:bg-red-700" />}>
            <Plus className="h-4 w-4 mr-2" /> Connect New Channel
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect YouTube Channel</DialogTitle>
              <DialogDescription>
                To allow automatic video uploads, you need to authenticate with a Google Account that owns the YouTube channel.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                <MonitorPlay className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Google OAuth Setup Required</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                Clicking the button below will redirect you to Google. Please allow the "Manage your YouTube videos" permission.
              </p>
              <Button render={<a href="/api/youtube/auth" />} nativeButton={false} className="w-full bg-slate-900 hover:bg-slate-800">
                Continue with Google
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg">Manage API Connections</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 pl-6 w-[300px]">Channel Name</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Assigned Users</TableHead>
                <TableHead className="font-semibold text-slate-700">Last Upload</TableHead>
                <TableHead className="font-semibold text-slate-700">API Status</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                        <MonitorPlay className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{channel.name}</p>
                        <p className="text-xs text-slate-500">{channel.channelId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-700">{channel.users}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{channel.lastUpload}</TableCell>
                  <TableCell>
                    <Badge className={channel.status === "Connected" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none" : "bg-red-100 text-red-700 hover:bg-red-100 border-none"}>
                      {channel.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button render={<Link href={`/admin/channels/${channel.id}`} />} nativeButton={false} variant="outline" size="sm" className="text-slate-600 border-slate-200">
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
