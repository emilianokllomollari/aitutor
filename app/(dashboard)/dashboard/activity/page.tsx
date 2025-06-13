import {
  getTeamForUserWithRole,
  getTeamActivityLogs,
  getActivityLogs,
} from "@/lib/db/queries";
import ActivityPageClient from "./ActivityPageClient";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params?.page ?? "1", 10) || 1;
  const limit = 9;

  // Fetch team immediately
  const team = await getTeamForUserWithRole();

  if (!team) {
    return <div>You do not have permission to view this page.</div>;
  }

  // Start log fetching in parallel *after* team role is known
  const logFetch =
    team.role === "owner"
      ? getTeamActivityLogs(team.id, page, limit)
      : getActivityLogs(page, limit);

  const { logs, totalCount } = await logFetch;

  return (
    <ActivityPageClient
      logs={logs}
      totalCount={totalCount}
      page={page}
      limit={limit}
    />
  );
}
