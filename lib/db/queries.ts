import { desc, and, eq, isNull, sql } from "drizzle-orm";
import { db } from "./drizzle";
import { activityLogs, teamMembers, teams, users } from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";

/* -------------------------------------------
 * Get the authenticated user from session cookie
 * ------------------------------------------ */
export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie?.value) return null;

  const sessionData = await verifyToken(sessionCookie.value);
  const userId = sessionData?.user?.id;

  if (
    !sessionData ||
    typeof userId !== "number" ||
    new Date(sessionData.expires) < new Date()
  ) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  return user[0] ?? null;
}

/* -------------------------------------------
 * Get team by Stripe customer ID
 * ------------------------------------------ */
export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result[0] ?? null;
}

/* -------------------------------------------
 * Update a team's subscription info
 * ------------------------------------------ */
export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

/* -------------------------------------------
 * Get user with their team ID
 * ------------------------------------------ */
export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

/* -------------------------------------------
 * Get activity logs for current user
 * ------------------------------------------ */
export async function getActivityLogs(page = 1, limit = 10) {
  const user = await getUser();
  if (!user) throw new Error("User not authenticated");

  const offset = (page - 1) * limit;

  const logs = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(activityLogs)
    .where(eq(activityLogs.userId, user.id));

  return {
    logs,
    totalCount: Number(count),
  };
}

/* -------------------------------------------
 * Get activity logs for a team
 * ------------------------------------------ */
export async function getTeamActivityLogs(teamId: number, page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const logs = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
      userEmail: users.email, // ✅ ADD THIS LINE
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.teamId, teamId))
    .orderBy(desc(activityLogs.timestamp))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(activityLogs)
    .where(eq(activityLogs.teamId, teamId));

  return {
    logs,
    totalCount: Number(count),
  };
}


/* -------------------------------------------
 * Get team object for a user (full team data)
 * ------------------------------------------ */
export async function getTeamForUser() {
  const user = await getUser();
  if (!user) return null;

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.team ?? null;
}

/* -------------------------------------------
 * Get team + role for current user
 * Used to restrict access to owners
 * ------------------------------------------ */
export async function getTeamForUserWithRole() {
  const user = await getUser();
  if (!user) return null;

  const membership = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: true,
    },
  });

  if (!membership) return null;

  return {
    id: membership.team.id,
    role: membership.role,
  };
}
