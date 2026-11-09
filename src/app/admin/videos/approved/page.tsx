import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ApprovedVideosPage() {
  const approvedVideos = await prisma.video.findMany({
    where: {
      status: "UPLOADED",
    },
    include: {
      user: true,
      earning: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Approved Videos</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Videos &gt; Approved</p>
      </div>

      {approvedVideos.length === 0 ? (
        <div className="text-center text-slate-500 py-10 bg-white rounded-xl shadow-sm border border-slate-100">
          No approved videos found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedVideos.map((video) => (
            <Card key={video.id} className="border-none shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow">
              <div className="h-48 relative overflow-hidden bg-slate-100 flex items-center justify-center">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="text-slate-400">No Thumbnail</div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-sm">Uploaded to YouTube</Badge>
                </div>
                {/* Overlay link to YouTube if available */}
                {video.youtubeVideoId && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <a href={`https://youtube.com/watch?v=${video.youtubeVideoId}`} target="_blank" rel="noreferrer" className="h-12 w-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </a>
                  </div>
                )}
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-slate-500 mb-4">By {video.user?.name || video.user?.email || "Unknown User"}</p>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-xs text-slate-400">
                    {new Date(video.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    Paid: ৳{video.earning ? video.earning.amount : 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
