import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // If admin tries to access user dashboard, maybe redirect them to admin?
  // But let's just allow it or redirect. Let's redirect admins to /admin.
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { accountMode: true }
  });

  return (
    <div className="flex min-h-screen h-screen overflow-hidden">
      <Sidebar role="USER" accountMode={user?.accountMode} className="hidden md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header isAdmin={false} />
        <main className="flex-1 p-4 md:p-6 bg-slate-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
