"use client";

import Link from "next/link";
import { CircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-xl font-semibold text-gray-900">ACME</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Pricing
          </Link>
          <Button asChild className="rounded-full">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
