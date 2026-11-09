import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import prisma from "@/lib/prisma";
import { UserApprovalToggle } from "./UserApprovalToggle";
import { UserActionsMenu } from "./UserActionsMenu";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { videos: true }
      },
      earnings: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Users</h1>
          <p className="text-slate-500 text-sm">Dashboard &gt; Users</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <UserPlus className="h-4 w-4 mr-2" /> Add New User
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Registered Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search users..." className="pl-9 bg-slate-50 border-slate-200 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 pl-6">Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Email</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Videos</TableHead>
                <TableHead className="font-semibold text-slate-700">Earnings</TableHead>
                <TableHead className="font-semibold text-slate-700">Approval</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-right pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const totalEarnings = user.earnings.reduce((sum, e) => sum + e.amount, 0);
                return (
                  <TableRow key={user.id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6 font-semibold text-slate-900">{user.name || "No Name"}</TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell className="text-center font-medium">{user._count.videos}</TableCell>
                    <TableCell className="text-slate-600 font-medium">৳{totalEarnings.toLocaleString()}</TableCell>
                    <TableCell>
                      {user.role === "ADMIN" ? (
                        <span className="text-sm font-medium text-slate-400">Admin</span>
                      ) : (
                        <UserApprovalToggle userId={user.id} initialApproved={user.isApproved} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={user.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none" : "bg-red-100 text-red-700 hover:bg-red-100 border-none"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <UserActionsMenu userId={user.id} currentRole={user.role} userName={user.name || user.email} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {users.length === 0 && (
             <div className="text-center text-slate-500 py-10">No users found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
