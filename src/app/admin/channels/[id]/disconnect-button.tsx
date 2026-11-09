"use client";

import { Button } from "@/components/ui/button";
import { disconnectChannel } from "./actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DisconnectButton({ channelId, status }: { channelId: string, status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (status === "DISCONNECTED") {
    return (
      <Button variant="outline" disabled className="text-slate-400 border-slate-200">
        Disconnected
      </Button>
    );
  }

  return (
    <Button 
      variant="destructive" 
      onClick={() => {
        if (confirm("Are you sure you want to disconnect this channel? Videos will be preserved but automatic uploads will stop.")) {
          startTransition(async () => {
            await disconnectChannel(channelId);
            router.refresh();
          });
        }
      }}
      disabled={isPending}
      className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 shadow-none"
    >
      {isPending ? "Disconnecting..." : "Disconnect Channel"}
    </Button>
  );
}
