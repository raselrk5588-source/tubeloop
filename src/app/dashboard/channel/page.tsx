import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MonitorPlay, ExternalLink, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ChannelPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assigned YouTube Channel</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; YouTube Channel</p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-red-500 to-red-600"></div>
        <CardContent className="pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
            <div className="h-24 w-24 rounded-2xl bg-white p-2 shadow-lg shrink-0 flex items-center justify-center">
              <div className="h-full w-full bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                <MonitorPlay className="h-10 w-10" />
              </div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">AI Automation Hub</h2>
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                </Badge>
              </div>
              <p className="text-slate-500 font-medium">@ai_automation_hub • 124K Subscribers</p>
            </div>
            <div className="pb-2">
               <Link href="https://youtube.com" target="_blank">
                 <Button variant="outline" className="text-slate-700 border-slate-200">
                   <ExternalLink className="h-4 w-4 mr-2" /> Visit Channel
                 </Button>
               </Link>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">About Your Channel</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              This is your officially assigned YouTube channel where all your approved AI generated shorts will be published. 
              Keep uploading high quality videos to grow this channel and increase your earnings. 
              The admin team manages the API connection and automated scheduling for this channel.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <p className="text-sm text-slate-500 font-medium mb-1">Total Videos Uploaded</p>
                 <p className="text-2xl font-bold text-slate-900">142</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <p className="text-sm text-slate-500 font-medium mb-1">Total Views (Last 30d)</p>
                 <p className="text-2xl font-bold text-slate-900">1.2M</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <p className="text-sm text-slate-500 font-medium mb-1">Channel Status</p>
                 <p className="text-lg font-bold text-emerald-600">Connected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
