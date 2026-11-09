"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, FolderSync, Zap, Shield, FileText, CheckCircle2, Clock, UploadCloud, UserCircle, PlaySquare, Link as LinkIcon, LogOut, Loader2 } from "lucide-react";

export function DriveSettingsClient({ 
  initialFolderId, 
  initialSyncEnabled, 
  initialWarmupEnabled,
  initialInterval,
  initialScheduleTimes,
  initialDefaultDescription,
}: {
  initialFolderId: string;
  initialSyncEnabled: boolean;
  initialWarmupEnabled: boolean;
  initialInterval: number;
  initialScheduleTimes: string;
  initialDefaultDescription: string;
}) {
  const [folderId, setFolderId] = useState(initialFolderId);
  const [syncEnabled, setSyncEnabled] = useState(initialSyncEnabled);
  const [warmupEnabled, setWarmupEnabled] = useState(initialWarmupEnabled);
  const [interval, setInterval] = useState(initialInterval.toString());
  const [scheduleTimes, setScheduleTimes] = useState(initialScheduleTimes || "10:00,13:30,16:00,18:30,20:30,21:00,22:00,00:30,02:00");
  const [defaultDescription, setDefaultDescription] = useState(initialDefaultDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/drive/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driveFolderId: folderId,
          driveSyncEnabled: syncEnabled,
          driveWarmupEnabled: warmupEnabled,
          uploadIntervalHours: interval,
          uploadScheduleTimes: scheduleTimes,
          defaultVideoDescription: defaultDescription,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setStatusMessage({ text: "Your Drive auto-upload settings have been updated.", type: 'success' });
      router.refresh(); // Refresh to update Sidebar and other layout components
    } catch (error) {
      setStatusMessage({ text: "Failed to save settings.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/drive/sync", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to sync");
      
      setStatusMessage({ text: `Sync complete! ${data.addedCount} new video(s) found and added to the queue.`, type: 'success' });
      router.refresh(); // Refresh the page to show the updated queue
    } catch (error: any) {
      setStatusMessage({ text: `Sync Error: ${error.message}`, type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-md shadow-indigo-100/20 dark:shadow-none bg-white dark:bg-slate-950 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 pb-5">
        <CardTitle className="text-xl flex items-center gap-2 text-indigo-950 dark:text-indigo-100">
          <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Automation Configuration
        </CardTitle>
        <CardDescription className="text-sm">
          Fine-tune how and when your videos are processed and uploaded.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800">
            <div className="space-y-1.5 pr-4">
              <Label htmlFor="sync-enabled" className="text-base font-semibold flex items-center gap-2">
                <FolderSync className="h-4 w-4 text-indigo-500" />
                Enable Auto-Sync
              </Label>
              <p className="text-[13px] text-muted-foreground leading-snug">
                Automatically fetch and upload videos from your connected Google Drive folder.
              </p>
            </div>
            <Switch
              id="sync-enabled"
              checked={syncEnabled}
              onCheckedChange={setSyncEnabled}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800">
            <div className="space-y-1.5 pr-4">
              <Label htmlFor="warmup-enabled" className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Smart Warm-up
                <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10">Recommended</span>
              </Label>
              <p className="text-[13px] text-muted-foreground leading-snug">
                Adjusts schedule dynamically for new channels to avoid YouTube spam filters.
              </p>
            </div>
            <Switch
              id="warmup-enabled"
              checked={warmupEnabled}
              onCheckedChange={setWarmupEnabled}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label htmlFor="folder-id" className="font-semibold flex items-center gap-2">
              <FolderSync className="h-4 w-4 text-slate-500" />
              Drive Folder ID
            </Label>
            <Input 
              id="folder-id" 
              placeholder="e.g. 1A2B3C4D5E6F7G8H9I0J" 
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="font-mono text-sm bg-slate-50 dark:bg-slate-900 focus-visible:ring-indigo-500"
            />
            <p className="text-[11px] text-muted-foreground">
              Find the ID in your folder's URL: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-400">drive.google.com/drive/folders/[ID]</code>
            </p>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="schedule-times" className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              Upload Time Slots (BST)
            </Label>
            <Input 
              id="schedule-times" 
              type="text" 
              value={scheduleTimes}
              onChange={(e) => setScheduleTimes(e.target.value)}
              disabled={warmupEnabled}
              className="bg-slate-50 dark:bg-slate-900 focus-visible:ring-indigo-500 disabled:opacity-50"
            />
            <p className="text-[11px] text-muted-foreground">
              {warmupEnabled 
                ? "Disabled: Warm-up mode controls the schedule (Smart Intervals)."
                : `Comma-separated times in 24h format (e.g. 10:00,13:30). Using Bangladesh Time.`}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-6">
          <Label htmlFor="bio" className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            Default Video Bio / Footer
          </Label>
          <Textarea 
            id="bio" 
            className="h-28 resize-none bg-slate-50 dark:bg-slate-900 focus-visible:ring-indigo-500 text-sm leading-relaxed"
            placeholder="Welcome to my channel! Don't forget to subscribe. Follow me on Instagram: @username"
            value={defaultDescription}
            onChange={(e) => setDefaultDescription(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            Automatically appended to the bottom of all AI-generated descriptions.
          </p>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-md text-sm ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button 
            onClick={handleSave} 
            disabled={isLoading} 
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Configuration...
              </>
            ) : "Save Settings"}
          </Button>
          <Button 
            onClick={handleSyncNow} 
            disabled={isSyncing || !folderId} 
            variant="outline"
            className="flex-1 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning & Generating AI Content...
              </>
            ) : (
              "Sync Videos Now"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
