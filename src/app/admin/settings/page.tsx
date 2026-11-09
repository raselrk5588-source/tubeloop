import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save } from "lucide-react";
import prisma from "@/lib/prisma";
import { saveSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.systemSetting.findMany();
  
  const getSetting = (key: string, defaultValue: string) => {
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  const rewardOptions = getSetting("REWARD_OPTIONS", "10");
  const minWithdraw = getSetting("MIN_WITHDRAW", "500");
  const maxUploads = getSetting("MAX_UPLOADS", "20");
  const youtubeQuota = getSetting("YOUTUBE_QUOTA", "90");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Settings</p>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-500" /> General Settings
            </CardTitle>
            <CardDescription>Configure global platform variables.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <form key={rewardOptions + minWithdraw + maxUploads + youtubeQuota} action={saveSettings} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reward">Reward per Approved Video (৳)</Label>
                  <Input id="reward" name="reward" type="text" defaultValue={rewardOptions} placeholder="e.g. 10,20,30" className="bg-slate-50 h-11" />
                  <p className="text-xs text-slate-400 mt-1">Enter multiple values separated by commas (e.g. 10,20,30).</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-withdraw">Minimum Withdrawal Amount (৳)</Label>
                  <Input id="min-withdraw" name="min-withdraw" type="number" defaultValue={minWithdraw} className="bg-slate-50 h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-uploads">Max Uploads per User (Daily)</Label>
                  <Input id="max-uploads" name="max-uploads" type="number" defaultValue={maxUploads} className="bg-slate-50 h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube-quota">Daily YouTube Quota Buffer</Label>
                  <Input id="youtube-quota" name="youtube-quota" type="number" defaultValue={youtubeQuota} className="bg-slate-50 h-11" />
                  <p className="text-xs text-slate-400 mt-1">Percentage of quota to reach before pausing uploads.</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8">
                  <Save className="h-4 w-4 mr-2" /> Save Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
