"use client";

import { useState } from "react";
import { toggleUserApproval } from "./actions";
import { toast } from "@/components/ui/toast"; 

export function UserApprovalToggle({ userId, initialApproved }: { userId: string, initialApproved: boolean }) {
  const [isApproved, setIsApproved] = useState(initialApproved ?? false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsLoading(true);
    // Optimistic update
    setIsApproved(checked);
    
    try {
      const result = await toggleUserApproval(userId, checked);
      if (!result.success) {
        // Revert on failure
        setIsApproved(!checked);
        toast.add({
          title: "Error",
          description: result.error || "Failed to update approval status",
          type: "error",
        });
      } else {
        toast.add({
          title: "Success",
          description: `User has been ${checked ? 'approved' : 'unapproved'}`,
          type: "success",
        });
      }
    } catch (err) {
      setIsApproved(!checked);
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
    <div className="flex items-center gap-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={isApproved}
          onChange={handleToggle}
          disabled={isLoading}
        />
        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
      </label>
      <span className="text-sm font-medium text-slate-600">
        {isApproved ? "Approved" : "Pending"}
      </span>
    </div>
  );
}
