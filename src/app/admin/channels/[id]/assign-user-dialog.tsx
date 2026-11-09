"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { assignUserToChannel } from "./user-actions";
import { UserPlus, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type UnassignedUser = {
  id: string;
  name: string | null;
  email: string;
  assignedChannelId: string | null;
};

export function AssignUserDialog({ 
  channelId, 
  unassignedUsers 
}: { 
  channelId: string, 
  unassignedUsers: UnassignedUser[] 
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);

  const handleAssign = (userId: string) => {
    setAssignedUserId(userId);
    startTransition(async () => {
      await assignUserToChannel(userId, channelId);
      // We don't close the dialog immediately so they can assign multiple if they want, 
      // or we can close it. Let's just reset the state since it revalidates.
      setAssignedUserId(null);
    });
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 border-dashed"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Assign User
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign User to Channel</DialogTitle>
          <DialogDescription>
            Select a user from the list below to assign them to this channel. Users already assigned to other channels will be moved here.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[300px] pr-4 mt-2">
          {unassignedUsers.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-6">
              No available users to assign.
            </div>
          ) : (
            <div className="space-y-3">
              {unassignedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-slate-900">{user.name || "Unknown User"}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                    {user.assignedChannelId && (
                      <span className="text-[10px] text-amber-600 font-medium mt-0.5">Currently assigned to another channel</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant={assignedUserId === user.id ? "default" : "secondary"}
                    disabled={isPending}
                    onClick={() => handleAssign(user.id)}
                    className="shrink-0 ml-4"
                  >
                    {assignedUserId === user.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      "Assign"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
  );
}
