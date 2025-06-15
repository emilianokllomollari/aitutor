"use client";

import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Users, Settings, Activity, Shield } from "lucide-react";
import useSWR from "swr";
import { signOut } from "@/app/(login)/actions";
import { User } from "@/lib/db/schema";
import { siteConfig } from "@/lib/config/site";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const router = useRouter();

  const t = siteConfig.navigation.items;

  const navItems = [
    { href: "/dashboard/team", icon: Users, label: t.team },
    { href: "/dashboard/general", icon: Settings, label: t.general },
    { href: "/dashboard/activity", icon: Activity, label: t.activity },
    { href: "/dashboard/security", icon: Shield, label: t.security },
  ];

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push("/");
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {t.pricing}
        </Link>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">{t.signUp}</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ""} />
          <AvatarFallback>
            {user.email
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 flex flex-col gap-1">
        {navItems.map((item) => (
          <DropdownMenuItem key={item.href} className="w-full">
            <Link
              href={item.href}
              className="flex items-center gap-2 w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        <div className="border-t my-1" />

        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex items-center gap-2 text-red-600 focus:text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4 text-red-600" />
              <span>{t.signOut}</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  const { data: team } = useSWR<{ name: string }>("/api/team", fetcher);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          {/* Render only on client to prevent mismatch */}
          {isMounted ? (team?.name ?? siteConfig.name) : siteConfig.name}
        </Link>

        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

// ✅ THE FIXED LAYOUT
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
