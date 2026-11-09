import { TopShorts } from "@/components/dashboard/top-shorts";

export default function TrendingShortsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trending Shorts</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Trending Shorts</p>
      </div>
      <div>
        <TopShorts />
      </div>
    </div>
  );
}
