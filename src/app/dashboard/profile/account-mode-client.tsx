"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, UserCircle, PlaySquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAccountMode } from "./actions";

export function AccountModeClient({
  initialAccountMode,
  hasPersonalChannel,
  personalChannelName
}: {
  initialAccountMode: string,
  hasPersonalChannel: boolean,
  personalChannelName?: string
}) {
  const [accountMode, setAccountMode] = useState(initialAccountMode);
  const [isPending, startTransition] = useTransition();

  const handleModeChange = (mode: string) => {
    setAccountMode(mode);
    startTransition(async () => {
      await updateAccountMode(mode);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`relative flex cursor-pointer flex-col rounded-xl border p-4 shadow-sm transition-all hover:border-indigo-300 ${accountMode === 'PLATFORM' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 ring-1 ring-indigo-600' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'}`}
            onClick={() => handleModeChange('PLATFORM')}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Platform Contributor</span>
              {accountMode === 'PLATFORM' && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Upload videos to the platform's channel. Admins review and approve your content. Earn money for views.
            </p>
          </div>

          <div 
            className={`relative flex cursor-pointer flex-col rounded-xl border p-4 shadow-sm transition-all hover:border-indigo-300 ${accountMode === 'PERSONAL' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 ring-1 ring-indigo-600' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'}`}
            onClick={() => handleModeChange('PERSONAL')}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Personal Automation <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-700/10">SaaS</span>
              </span>
              {accountMode === 'PERSONAL' && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Connect your own YouTube channel. Videos upload directly to your channel automatically. No admin approval needed.
            </p>
          </div>
        </div>
      </div>

      {accountMode === 'PERSONAL' && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <PlaySquare className="h-5 w-5 text-red-500" />
            Connected YouTube Channel
          </h3>
          {hasPersonalChannel ? (
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                  <PlaySquare className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{personalChannelName}</p>
                  <p className="text-xs text-green-600 font-medium">Connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm" render={<a href="/api/youtube/auth?mode=personal" />} nativeButton={false}>
                <LogOut className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            </div>
          ) : (
            <div className="text-center bg-white dark:bg-slate-900 border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-4">You need to connect your YouTube channel to use Personal Automation mode.</p>
              <Button className="bg-red-600 hover:bg-red-700 text-white" render={<a href="/api/youtube/auth?mode=personal" />} nativeButton={false}>
                <PlaySquare className="mr-2 h-4 w-4" />
                Connect YouTube Channel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
