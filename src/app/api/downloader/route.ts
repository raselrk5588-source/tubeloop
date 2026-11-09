import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { downloadJobs } from "@/lib/download-store";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { channelUrl, downloadPath, minViews, maxDownloads, autoEdit, watermarkPath } = await req.json();

    if (!channelUrl) {
      return NextResponse.json({ error: "Channel URL is required" }, { status: 400 });
    }
    
    if (!downloadPath) {
      return NextResponse.json({ error: "Download path is required" }, { status: 400 });
    }

    const maxLimit = parseInt(maxDownloads) || 5;

    // Ensure the user-provided directory exists
    await fs.mkdir(downloadPath, { recursive: true });

    // Generate a job ID
    const jobId = crypto.randomUUID();

    // Initialize job in memory
    downloadJobs.set(jobId, {
      id: jobId,
      status: "downloading",
      totalRequested: maxLimit,
      completed: 0,
    });

    // Start background process
    startBackgroundDownload(jobId, channelUrl, downloadPath, minViews, maxLimit, autoEdit, watermarkPath);

    return NextResponse.json({ 
      success: true, 
      jobId,
      message: "Download started in background."
    });

  } catch (error: any) {
    console.error("Downloader API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function startBackgroundDownload(jobId: string, channelUrl: string, downloadPath: string, minViews: string | number, maxDownloads: number, autoEdit: boolean, watermarkPath?: string) {
  const ytDlpPath = "E:\\Project24\\youtube\\You\\yt-dlp.exe";
  const outputTemplate = path.join(downloadPath, "%(title).50s [%(id)s].%(ext)s");

  const args = [
    "--match-filter", `view_count >= ${minViews}`,
    "--max-downloads", `${maxDownloads}`,
    "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
    "--merge-output-format", "mp4",
    "-o", outputTemplate,
    channelUrl
  ];

  // Capture existing files to distinguish newly downloaded ones
  fs.readdir(downloadPath).then(existingFiles => {
    const existingMp4s = new Set(existingFiles.filter(f => f.endsWith('.mp4')));

    const ytDlpProcess = spawn(ytDlpPath, args);

    ytDlpProcess.stdout.on('data', (data) => {
      const output = data.toString();
      const job = downloadJobs.get(jobId);
      if (job) {
        const mergeMatches = (output.match(/\[Merger\] Merging formats into/g) || []).length;
        if (mergeMatches > 0) {
           job.completed += mergeMatches;
        }
      }
    });

    ytDlpProcess.on('close', async (code) => {
      console.log(`[Job ${jobId}] yt-dlp exited with code ${code}`);
      const job = downloadJobs.get(jobId);
      if (!job) return;

      if (!autoEdit) {
        job.status = "completed";
        job.message = `Download finished! Files are saved at: ${downloadPath}`;
        downloadJobs.set(jobId, job);
        return;
      }

      // Auto Edit process
      job.status = "editing";
      job.message = "Applying AI bypass edits (FFmpeg)...";
      downloadJobs.set(jobId, job);

      try {
        const allFiles = await fs.readdir(downloadPath);
        const newMp4s = allFiles.filter(f => f.endsWith('.mp4') && !existingMp4s.has(f));

        for (const file of newMp4s) {
          const inputPath = path.join(downloadPath, file);
          const ext = path.extname(file);
          const baseName = path.basename(file, ext);
          const outputPath = path.join(downloadPath, `${baseName}_Edited${ext}`);

          console.log(`[Job ${jobId}] Editing ${file}...`);
          
          let ffmpegArgs: string[] = [];
          
          if (watermarkPath && watermarkPath.trim() !== "") {
            // Complex filter for video + watermark overlay and audio
            ffmpegArgs = [
              "-i", inputPath,
              "-i", watermarkPath,
              "-filter_complex", "[0:v]hflip,crop=iw/1.05:ih/1.05,setpts=PTS/1.05[bg];[1:v]scale=150:-1[wm];[bg][wm]overlay=W-w-20:H-h-20[outv];[0:a]atempo=1.05,aecho=0.8:0.9:10:0.2[outa]",
              "-map", "[outv]",
              "-map", "[outa]",
              "-c:v", "libx264",
              "-crf", "23",
              "-preset", "fast",
              "-c:a", "aac",
              "-b:a", "128k",
              outputPath
            ];
          } else {
            // Simple filter for video and audio
            ffmpegArgs = [
              "-i", inputPath,
              "-vf", "hflip,crop=iw/1.05:ih/1.05,setpts=PTS/1.05",
              "-af", "atempo=1.05,aecho=0.8:0.9:10:0.2",
              "-c:v", "libx264",
              "-crf", "23",
              "-preset", "fast",
              "-c:a", "aac",
              "-b:a", "128k",
              outputPath
            ];
          }

          await new Promise<void>((resolve, reject) => {
            const ffmpegProc = spawn("ffmpeg", ffmpegArgs);
            ffmpegProc.on('close', async (ffCode) => {
              if (ffCode === 0) {
                // Delete original file to save space
                try {
                  await fs.unlink(inputPath);
                } catch (e) {
                  console.error("Failed to delete original", e);
                }
                resolve();
              } else {
                reject(new Error(`FFmpeg exited with code ${ffCode}`));
              }
            });
          });
        }

        job.status = "completed";
        job.message = `Downloaded and Edited ${newMp4s.length} videos successfully! Saved at: ${downloadPath}`;
      } catch (err: any) {
        console.error(`[Job ${jobId}] Editing error:`, err);
        job.status = "error";
        job.message = `Download succeeded but editing failed: ${err.message}`;
      }
      
      downloadJobs.set(jobId, job);
    });

  }).catch(err => {
    console.error("Failed to read directory before download", err);
    const job = downloadJobs.get(jobId);
    if (job) {
      job.status = "error";
      job.message = "Failed to access download path.";
      downloadJobs.set(jobId, job);
    }
  });
}
