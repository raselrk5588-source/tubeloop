"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { processAllPendingWithdrawals } from "./actions";
import { toast } from "@/components/ui/toast";

export function MakePaymentButton({ disabled }: { disabled: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const res = await processAllPendingWithdrawals();
      if (res.success) {
        toast.add({
          title: "Payments processed",
          description: "All pending withdrawals have been marked as paid.",
          type: "success",
        });
      } else {
        toast.add({
          title: "Error",
          description: res.error || "Failed to process payments",
          type: "error",
        });
      }
    } catch (error) {
      toast.add({
        title: "Error",
        description: "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      className="bg-emerald-500 hover:bg-emerald-600 px-8 text-base"
      onClick={handlePayment}
      disabled={disabled || isLoading}
    >
      {isLoading ? "Processing..." : "Make Payment"}
    </Button>
  );
}
