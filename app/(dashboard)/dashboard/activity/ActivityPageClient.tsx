"use client";

import ActivityLogList from "./components/ActivityLogList";
import { siteConfig } from "@/lib/config/site";

export default function ActivityPageClient({
  logs,
  totalCount,
  page,
  limit,
}: {
  logs: any[];
  totalCount: number;
  page: number;
  limit: number;
}) {
  const t = siteConfig.activity;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        {t.title}
      </h1>
      <ActivityLogList
        logs={logs}
        totalCount={totalCount}
        page={page}
        limit={limit}
      />
    </section>
  );
}
