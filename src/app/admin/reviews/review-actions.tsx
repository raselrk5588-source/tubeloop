"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ReviewActions({ videoId, rewardOptions }: { videoId: string, rewardOptions?: number[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const options = rewardOptions && rewardOptions.length > 0 ? rewardOptions : [10];
  const [selectedReward, setSelectedReward] = useState<number>(options[0]);

  const handleAction = async (action: "approve" | "reject") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(action === "approve" ? { rewardAmount: selectedReward } : {})
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3 mt-4 sm:mt-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 font-medium">Reward:</span>
        <select 
          value={selectedReward.toString()} 
          onChange={(e) => setSelectedReward(parseInt(e.target.value))}
          disabled={isLoading}
          className="flex h-9 w-[100px] items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {options.map((opt) => (
            <option key={opt} value={opt.toString()}>
              ৳{opt}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => handleAction("approve")} 
          disabled={isLoading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Approve"}
        </Button>
        <Button 
          onClick={() => handleAction("reject")} 
          disabled={isLoading}
          variant="outline" 
          className="text-red-500 border-red-200 hover:bg-red-50 px-6 disabled:opacity-50"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
