import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VideoFilters } from "./video-filters";

export default async function MyVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const params = await searchParams;

  const where: any = { userId };
  
  if (params.search) {
    where.title = { contains: params.search };
  }
  
  if (params.status && params.status !== "ALL") {
    where.status = params.status;
  }

  const dbVideos = await prisma.video.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      earning: true,
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Videos</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Videos</p>
      </div>

      <VideoFilters />

      {dbVideos.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-500">You haven't uploaded any videos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {dbVideos.map((video) => (
            <Card key={video.id} className="border-none shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow">
              <div className="h-32 sm:h-40 relative overflow-hidden bg-slate-100 flex items-center justify-center">
                {video.thumbnail ? (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="text-slate-400">No Thumbnail</div>
                )}
                
                <div className="absolute top-3 right-3">
                  <Badge className={
                    video.status === "APPROVED" ? "bg-emerald-500 hover:bg-emerald-600 border-none" :
                    video.status === "PENDING" ? "bg-amber-500 hover:bg-amber-600 border-none" : 
                    "bg-red-500 hover:bg-red-600 border-none"
                  }>
                    {video.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2" title={video.title}>{video.title}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{video.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">{new Date(video.createdAt).toLocaleDateString()}</span>
                  <span className="text-sm font-bold text-emerald-600">
                    ৳{video.earning ? video.earning.amount : 0}
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
