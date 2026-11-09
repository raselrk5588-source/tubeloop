import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, ArrowUpRight, History } from "lucide-react";
import { WithdrawalForm } from "./withdrawal-form";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function WithdrawalPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  
  const userId = (session.user as any).id;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bKashNumber: true }
  });

  const [earnings, dbWithdrawals, minWithdrawSetting] = await Promise.all([
    prisma.earning.aggregate({
      where: { userId },
      _sum: { amount: true }
    }),
    prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { requestDate: 'desc' }
    }),
    prisma.systemSetting.findUnique({
      where: { key: "MIN_WITHDRAW" }
    })
  ]);

  const totalEarned = earnings._sum.amount || 0;
  
  const totalWithdrawnOrPending = dbWithdrawals
    .filter(w => w.status !== "REJECTED")
    .reduce((sum, w) => sum + w.amount, 0);
    
  const availableBalance = totalEarned - totalWithdrawnOrPending;
  const minWithdraw = parseInt(minWithdrawSetting?.value || "500");
  
  const history = dbWithdrawals.map(w => ({
    id: w.id.substring(0, 8),
    date: new Date(w.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    amount: `৳${w.amount}`,
    status: w.status
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Withdraw Funds</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Withdrawal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4 opacity-80">
                <Wallet className="h-5 w-5" />
                <span className="font-medium">Available Balance</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">৳{availableBalance.toLocaleString()}</h2>
              <div className="text-sm opacity-80 bg-white/10 p-3 rounded-lg">
                Minimum withdrawal amount is ৳{minWithdraw}. Payments are sent via bKash.
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-lg">Request Withdrawal</CardTitle>
            </CardHeader>
            <CardContent className="p-0 px-6">
              <WithdrawalForm 
                minWithdraw={minWithdraw} 
                availableBalance={availableBalance} 
                defaultBkash={user?.bKashNumber || ""} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-slate-500" /> Withdrawal History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700 pl-6">ID</TableHead>
                    <TableHead className="font-semibold text-slate-700">Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6 font-medium text-slate-600">{item.id}</TableCell>
                      <TableCell className="text-slate-500">{item.date}</TableCell>
                      <TableCell className="font-bold text-slate-900">{item.amount}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none px-3 font-semibold">
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {history.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  <p>No withdrawal history yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
