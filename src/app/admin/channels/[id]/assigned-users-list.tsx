"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { removeUserFromChannel } from "./user-actions";
import { UserMinus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AssignedUser = {
  id: string;
  name: string | null;
  email: string;
};

export function AssignedUsersList({ 
  channelId, 
  users 
}: { 
  channelId: string, 
  users: AssignedUser[] 
}) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = (userId: string) => {
    if (confirm("Are you sure you want to remove this user from the channel?")) {
      startTransition(async () => {
        await removeUserFromChannel(userId, channelId);
      });
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm bg-slate-50/50 rounded-lg border border-dashed">
        No users are currently assigned to this channel.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold text-slate-700 pl-4">Name</TableHead>
            <TableHead className="font-semibold text-slate-700">Email</TableHead>
            <TableHead className="text-right pr-4">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-slate-50/50">
              <TableCell className="pl-4 font-medium text-slate-900">{user.name || "Unknown User"}</TableCell>
              <TableCell className="text-slate-600">{user.email}</TableCell>
              <TableCell className="text-right pr-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemove(user.id)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
