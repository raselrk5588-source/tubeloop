"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Upload,
  Video,
  CircleDollarSign,
  Wallet,
  MonitorPlay,
  User,
  LogOut,
  Users,
  Settings,
  HelpCircle,
  PlaySquare,
  CheckCircle2,
  XCircle,
  History,
  FileText,
  Flame,
  HardDrive,
  DownloadCloud
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  role?: "ADMIN" | "USER";
  accountMode?: string;
  className?: string;
  onLinkClick?: () => void;
}

type NavLink = {
  name: string;
  href: string;
  icon: any;
  badge?: number;
};

import { useEffect, useState } from "react";
import { getAdminBadgeCounts } from "./actions";

export function Sidebar({ role = "USER", accountMode, className, onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const [badgeCounts, setBadgeCounts] = useState({ pendingReviews: 0, pendingWithdrawals: 0 });

  useEffect(() => {
    if (role === "ADMIN") {
      getAdminBadgeCounts().then(res => {
        if (res) setBadgeCounts(res);
      });
    }
  }, [role]);

  const userLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload Video", href: "/dashboard/upload", icon: Upload },
    { name: "My Videos", href: "/dashboard/videos", icon: Video },
    { name: "Drive Auto-Upload", href: "/dashboard/drive", icon: HardDrive },
    { name: "Trending Shorts", href: "/dashboard/trending", icon: Flame },
    { name: "Download Shorts", href: "/dashboard/downloader", icon: DownloadCloud },
    ...(accountMode !== "PERSONAL" ? [
      { name: "Earnings", href: "/dashboard/earnings", icon: CircleDollarSign },
      { name: "Withdrawal", href: "/dashboard/withdrawal", icon: Wallet },
    ] : []),
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Support", href: "/dashboard/support", icon: HelpCircle },
  ];

  const adminLinks: NavLink[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "YouTube Channels", href: "/admin/channels", icon: MonitorPlay },
    { name: "Pending Review", href: "/admin/reviews", icon: PlaySquare, badge: badgeCounts.pendingReviews > 0 ? badgeCounts.pendingReviews : undefined },
    { name: "Approved Videos", href: "/admin/videos/approved", icon: CheckCircle2 },
    { name: "Rejected Videos", href: "/admin/videos/rejected", icon: XCircle },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: Wallet, badge: badgeCounts.pendingWithdrawals > 0 ? badgeCounts.pendingWithdrawals : undefined },
    { name: "Payments", href: "/admin/payments", icon: History },
    { name: "Upload Logs", href: "/admin/logs", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const links = role === "ADMIN" ? adminLinks : userLinks;
  const isAdmin = role === "ADMIN";
  const activeColor = isAdmin ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700";
  const hoverColor = isAdmin ? "hover:text-green-400" : "hover:text-indigo-400";

  return (
    <div className={cn("w-64 border-r bg-[#1C1C28] text-slate-300 flex flex-col shrink-0 h-full", className)}>
      <div className="flex h-16 items-center border-b border-white/10 px-6 font-bold text-lg text-white gap-3 shrink-0">
        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
          <PlaySquare className="h-4 w-4 text-white" />
        </div>
        TubeLoop
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href} onClick={onLinkClick}>
                <span
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? `text-white ${activeColor}`
                      : `text-slate-400 hover:bg-white/5 ${hoverColor}`
                  )}
                >
                  <div className="flex items-center">
                    <link.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-white" : "text-slate-400"
                      )}
                    />
                    {link.name}
                  </div>
                  {link.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {link.badge}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
