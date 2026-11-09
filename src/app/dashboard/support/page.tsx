import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpCircle, Mail, MessageSquare, Send } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support & Help Center</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Support</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 bg-white text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Live Chat</h3>
            <p className="text-sm text-slate-500">Available 9 AM - 6 PM</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Email Us</h3>
            <p className="text-sm text-slate-500">support@aishorts.com</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 bg-white text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">FAQ</h3>
            <p className="text-sm text-slate-500">Find answers quickly</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg">Send us a Message</CardTitle>
          <CardDescription>Fill out the form below and our team will get back to you within 24 hours.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" defaultValue="Rasel Khan" readOnly className="bg-slate-50 h-11 text-slate-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="rasel@example.com" readOnly className="bg-slate-50 h-11 text-slate-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="What do you need help with?" className="bg-slate-50 h-11" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea 
              id="message" 
              rows={6} 
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" 
              placeholder="Describe your issue in detail..."
            />
          </div>
          
          <div className="pt-2">
            <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8">
              <Send className="h-4 w-4 mr-2" /> Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
