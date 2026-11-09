"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadVideoPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file to upload.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("file", file); // Ensure file is appended

    try {
      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload video");
      }

      router.push("/dashboard/videos");
      router.refresh(); // Refresh the videos page
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during upload.");
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upload Video</h1>
        <p className="text-slate-500 text-sm">Dashboard &gt; Upload Video</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Video File</Label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  accept="video/mp4,video/quicktime,video/x-msvideo" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {file ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <UploadCloud className="h-8 w-8" />}
                </div>
                <h3 className="font-medium text-slate-900 text-lg">
                  {file ? file.name : "Click to upload or drag and drop"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "MP4, MOV, AVI up to 2GB"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold text-slate-700">Title</Label>
              <Input id="title" name="title" placeholder="Enter video title" required className="bg-slate-50 border-slate-200 h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-slate-700">Description</Label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="Enter video description" 
                required 
                className="bg-slate-50 border-slate-200 min-h-[120px] resize-none" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="font-semibold text-slate-700">Tags</Label>
              <Input id="tags" name="tags" placeholder="Enter tags separated by comma (e.g. ai, shorts, funny)" className="bg-slate-50 border-slate-200 h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-semibold text-slate-700">Category</Label>
              <select 
                id="category" 
                name="category"
                className="w-full h-11 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                required
              >
                <option value="">Select Category</option>
                <option value="24">Entertainment</option>
                <option value="27">Education</option>
                <option value="23">Comedy</option>
                <option value="20">Gaming</option>
              </select>
            </div>

            <div className="flex items-start space-x-3 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
              <Checkbox id="terms" required className="mt-1 border-indigo-300 text-indigo-600 focus:ring-indigo-600" />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-normal text-slate-700 cursor-pointer"
                >
                  I confirm that I created this video or have the necessary rights to use all content included in it.
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : (
                <>
                  <UploadCloud className="mr-2 h-5 w-5" /> Submit for Review
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
