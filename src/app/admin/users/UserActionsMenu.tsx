"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, ShieldAlert, UserIcon } from "lucide-react";
import { toggleUserRole } from "./actions";
import { toast } from "@/components/ui/toast";
import { useState } from "react";

export function UserActionsMenu({ userId, currentRole, userName }: { userId: string, currentRole: string, userName: string }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (newRole: "ADMIN" | "USER") => {
    setIsUpdating(true);
    const result = await toggleUserRole(userId, newRole);
    setIsUpdating(false);

    if (result.success) {
      toast.add({
        title: "Role Updated",
        description: `${userName} is now ${newRole === "ADMIN" ? "an Admin" : "a regular User"}.`,
        type: "success",
      });
    } else {
      toast.add({
        title: "Failed to update role",
        description: result.error || "An unknown error occurred.",
        type: "error",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" 
        disabled={isUpdating}
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        
        {currentRole === "USER" ? (
          <DropdownMenuItem onClick={() => handleRoleChange("ADMIN")} className="cursor-pointer text-indigo-600 focus:text-indigo-700">
            <Shield className="mr-2 h-4 w-4" />
            <span>Make Admin</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleRoleChange("USER")} className="cursor-pointer text-orange-600 focus:text-orange-700">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Remove Admin</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
