"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DownloadCloud, Video, AlertCircle, CheckCircle2, Loader2, ExternalLink, Wand2 } from "lucide-react";
import Link from "next/link";

export default function DownloaderPage() {
  const [channelUrl, setChannelUrl] = useState("");
  const [downloadPath, setDownloadPath] = useState("E:\\Downloads");
  const [minViews, setMinViews] = useState("500000");
  const [maxDownloads, setMaxDownloads] = useState("5");
  const [autoEdit, setAutoEdit] = useState(true);
  const [watermarkPath, setWatermarkPath] = useState("");
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "downloading" | "editing" | "completed" | "error">("idle");
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [message, setMessage] = useState("");

  // Check localStorage on mount
  useEffect(() => {
    const savedJobId = localStorage.getItem("yt_dlp_job_id");
    if (savedJobId) {
      setJobId(savedJobId);
      setStatus("downloading");
    }
  }, []);

  // Poll status when downloading
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === "downloading" && jobId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/downloader/status?jobId=${jobId}`);
          if (!res.ok) {
            // Job expired or lost
            setStatus("idle");
            localStorage.removeItem("yt_dlp_job_id");
            return;
          }
          
          const data = await res.json();
          
          setProgress({
            completed: data.completed,
            total: data.totalRequested
          });

          if (data.status === "completed" || data.status === "error") {
            setStatus(data.status);
            setMessage(data.message || (data.status === "completed" ? "Download complete!" : "An error occurred"));
            localStorage.removeItem("yt_dlp_job_id");
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000); // poll every 2 seconds
    }

    return () => clearInterval(interval);
  }, [status, jobId]);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelUrl) return;

    setStatus("downloading");
    setProgress({ completed: 0, total: parseInt(maxDownloads) || 5 });
    setMessage("");

    try {
      const res = await fetch("/api/downloader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelUrl,
          downloadPath,
          minViews: parseInt(minViews) || 500000,
          maxDownloads: parseInt(maxDownloads) || 5,
          autoEdit,
          watermarkPath
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to start download");
      }

      setJobId(data.jobId);
      localStorage.setItem("yt_dlp_job_id", data.jobId);

    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  const isDownloading = status === "downloading" || status === "editing";

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 relative">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-xl">
            <DownloadCloud className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          Popular Shorts Downloader
        </h1>
        <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">
          Download the most popular YouTube Shorts from any channel directly to your PC. You can navigate away during large downloads and check back later.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-md">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5 text-indigo-500" />
              Download Settings
            </CardTitle>
            <CardDescription>
              Provide the channel URL and your filters.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleDownload} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="channelUrl">Channel Shorts URL</Label>
                <Input
                  id="channelUrl"
                  placeholder="https://www.youtube.com/@ChannelName/shorts"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  disabled={isDownloading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="downloadPath">Save Location (Folder Path)</Label>
                <Input
                  id="downloadPath"
                  placeholder="E:\My Downloads"
                  value={downloadPath}
                  onChange={(e) => setDownloadPath(e.target.value)}
                  disabled={isDownloading}
                  required
                />
                <p className="text-[11px] text-muted-foreground">The exact folder on your PC where videos will be saved.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minViews">Minimum Views</Label>
                  <Input
                    id="minViews"
                    type="number"
                    value={minViews}
                    onChange={(e) => setMinViews(e.target.value)}
                    disabled={isDownloading}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">e.g., 500000 for 500k views</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxDownloads">Max Downloads</Label>
                  <Input
                    id="maxDownloads"
                    type="number"
                    min="1"
                    max="50"
                    value={maxDownloads}
                    onChange={(e) => setMaxDownloads(e.target.value)}
                    disabled={isDownloading}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">Limit to prevent large batches</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
                <Switch 
                  id="autoEdit" 
                  checked={autoEdit} 
                  onCheckedChange={setAutoEdit} 
                  disabled={isDownloading} 
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="autoEdit" className="flex items-center gap-2 cursor-pointer font-semibold text-indigo-700 dark:text-indigo-400">
                    <Wand2 className="h-4 w-4" />
                    Auto Edit Videos (Bypass AI)
                  </Label>
                  <p className="text-xs text-muted-foreground pt-1">
                    Automatically process downloaded videos with FFmpeg (5% Zoom, Mirror, 1.05x Speed, and modified Audio) to create unique content and avoid copyright.
                  </p>
                </div>
              </div>

              {autoEdit && (
                <div className="space-y-2 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 ml-2 animate-in fade-in slide-in-from-top-4">
                  <Label htmlFor="watermarkPath" className="flex items-center gap-2">
                    Watermark Image Path (Optional)
                  </Label>
                  <Input
                    id="watermarkPath"
                    placeholder="E:\MyLogo.png"
                    value={watermarkPath}
                    onChange={(e) => setWatermarkPath(e.target.value)}
                    disabled={isDownloading}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Path to a PNG logo. It will be placed in the bottom-right corner of the video. Leave empty for no watermark.
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isDownloading || !channelUrl}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Background Task...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Start Download
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Progress Card */}
          {isDownloading && (
            <Card className="border-blue-200 dark:border-blue-900/50 shadow-md h-fit">
              <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  {status === "editing" ? "Applying AI Edits..." : "Downloading in Background"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-center pb-8">
                <p className="text-slate-600 dark:text-slate-300 font-medium mb-2">
                  {status === "editing" ? "Processing downloaded videos with FFmpeg..." : "Please wait, downloading your videos..."}
                </p>
                
                {status === "downloading" && (
                  <>
                    <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
                      {progress.completed} / {progress.total}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      Completed
                    </p>
                  </>
                )}
                
                <p className="text-xs text-muted-foreground mt-4 italic">
                  You can safely navigate to other pages. <br/> The download will continue in the background.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Success/Error Result Card */}
          {(status === "completed" || status === "error") && (
            <Card className={`border ${status === "completed" ? 'border-green-200 dark:border-green-900/50' : 'border-red-200 dark:border-red-900/50'} shadow-md h-fit`}>
              <CardHeader className={`${status === "completed" ? 'bg-green-50/50 dark:bg-green-900/20' : 'bg-red-50/50 dark:bg-red-900/20'} border-b ${status === "completed" ? 'border-green-100 dark:border-green-800' : 'border-red-100 dark:border-red-800'}`}>
                <CardTitle className="text-lg flex items-center gap-2">
                  {status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  {status === "completed" ? "Download Successful" : "Download Failed"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{message}</p>
                {status === "completed" && progress.completed > 0 && (
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                    Total {progress.completed} videos saved to your PC!
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
