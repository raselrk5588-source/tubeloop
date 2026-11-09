import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    const youtube = google.youtube({
      version: "v3",
      auth: apiKey,
    });

    // Calculate time 48 hours ago
    const publishedAfter = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const response = await youtube.search.list({
      part: ["snippet"],
      type: ["video"],
      videoDuration: "short",
      order: "viewCount",
      publishedAfter: publishedAfter,
      maxResults: 12,
      q: "#shorts", // query parameter to ensure we get shorts
    });

    const videos = response.data.items?.map((item) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
    })) || [];

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Error fetching YouTube shorts:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube shorts" },
      { status: 500 }
    );
  }
}
