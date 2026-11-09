export type DownloadJob = {
  id: string;
  status: "downloading" | "editing" | "completed" | "error";
  totalRequested: number;
  completed: number;
  message?: string;
};

declare global {
  var __downloadJobs: Map<string, DownloadJob> | undefined;
}

if (!global.__downloadJobs) {
  global.__downloadJobs = new Map();
}

export const downloadJobs = global.__downloadJobs;
