"use client";

import { useEffect, useState } from "react";
import { Play, AlertCircle, Video as VideoIcon } from "lucide-react";
import Image from "next/image";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export function TopShorts() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShorts() {
      try {
        const response = await fetch("/api/youtube/shorts");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch top shorts");
        }

        setVideos(data.videos || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchShorts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[9/16] bg-slate-200 animate-pulse rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
         <AlertCircle className="w-12 h-12 text-rose-500 opacity-80" />
         <p className="text-slate-600 font-medium">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
         <VideoIcon className="w-12 h-12 text-slate-400 opacity-50" />
         <p className="text-slate-500 font-medium">No trending shorts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
      {videos.map((video) => (
        <a
          key={video.id}
          href={`https://youtube.com/shorts/${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-[9/16] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block"
        >
          {/* Background Image */}
          <Image 
            src={video.thumbnail} 
            alt={video.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Play Icon Overlay on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white font-semibold text-sm md:text-base leading-snug line-clamp-2 mb-3 drop-shadow-md">
              {video.title}
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
                <span className="text-[10px] font-bold text-white uppercase">
                  {video.channelTitle.charAt(0)}
                </span>
              </div>
              <p className="text-slate-200 text-xs truncate font-medium drop-shadow-sm">
                {video.channelTitle}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
