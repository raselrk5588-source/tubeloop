import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, Clock, CircleDollarSign, AlertCircle, FileText, CheckCircle2, PlaySquare, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [totalUsers, totalVideos, pendingReview, earnings, pendingWithdrawalsCount] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.video.count(),
    prisma.video.count({ where: { status: 'PENDING' } }),
    prisma.earning.aggregate({ _sum: { amount: true } }),
    prisma.withdrawal.count({ where: { status: 'PENDING' } })
  ]);

  const stats = {
    totalUsers: totalUsers.toLocaleString(),
    totalVideos: totalVideos.toLocaleString(),
    pendingReview: pendingReview.toString(),
    totalEarnings: (earnings._sum.amount || 0).toLocaleString(),
  };

  const recentWithdrawals = await prisma.withdrawal.findMany({
    take: 4,
    orderBy: {
      requestDate: 'desc'
    },
    include: {
      user: true
    }
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back, <span className="font-semibold text-slate-700">Admin</span> 👋</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalUsers}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Videos</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalVideos}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Review</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.pendingReview}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
              <CircleDollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Earnings</p>
              <h3 className="text-2xl font-bold text-slate-900">৳{stats.totalEarnings}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart placeholder */}
            <div className="h-[350px] w-full bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center">
              <p className="text-slate-400">Line Chart will be rendered here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">Recent Withdrawals</CardTitle>
            <Link href="/admin/withdrawals" className="text-sm text-indigo-600 font-medium hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${withdrawal.user.id}`} alt="Avatar" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{withdrawal.user.name || withdrawal.user.email}</p>
                    <p className="text-xs text-slate-500">{withdrawal.user.role === 'ADMIN' ? 'Admin' : 'User'}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">৳{withdrawal.amount}</p>
                  {withdrawal.status === 'PENDING' && <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">Pending</span>}
                  {withdrawal.status === 'PROCESSING' && <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">Processing</span>}
                  {withdrawal.status === 'PAID' && <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold">Paid</span>}
                  {withdrawal.status === 'REJECTED' && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">Rejected</span>}
                </div>
              </div>
            ))}
            {recentWithdrawals.length === 0 && (
              <div className="text-center py-4 text-slate-500">
                No recent withdrawals found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/admin/users">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Users</p>
                <p className="text-xs text-slate-500">Manage Users</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/reviews">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded flex items-center justify-center">
                  <PlaySquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Pending Videos</p>
                  <p className="text-xs text-slate-500">Review Now</p>
                </div>
              </div>
              <span className="font-bold text-slate-900">83</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/withdrawals">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Withdrawals</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
              </div>
              <span className="font-bold text-slate-900">{pendingWithdrawalsCount}</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/logs">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Upload Logs</p>
                <p className="text-xs text-slate-500">View Logs</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
