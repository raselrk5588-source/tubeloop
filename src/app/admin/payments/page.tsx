import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, History } from "lucide-react";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export default async function AdminPaymentsPage() {
  const payments = await prisma.withdrawal.findMany({
    where: {
      status: "PAID",
    },
    include: {
      user: true,
    },
    orderBy: {
      paymentDate: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment History</h1>
          <p className="text-slate-500 text-sm">Dashboard &gt; Payments</p>
        </div>
        <Button variant="outline" className="text-slate-700 border-slate-200">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" /> Completed Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 pl-6">Transaction ID</TableHead>
                <TableHead className="font-semibold text-slate-700">User</TableHead>
                <TableHead className="font-semibold text-slate-700">Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Method</TableHead>
                <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No completed payments found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6 font-medium text-slate-500">
                      {payment.transactionId || payment.id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {payment.user?.name || payment.user?.email || "Unknown User"}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {payment.paymentDate ? format(new Date(payment.paymentDate), "MMM d, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      bKash ({payment.bKashNumber})
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">৳{payment.amount}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3">
                        Completed
                      </Badge>
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
