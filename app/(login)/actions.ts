'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType,
  invitations
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import { sendTeamInviteEmail } from '@/lib/email/invite';
import { passwordResetTokens } from '@/lib/db/schema';
import crypto from 'crypto';
import { addMinutes } from 'date-fns';
import { sendPasswordResetEmail } from '@/lib/email/password-reset';
import { clearUserCache } from '../../lib/db/queries';
import { revalidatePath, revalidateTag } from 'next/cache';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sign In 
// ─────────────────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional()
});

// ─────────────────────────────────────────────────────────────────────────────
//  Sign Up
// ─────────────────────────────────────────────────────────────────────────────

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  const passwordHash = await hashPassword(password);

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Handle invited user (owner or member)
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (!invitation) {
      return { error: 'Invalid or expired invitation.', email, password };
    }

    teamId = invitation.teamId;
    userRole = invitation.role; // Can be 'owner' or 'member'

    await db
      .update(invitations)
      .set({ status: 'accepted' })
      .where(eq(invitations.id, invitation.id));

    [createdTeam] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);
  } else {
    // Handle self-signup (new team creator, always owner)
    const newTeam: NewTeam = {
      name: `${email}'s Team`
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Failed to create team. Please try again.',
        email,
        password
      };
    }

    teamId = createdTeam.id;
    userRole = 'owner';
  }

  // Insert the user AFTER deciding the role
  const newUser: NewUser = {
    email,
    passwordHash,
    role: userRole // ✅ Role comes from invite or fallback
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    db.insert(teamMembers).values({
      userId: createdUser.id,
      teamId: teamId,
      role: userRole
    }),
    logActivity(teamId, createdUser.id, inviteId ? ActivityType.ACCEPT_INVITATION : ActivityType.CREATE_TEAM),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: createdTeam, priceId });
  }

  redirect('/dashboard');
});


// ─────────────────────────────────────────────────────────────────────────────
//  Sign Out
// ─────────────────────────────────────────────────────────────────────────────

export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  
  // Delete ALL cookies that might contain user data
  const cookieStore = await cookies();
  cookieStore.delete('session');
  cookieStore.delete('token');
  cookieStore.delete('user');
  cookieStore.delete('auth');
  
  // Clear user cache
  clearUserCache();
  
  // Nuclear cache clearing - clear everything
  revalidateTag('user-data');
  revalidateTag('user');
  revalidateTag('team');
  revalidateTag('dashboard');
  revalidatePath('/', 'layout');
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/profile', 'layout');
  
  // Force complete page refresh with cache busting
  redirect(`/?cb=${Date.now()}&logout=1`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Update Password
// ─────────────────────────────────────────────────────────────────────────────


const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Delete Account
// ─────────────────────────────────────────────────────────────────────────────

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Update Account
// ─────────────────────────────────────────────────────────────────────────────

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Remove Team Member
// ─────────────────────────────────────────────────────────────────────────────

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Invite Team Member
// ─────────────────────────────────────────────────────────────────────────────

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    const [newInvitation] = await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending'
    }).returning();

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, userWithTeam.teamId))
      .limit(1);

    await sendTeamInviteEmail({
      email,
      teamName: team.name,
      role,
      inviteId: newInvitation.id
    });

    if (existingInvitation.length > 0) {
      return { success: 'A previous invitation was found and a new one has been sent successfully' };
    }

    return { success: 'Invitation sent successfully' };
  }
);


// ─────────────────────────────────────────────────────────────────────────────
//  Reset Password
// ─────────────────────────────────────────────────────────────────────────────

export async function resetPassword(formData: FormData) {
  const token = formData.get('token') as string;
  const newPassword = formData.get('password') as string;

  if (!token || !newPassword || newPassword.length < 8) {
    return { error: 'Invalid or missing data.' };
  }

  const resetToken = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  if (resetToken.length === 0) {
    return { error: 'Reset token is invalid or expired.' };
  }

  const tokenData = resetToken[0];

  if (new Date(tokenData.expiresAt) < new Date()) {
    return { error: 'Reset token has expired.' };
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, tokenData.userId));

  // Optionally: delete used token
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));

  return { success: 'Your password has been reset.' };
}


const passwordResetSchema = z.object({
  email: z.string().email()
});

export async function requestPasswordReset(formData: FormData) {
  const parsed = passwordResetSchema.safeParse({ email: formData.get('email') });

  if (!parsed.success) {
    return { error: 'Invalid email address.' };
  }

  const email = parsed.data.email;
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user.length === 0) {
    // For security, still return a generic success message
    return { success: 'If an account exists for that email, a reset link has been sent.' };
  }

  const [existingUser] = user;

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = addMinutes(new Date(), 30);

  try {
    await db.insert(passwordResetTokens).values({
      userId: existingUser.id,
      token,
      expiresAt
    }).returning();

    await sendPasswordResetEmail({ email, token });
  } catch (error) {
    console.error('❌ Error in requestPasswordReset:', error);
    return { error: 'Something went wrong. Please try again later.' };
  }

  return { success: 'If an account exists for that email, a reset link has been sent.' };
}



// ─────────────────────────────────────────────────────────────────────────────
//  Change Team Name
// ─────────────────────────────────────────────────────────────────────────────
const updateTeamNameSchema = z.object({
  teamId: z.string().refine(val => !isNaN(Number(val)), {
    message: "Invalid team ID",
  }),
  name: z.string().min(1, 'Team name is required').max(100)
});

export const updateTeamName = validatedActionWithUser(
  updateTeamNameSchema,
  async (data, _, user) => {
    const teamId = parseInt(data.teamId, 10);
    const { name } = data;

    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam || userWithTeam.teamId !== teamId) {
      return { error: 'You do not have permission to update this team.' };
    }

    await Promise.all([
      db.update(teams).set({ name }).where(eq(teams.id, teamId)),
      logActivity(teamId, user.id, ActivityType.UPDATE_TEAM)
    ]);

    // Return the updated name along with success message
    return { 
      success: 'Team name updated successfully.',
      name: name  // Add this line
    };
  }
);

