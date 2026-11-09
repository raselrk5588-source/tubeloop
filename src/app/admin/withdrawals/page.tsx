import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, CheckCircle2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { MakePaymentButton } from "./MakePaymentButton";
import { WithdrawalActionButtons } from "./WithdrawalActionButtons";
import Link from "next/link";

export default async function WithdrawalRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const currentStatus = params.status || "ALL";

  const [filteredWithdrawals, totalCount, pendingCount, paidCount, rejectedCount] = await Promise.all([
    prisma.withdrawal.findMany({
      where: currentStatus !== "ALL" ? { status: currentStatus } : undefined,
      include: { 
        user: {
          include: {
            assignedChannel: true
          }
        } 
      },
      orderBy: { requestDate: 'desc' }
    }),
    prisma.withdrawal.count(),
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
    prisma.withdrawal.count({ where: { status: "PAID" } }),
    prisma.withdrawal.count({ where: { status: "REJECTED" } }),
  ]);

  const pendingWithdrawals = currentStatus === "ALL" 
    ? filteredWithdrawals.filter(w => w.status === "PENDING")
    : (currentStatus === "PENDING" ? filteredWithdrawals : []);
    
  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Withdrawal Requests</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Withdrawals</p>
      </div>

      <div className="flex space-x-6 border-b border-slate-200 mb-6 pb-2">
        <Link href="/admin/withdrawals" className={`flex items-center gap-2 cursor-pointer pb-2 ${currentStatus === "ALL" ? "border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-900 transition-colors"}`}>
          {currentStatus === "ALL" ? (
             <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-3">All ({totalCount})</Badge>
          ) : (
             <span className="text-sm font-medium">All ({totalCount})</span>
          )}
        </Link>
        <Link href="?status=PENDING" className={`flex items-center gap-2 cursor-pointer pb-2 ${currentStatus === "PENDING" ? "border-b-2 border-emerald-500 text-slate-900" : "text-slate-500 hover:text-slate-900 transition-colors"}`}>
          <span className="text-sm font-medium">Pending ({pendingCount})</span>
        </Link>
        <Link href="?status=PAID" className={`flex items-center gap-2 cursor-pointer pb-2 ${currentStatus === "PAID" ? "border-b-2 border-emerald-500 text-slate-900" : "text-slate-500 hover:text-slate-900 transition-colors"}`}>
          <span className="text-sm font-medium">Paid ({paidCount})</span>
        </Link>
        <Link href="?status=REJECTED" className={`flex items-center gap-2 cursor-pointer pb-2 ${currentStatus === "REJECTED" ? "border-b-2 border-emerald-500 text-slate-900" : "text-slate-500 hover:text-slate-900 transition-colors"}`}>
          <span className="text-sm font-medium">Rejected ({rejectedCount})</span>
        </Link>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 w-[250px]">User</TableHead>
                <TableHead className="font-semibold text-slate-700">Channel</TableHead>
                <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                <TableHead className="font-semibold text-slate-700">Bkash Number</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.map((w) => (
                <TableRow key={w.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${w.user.id}`} alt="Avatar" />
                      </div>
                      <span className="font-semibold text-slate-900">{w.user.name || w.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {w.user.assignedChannel?.name || "No Channel"}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">৳{w.amount}</TableCell>
                  <TableCell className="text-slate-600">{w.bKashNumber}</TableCell>
                  <TableCell>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                      w.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' :
                      w.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                      w.status === 'PROCESSING' ? 'bg-blue-100 text-blue-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {w.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <WithdrawalActionButtons withdrawal={w} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredWithdrawals.length === 0 && (
            <div className="text-center text-slate-500 py-10">
              No withdrawal requests for this status.
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm mt-6">
        <div>
           <p className="text-sm font-medium text-slate-500 mb-1">Total Pending Amount</p>
           <h2 className="text-2xl font-bold text-slate-900 text-emerald-600">৳{totalPendingAmount.toLocaleString()}</h2>
        </div>
        <MakePaymentButton disabled={pendingCount === 0} />
      </div>
    </div>
  );
}
