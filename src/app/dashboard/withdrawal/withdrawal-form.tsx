"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight } from "lucide-react";
import { requestWithdrawal } from "./actions";

export function WithdrawalForm({ 
  minWithdraw, 
  availableBalance, 
  defaultBkash 
}: { 
  minWithdraw: number, 
  availableBalance: number,
  defaultBkash: string
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number>(minWithdraw);
  const [bkash, setBkash] = useState(defaultBkash);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount < minWithdraw) {
      alert(`Minimum withdrawal is ৳${minWithdraw}`);
      return;
    }
    
    if (amount > availableBalance) {
      alert("Insufficient balance");
      return;
    }
    
    if (!bkash || bkash.length < 11) {
      alert("Please enter a valid bKash number");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await requestWithdrawal(amount, bkash);
      
      if (res.error) {
        alert(res.error);
      } else {
        alert("Withdrawal request submitted successfully!");
        setAmount(minWithdraw);
      }
    } catch (error: any) {
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (৳)</Label>
        <Input 
          id="amount" 
          type="number" 
          placeholder="Enter amount..." 
          value={amount} 
          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
          min={minWithdraw}
          max={availableBalance}
          disabled={isLoading}
          className="bg-slate-50 h-11" 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bkash">bKash Number</Label>
        <Input 
          id="bkash" 
          type="text" 
          placeholder="01XXXXXXXXX"
          value={bkash} 
          onChange={(e) => setBkash(e.target.value)}
          disabled={isLoading}
          className="bg-slate-50 h-11" 
        />
        <p className="text-xs text-slate-400 mt-1">This number will be saved for future payments.</p>
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || amount > availableBalance || availableBalance < minWithdraw}
        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 mt-2"
      >
        <ArrowUpRight className="h-4 w-4 mr-2" /> 
        {isLoading ? "Processing..." : "Request Payment"}
      </Button>
    </form>
  );
}
