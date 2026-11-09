import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { ReviewActions } from "./review-actions";

export const dynamic = "force-dynamic";

export default async function PendingReviewPage() {
  const pendingVideos = await prisma.video.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const rewardSetting = await prisma.systemSetting.findUnique({
    where: { key: "REWARD_OPTIONS" }
  });
  
  const rewardOptionsStr = rewardSetting?.value || "10";
  const rewardOptions = rewardOptionsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pending Video Review</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Pending Review</p>
      </div>

      <div className="flex space-x-2 mb-6">
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1 text-sm rounded-full cursor-pointer">
          Pending ({pendingVideos.length})
        </Badge>
      </div>

      {pendingVideos.length === 0 ? (
        <div className="text-center text-slate-500 py-10">
          No pending videos to review.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingVideos.map((video) => (
            <Card key={video.id} className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-64 h-40 shrink-0 relative bg-slate-100 flex items-center justify-center">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400">No Thumbnail</div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <a href={video.fileUrl} target="_blank" rel="noreferrer" className="h-12 w-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      </a>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{video.title}</h3>
                      <p className="text-sm text-slate-600 font-medium">By: {video.user.name || video.user.email}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(video.createdAt).toLocaleString()}</p>
                      {video.description && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{video.description}</p>
                      )}
                    </div>
                    <ReviewActions videoId={video.id} rewardOptions={rewardOptions} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
