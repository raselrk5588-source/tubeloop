import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RejectedVideosPage() {
  const rejectedVideos = await prisma.video.findMany({
    where: {
      status: "REJECTED",
    },
    include: {
      user: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rejected Videos</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Videos &gt; Rejected</p>
      </div>

      {rejectedVideos.length === 0 ? (
        <div className="text-center text-slate-500 py-10 bg-white rounded-xl shadow-sm border border-slate-100">
          No rejected videos found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rejectedVideos.map((video) => (
            <Card key={video.id} className="border-none shadow-sm overflow-hidden flex flex-col opacity-90 hover:opacity-100 transition-opacity">
              <div className="h-48 relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-300 bg-slate-100 flex items-center justify-center">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400">No Thumbnail</div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-red-500 hover:bg-red-600 shadow-sm">Rejected</Badge>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-slate-500 mb-3">By {video.user?.name || video.user?.email || "Unknown User"}</p>
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 mt-auto">
                  <span className="font-semibold block mb-1">Rejection Reason:</span>
                  {video.rejectionReason || "No specific reason provided."}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
