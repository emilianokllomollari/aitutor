import { desc, and, eq, isNull, sql } from "drizzle-orm";
import { db } from "./drizzle";
import { activityLogs, teamMembers, teams, users, vehicles } from "./schema";
import { ActivityType, NewVehicle } from './schema';
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";

// Type definition for user cache
type UserCache = {
  user: any;
  expires: number;
  sessionId: string;
} | null;

// Cache for user session to avoid repeated authentication
let userCache: UserCache = null;

/* -------------------------------------------
 * Get the authenticated user from session cookie
 * ------------------------------------------ */
export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie?.value) return null;

  const sessionId = sessionCookie.value;

  // Check cache with session validation
  if (userCache && 
      userCache.expires > Date.now() && 
      userCache.sessionId === sessionId) {
    return userCache.user;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  const userId = sessionData?.user?.id;

  if (!sessionData || 
      typeof userId !== "number" || 
      new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  const foundUser = user[0] ?? null;
  
  // Cache with session ID
  if (foundUser) {
    userCache = {
      user: foundUser,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      sessionId: sessionId
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

/* -------------------------------------------
 * Add Vehicle
 * ------------------------------------------ */
export async function addVehicleWithLog(vehicle: NewVehicle) {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  const userTeam = await getUserWithTeam(user.id);
  if (!userTeam?.teamId) throw new Error('User has no team');

  const [newVehicle] = await db
    .insert(vehicles)
    .values(vehicle)
    .returning();

  // Log activity
  await db.insert(activityLogs).values({
    userId: user.id,
    teamId: userTeam.teamId,
    action: ActivityType.ADD_VEHICLE,
    timestamp: new Date(),
    ipAddress: '', // optional: fill in from request if you want
  });

  return newVehicle;
}

/* -------------------------------------------
 * Get all vehicles
 * ------------------------------------------ */
export async function getVehicles() {
  return await db.select().from(vehicles);
}

/* -------------------------------------------
 * Update Vehicle
 * ------------------------------------------ */
export async function updateVehicleById(id: number, data: Partial<NewVehicle>) {
  const user = await getUser();
  if (!user) throw new Error("User not authenticated");

  const userTeam = await getUserWithTeam(user.id);
  if (!userTeam?.teamId) throw new Error("User has no team");

  // Create a clean data object for the update
  const updateData: Partial<NewVehicle> = {};

  // Handle all fields explicitly
  if (data.brand !== undefined) updateData.brand = data.brand;
  if (data.model !== undefined) updateData.model = data.model;
  if (data.year !== undefined) updateData.year = data.year;
  if (data.plate !== undefined) updateData.plate = data.plate;
  if (data.engine !== undefined) updateData.engine = data.engine;
  if (data.fuelType !== undefined) updateData.fuelType = data.fuelType;
  if (data.gearbox !== undefined) updateData.gearbox = data.gearbox;
  if (data.seats !== undefined) updateData.seats = data.seats;
  if (data.kilometers !== undefined) updateData.kilometers = data.kilometers;
  if (data.notes !== undefined) updateData.notes = data.notes;

  // Handle registrationExp carefully
  if (data.registrationExp !== undefined) {
    if (data.registrationExp === null) {
      // Since the schema has .notNull(), we can't set it to null
      // You might want to handle this case differently based on your business logic
      throw new Error("Registration expiration date is required");
    } else {
      // Convert to Date object
      const dateValue = new Date(data.registrationExp);
      if (isNaN(dateValue.getTime())) {
        throw new Error("Invalid registration expiration date");
      }
      updateData.registrationExp = dateValue;
    }
  }

  const updated = await db
    .update(vehicles)
    .set(updateData)
    .where(eq(vehicles.id, id))
    .returning();

  if (updated.length === 0) {
    throw new Error("Vehicle not found");
  }

  await db.insert(activityLogs).values({
    userId: user.id,
    teamId: userTeam.teamId,
    action: ActivityType.UPDATE_VEHICLE,
    timestamp: new Date(),
    ipAddress: "", // optional
  });

  return updated[0];
}

/* -------------------------------------------
 * Delete Vehicle
 * ------------------------------------------ */
export async function deleteVehicleById(id: number) {
  const user = await getUser();
  if (!user) throw new Error("User not authenticated");

  const userTeam = await getUserWithTeam(user.id);
  if (!userTeam?.teamId) throw new Error("User has no team");

  // Delete the vehicle
  const deleted = await db
    .delete(vehicles)
    .where(eq(vehicles.id, id))
    .returning();

  if (deleted.length === 0) {
    throw new Error("Vehicle not found or already deleted");
  }

  // Log activity
  await db.insert(activityLogs).values({
    userId: user.id,
    teamId: userTeam.teamId,
    action: ActivityType.DELETE_VEHICLE,
    timestamp: new Date(),
    ipAddress: "", // Fixed: was 'ipAccount'
  });

  return deleted[0];
}