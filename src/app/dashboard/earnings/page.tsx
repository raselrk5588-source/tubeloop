import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Fetch earnings
  const earnings = await prisma.earning.aggregate({
    where: { userId },
    _sum: { amount: true }
  });
  const totalEarnings = earnings._sum.amount || 0;

  // Fetch withdrawals
  const paidWithdrawals = await prisma.withdrawal.aggregate({
    where: { userId, status: "PAID" },
    _sum: { amount: true }
  });
  const totalWithdrawn = paidWithdrawals._sum.amount || 0;

  const pendingWithdrawals = await prisma.withdrawal.aggregate({
    where: { userId, status: "PENDING" },
    _sum: { amount: true }
  });
  const pendingWithdrawn = pendingWithdrawals._sum.amount || 0;

  // Calculate available balance
  const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawn;

  // Fetch approved/uploaded videos count
  const approvedVideosCount = await prisma.video.count({
    where: { 
      userId,
      status: { in: ["APPROVED", "UPLOADED"] }
    }
  });

  // Calculate average earnings per video
  const earningsPerVideo = approvedVideosCount > 0 ? (totalEarnings / approvedVideosCount).toFixed(0) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Earnings</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Earnings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-indigo-100 font-medium mb-1">Available Balance</p>
                <h2 className="text-4xl font-bold">৳{availableBalance}</h2>
              </div>
              <Button className="bg-white text-indigo-600 hover:bg-slate-100 font-semibold shadow-sm">
                Request Withdrawal
              </Button>
            </div>
            
            <div className="flex border-t border-white/20 pt-4 mt-4 text-center sm:text-left">
              <div className="flex-1">
                <p className="text-indigo-100 text-xs sm:text-sm mb-1">Total Earnings</p>
                <p className="text-lg sm:text-xl font-bold">৳{totalEarnings}</p>
              </div>
              <div className="flex-1">
                <p className="text-indigo-100 text-xs sm:text-sm mb-1">Total Withdrawn</p>
                <p className="text-lg sm:text-xl font-bold">৳{totalWithdrawn}</p>
              </div>
              <div className="flex-1">
                <p className="text-indigo-100 text-xs sm:text-sm mb-1">Pending</p>
                <p className="text-lg sm:text-xl font-bold">৳{pendingWithdrawn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex justify-between items-center">
              Earnings Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <span className="font-medium text-slate-700">Approved Videos</span>
              </div>
              <span className="font-bold text-slate-900 text-lg">{approvedVideosCount}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                </div>
                <span className="font-medium text-slate-700">Earnings per Video</span>
              </div>
              <span className="font-bold text-slate-900 text-lg">৳{earningsPerVideo}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-slate-900">Earnings Overview</CardTitle>
            <select className="text-sm border-none bg-slate-50 rounded px-2 py-1 outline-none font-medium text-slate-600">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center">
             <p className="text-slate-400">Bar Chart will be rendered here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
