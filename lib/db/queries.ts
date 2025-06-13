import { desc, and, eq, isNull, sql } from "drizzle-orm";
import { db } from "./drizzle";
import { activityLogs, teamMembers, teams, users } from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";

// Cache for user session to avoid repeated authentication
let userCache: { user: any; expires: number } | null = null;

/* -------------------------------------------
 * Get the authenticated user from session cookie
 * ------------------------------------------ */
export async function getUser() {
  // Check cache first (cache for 5 minutes)
  if (userCache && userCache.expires > Date.now()) {
    return userCache.user;
  }

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

  const foundUser = user[0] ?? null;
  
  // Cache the user for 5 minutes
  if (foundUser) {
    userCache = {
      user: foundUser,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };
  }

  return foundUser;
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
 * Optimized with single query using window function
 * ------------------------------------------ */
export async function getActivityLogs(page = 1, limit = 10, user?: any) {
  const currentUser = user || await getUser();
  if (!currentUser) throw new Error("User not authenticated");

  const offset = (page - 1) * limit;

  // Single query with window function for count
  const result = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
      userEmail: users.email,
      totalCount: sql<number>`count(*) over()`,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, currentUser.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(limit)
    .offset(offset);

  return {
    logs: result.map(({ totalCount, ...log }) => log),
    totalCount: result[0]?.totalCount || 0,
  };
}

/* -------------------------------------------
 * Get activity logs for a team
 * Optimized with single query using window function
 * ------------------------------------------ */
export async function getTeamActivityLogs(teamId: number, page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  // Single query with window function for count
  const result = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
      userEmail: users.email,
      totalCount: sql<number>`count(*) over()`,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.teamId, teamId))
    .orderBy(desc(activityLogs.timestamp))
    .limit(limit)
    .offset(offset);

  return {
    logs: result.map(({ totalCount, ...log }) => log),
    totalCount: result[0]?.totalCount || 0,
  };
}

/* -------------------------------------------
 * Get team object for a user (optimized with explicit joins)
 * ------------------------------------------ */
export async function getTeamForUser() {
  const user = await getUser();
  if (!user) return null;

  // Use explicit joins instead of nested relations
  const teamData = await db
    .select({
      teamId: teams.id,
      teamName: teams.name,
      teamStripeCustomerId: teams.stripeCustomerId,
      teamStripeSubscriptionId: teams.stripeSubscriptionId,
      teamStripeProductId: teams.stripeProductId,
      teamPlanName: teams.planName,
      teamSubscriptionStatus: teams.subscriptionStatus,
      teamCreatedAt: teams.createdAt,
      teamUpdatedAt: teams.updatedAt,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  if (!teamData.length) return null;

  const team = teamData[0];

  // Get all team members in a separate optimized query
  const members = await db
    .select({
      memberId: teamMembers.id,
      memberRole: teamMembers.role,
      memberJoinedAt: teamMembers.joinedAt,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, team.teamId));

  return {
    id: team.teamId,
    name: team.teamName,
    stripeCustomerId: team.teamStripeCustomerId,
    stripeSubscriptionId: team.teamStripeSubscriptionId,
    stripeProductId: team.teamStripeProductId,
    planName: team.teamPlanName,
    subscriptionStatus: team.teamSubscriptionStatus,
    createdAt: team.teamCreatedAt,
    updatedAt: team.teamUpdatedAt,
    teamMembers: members.map(member => ({
      id: member.memberId,
      role: member.memberRole,
      joinedAt: member.memberJoinedAt,
      user: {
        id: member.userId,
        name: member.userName,
        email: member.userEmail,
      }
    }))
  };
}

/* -------------------------------------------
 * Get team + role for current user (optimized)
 * Used to restrict access to owners
 * ------------------------------------------ */
export async function getTeamForUserWithRole() {
  const user = await getUser();
  if (!user) return null;

  // Use explicit join instead of nested relations
  const result = await db
    .select({
      teamId: teams.id,
      memberRole: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  if (!result.length) return null;

  return {
    id: result[0].teamId,
    role: result[0].memberRole,
  };
}

/* -------------------------------------------
 * Utility function to clear user cache (call after logout)
 * ------------------------------------------ */
export function clearUserCache() {
  userCache = null;
}