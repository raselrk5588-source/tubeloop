import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, AlertCircle, CheckCircle2, Loader2, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export default async function AdminLogsPage() {
  const logs = await prisma.uploadLog.findMany({
    include: {
      video: true,
      channel: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upload Logs</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; System Logs</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" /> YouTube API Upload Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 pl-6">Video Title</TableHead>
                <TableHead className="font-semibold text-slate-700">Target Channel</TableHead>
                <TableHead className="font-semibold text-slate-700">Timestamp</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 pr-6">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No upload logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6 font-semibold text-slate-900">
                      {log.video?.title || "Unknown Video"}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {log.channel?.name || "Unknown Channel"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : "Unknown"}
                    </TableCell>
                    <TableCell>
                      {log.status === "SUCCESS" ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Success
                        </Badge>
                      ) : log.status === "FAILED" ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">
                          <AlertCircle className="h-3 w-3 mr-1" /> Failed
                        </Badge>
                      ) : log.status === "UPLOADING" ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Uploading
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">
                          <Clock className="h-3 w-3 mr-1" /> Queued
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-red-500 pr-6 max-w-[200px] truncate" title={log.errorMessage || ""}>
                      {log.errorMessage || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
