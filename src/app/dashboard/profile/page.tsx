import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AccountModeClient } from "./account-mode-client";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      personalYouTubeChannel: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Split name into first and last for the form
  const nameParts = (user.name || "User").split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
  const bKash = user.bKashNumber || "Not provided";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="border-none shadow-sm text-center">
            <CardContent className="pt-8 pb-6">
              <div className="h-28 w-28 mx-auto bg-slate-100 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Profile" className="h-full w-full object-cover" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user.name || "User"}</h2>
              <p className="text-slate-500 text-sm mb-6">{user.role === "ADMIN" ? "Administrator" : "AI Creator"}</p>
              
              <div className="space-y-3 text-left bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{bKash}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-slate-500" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent key={user.id} className="pt-6 space-y-4">
              <AccountModeClient 
                initialAccountMode={user.accountMode} 
                hasPersonalChannel={!!user.personalYouTubeChannel}
                personalChannelName={user.personalYouTubeChannel?.name}
              />

              <div className="pt-6 pb-2">
                <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-4">Edit Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input key={`first-${user.id}`} id="firstName" defaultValue={firstName || ""} className="bg-slate-50 h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input key={`last-${user.id}`} id="lastName" defaultValue={lastName || ""} className="bg-slate-50 h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input key={`email-${user.id}`} id="email" type="email" defaultValue={user.email} readOnly className="bg-slate-50 h-11 text-slate-500" />
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bkash">bKash Number</Label>
                <Input key={`bkash-${user.id}`} id="bkash" type="text" defaultValue={user.bKashNumber || ""} className="bg-slate-50 h-11" placeholder="e.g. 01711223344" />
              </div>
              <div className="pt-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>Update your account password to stay secure.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" placeholder="••••••••" className="bg-slate-50 h-11" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" placeholder="••••••••" className="bg-slate-50 h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" className="bg-slate-50 h-11" />
                </div>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="border-slate-200 text-slate-700 h-11 px-6">Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
