import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen h-screen overflow-hidden">
      <Sidebar role="ADMIN" className="hidden md:flex" />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header isAdmin={true} />
        <main className="flex-1 p-4 md:p-6 bg-slate-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
