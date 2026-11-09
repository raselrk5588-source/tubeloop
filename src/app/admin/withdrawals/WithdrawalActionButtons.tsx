"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { updateWithdrawalStatus } from "./actions";

export function WithdrawalActionButtons({ withdrawal }: { withdrawal: any }) {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await updateWithdrawalStatus(withdrawal.id, 'PAID');
      if (res.success) {
        toast.add({
          title: "Approved",
          description: "Withdrawal has been marked as paid.",
          type: "success"
        });
      } else {
        toast.add({
          title: "Error",
          description: res.error || "Failed to approve",
          type: "error"
        });
      }
    } catch (e) {
      toast.add({
        title: "Error",
        description: "An unexpected error occurred",
        type: "error"
      });
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Dialog>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-500 bg-blue-50 hover:bg-blue-100 hover:text-blue-600 rounded-full"
            />
          }
        >
          <Eye className="h-4 w-4" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="font-semibold text-sm text-slate-500">User</span>
              <span className="text-sm font-medium">{withdrawal.user.name || withdrawal.user.email}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="font-semibold text-sm text-slate-500">Amount</span>
              <span className="text-sm font-bold text-slate-900">৳{withdrawal.amount}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="font-semibold text-sm text-slate-500">Bkash Number</span>
              <span className="text-sm">{withdrawal.bKashNumber}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="font-semibold text-sm text-slate-500">Status</span>
              <span className="text-sm font-medium">{withdrawal.status}</span>
            </div>
            {withdrawal.user.assignedChannel && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="font-semibold text-sm text-slate-500">YouTube Channel</span>
                <span className="text-sm">{withdrawal.user.assignedChannel.name}</span>
              </div>
            )}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="font-semibold text-sm text-slate-500">Request Date</span>
              <span className="text-sm">{new Date(withdrawal.requestDate).toLocaleString()}</span>
            </div>
            {withdrawal.paymentDate && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="font-semibold text-sm text-slate-500">Payment Date</span>
                <span className="text-sm">{new Date(withdrawal.paymentDate).toLocaleString()}</span>
              </div>
            )}
            {withdrawal.transactionId && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="font-semibold text-sm text-slate-500">Transaction ID</span>
                <span className="text-sm">{withdrawal.transactionId}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-emerald-500 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-600 rounded-full"
        title="Approve manually"
        onClick={handleApprove}
        disabled={isApproving || withdrawal.status === 'PAID'}
      >
        <CheckCircle2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
