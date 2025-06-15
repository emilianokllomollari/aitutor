"use client";

import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityType } from "@/lib/db/schema";
import { siteConfig } from "@/lib/config/site";

const iconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus,
  [ActivityType.UPDATE_TEAM]: Settings,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
  [ActivityType.ADD_VEHICLE]: CheckCircle,
  [ActivityType.UPDATE_VEHICLE]: Settings,
  [ActivityType.DELETE_VEHICLE]: AlertCircle,
};

function formatTimestamp(date: Date): string {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatAction(action: ActivityType): string {
  const raw =
    siteConfig.activity.actions[action] || siteConfig.activity.actions.UNKNOWN;
  return raw.replace(/invited/gi, "added").replace(/Invited/gi, "Added");
}

interface ActivityLogListProps {
  logs?: {
    id: string | number;
    action: ActivityType;
    timestamp: string;
    ipAddress?: string | null;
    userName?: string | null;
    userEmail?: string | null;
  }[];
  totalCount?: number;
  page?: number;
  limit?: number;
}

export default function ActivityLogList({
  logs = [],
  totalCount = 0,
  page = 1,
  limit = 10,
}: ActivityLogListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalCount);

  const goToPage = (newPage: number) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    setLoading(false);
  }, [page]);

  const t = siteConfig.activity;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.recent}</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <>
            <ul className="space-y-4">
              {logs.map((log) => {
                const Icon = iconMap[log.action] || Settings;
                const userLabel = log.userName || log.userEmail || "";

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {userLabel} - {formatAction(log.action)}
                        {log.ipAddress && ` from IP ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(new Date(log.timestamp))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {start} to {end} of {totalCount} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1 || loading}
                  className={`px-4 py-2 border rounded-md text-sm ${
                    page <= 1 || loading
                      ? "cursor-not-allowed text-gray-400 border-gray-200 bg-gray-100"
                      : "text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages || loading}
                  className={`px-4 py-2 border rounded-md text-sm ${
                    page >= totalPages || loading
                      ? "cursor-not-allowed text-gray-400 border-gray-200 bg-gray-100"
                      : "text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.emptyTitle}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {t.emptyDescription}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
