"use client";

import { Search, UserCircle, LogOut, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { NotificationsMenu } from "./notifications-menu";

interface HeaderProps {
  isAdmin?: boolean;
}

export function Header({ isAdmin = false }: HeaderProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <header className="flex h-16 shrink-0 items-center justify-between md:justify-end gap-4 border-b bg-white px-4 md:px-6 sticky top-0 z-10">
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="p-2 text-slate-500 hover:text-slate-900 rounded-md">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <Sidebar role={isAdmin ? "ADMIN" : "USER"} className="w-full border-r-0 h-full" onLinkClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-4">
      <NotificationsMenu />
      
      <div className="flex items-center gap-3 pl-4 border-l">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900 leading-none">
            {session?.user?.name || (isAdmin ? "Admin" : "User")}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin ? "Super Admin" : "User"}
          </p>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'Felix'}`} alt="Avatar" />
          <AvatarFallback>{isAdmin ? "AD" : "US"}</AvatarFallback>
        </Avatar>
      </div>
      </div>
    </header>
  );
}
