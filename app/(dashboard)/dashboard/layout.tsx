"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Home } from "lucide-react";
import { siteConfig } from "@/lib/config/site";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const t = siteConfig.navigation;

  const navItems = [
    {
      href: "/dashboard",
      icon: Home,
      label: t.items.dashboard,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] w-full relative">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <span className="font-medium">{t.titles.settings}</span>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 h-full relative">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 
            h-[calc(100vh-68px)] overflow-y-auto z-40
            lg:block fixed top-[68px] left-0 
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0`}
        >
          <nav className="p-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="shadow-none my-1 w-full justify-start flex items-center gap-2"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 ml-0 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
