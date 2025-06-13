"use client";

import { useActionState } from "react";
import useSWR from "swr";
import { Suspense } from "react";
import { Loader2, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { customerPortalAction } from "@/lib/payments/actions";
import {
  removeTeamMember,
  inviteTeamMember,
  updateTeamName,
} from "@/app/(login)/actions";
import { TeamDataWithMembers, User } from "@/lib/db/schema";
import { siteConfig } from "@/lib/config/site";

type ActionState = {
  name?: string;
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>{siteConfig.teamSettings.subscription.title}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ManageSubscription() {
  const { data: teamData } = useSWR<TeamDataWithMembers>("/api/team", fetcher);

  const getSubscriptionStatus = (status: string | null | undefined) => {
    switch (status) {
      case "active":
        return siteConfig.teamSettings.subscription.statuses.active;
      case "trialing":
        return siteConfig.teamSettings.subscription.statuses.trialing;
      default:
        return siteConfig.teamSettings.subscription.statuses.none;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{siteConfig.teamSettings.subscription.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                {siteConfig.teamSettings.subscription.currentPlan}:{" "}
                {teamData?.planName || "Free"}
              </p>
              <p className="text-sm text-muted-foreground">
                {getSubscriptionStatus(teamData?.subscriptionStatus)}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                {siteConfig.teamSettings.subscription.manageButton}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type TeamNameFormProps = {
  state: ActionState;
  nameValue?: string;
  teamId?: string;
};

function TeamNameForm({
  state,
  nameValue = "",
  teamId = "",
}: TeamNameFormProps) {
  return (
    <>
      <input type="hidden" name="teamId" value={teamId} />
      <div>
        <Input
          id="name"
          name="name"
          placeholder={siteConfig.teamSettings.name.placeholder}
          defaultValue={state.name || nameValue}
          required
        />
      </div>
    </>
  );
}

// Skeleton component for UpdateTeamNameForm
function UpdateTeamNameSkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{siteConfig.teamSettings.name.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Input
              placeholder="Loading team name..."
              disabled
              className="animate-pulse"
            />
          </div>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled
          >
            {siteConfig.teamSettings.name.update}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TeamNameFormWithData({ state }: { state: ActionState }) {
  const { data: teamData } = useSWR<TeamDataWithMembers>("/api/team", fetcher);
  return (
    <TeamNameForm
      state={state}
      nameValue={teamData?.name ?? ""}
      teamId={teamData?.id ? String(teamData.id) : ""}
    />
  );
}

function UpdateTeamNameForm() {
  const { data: teamData } = useSWR<TeamDataWithMembers>("/api/team", fetcher);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateTeamName,
    {}
  );

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{siteConfig.teamSettings.name.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input
            type="hidden"
            name="teamId"
            value={teamData?.id ? String(teamData.id) : ""}
          />
          <div>
            <Input
              id="name"
              name="name"
              placeholder={siteConfig.teamSettings.name.placeholder}
              defaultValue={state.name || teamData?.name || ""}
              required
            />
          </div>
          {state?.error && <p className="text-red-500">{state.error}</p>}
          {state?.success && <p className="text-green-500">{state.success}</p>}
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isPending || !teamData}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {siteConfig.teamSettings.name.saving}
              </>
            ) : (
              siteConfig.teamSettings.name.update
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>{siteConfig.teamSettings.members.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>("/api/team", fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, {});

  const getUserDisplayName = (user: Pick<User, "id" | "name" | "email">) =>
    user.name || user.email || "Unknown User";

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{siteConfig.teamSettings.members.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {siteConfig.teamSettings.members.empty}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{siteConfig.teamSettings.members.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {teamData.teamMembers.map((member, index) => (
            <li key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {getUserDisplayName(member.user)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {getUserDisplayName(member.user)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </div>
              </div>
              {index > 1 && (
                <form action={removeAction}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isRemovePending}
                  >
                    {isRemovePending
                      ? siteConfig.teamSettings.members.removing
                      : siteConfig.teamSettings.members.remove}
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
        {removeState?.error && (
          <p className="text-red-500 mt-4">{removeState.error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card className="h-[260px]">
      <CardHeader>
        <CardTitle>{siteConfig.teamSettings.invite.title}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const isOwner = user?.role === "owner";
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteTeamMember, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>{siteConfig.teamSettings.invite.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={inviteAction} className="space-y-4">
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={siteConfig.teamSettings.invite.emailPlaceholder}
              required
              disabled={!isOwner}
            />
          </div>
          <div>
            <Label>{siteConfig.teamSettings.invite.roleLabel}</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex space-x-4"
              disabled={!isOwner}
            >
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">
                  {siteConfig.teamSettings.invite.roles.member}
                </Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner">
                  {siteConfig.teamSettings.invite.roles.owner}
                </Label>
              </div>
            </RadioGroup>
          </div>
          {inviteState?.error && (
            <p className="text-red-500">{inviteState.error}</p>
          )}
          {inviteState?.success && (
            <p className="text-green-500">{inviteState.success}</p>
          )}
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isInvitePending || !isOwner}
          >
            {isInvitePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {siteConfig.teamSettings.invite.inviting}
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                {siteConfig.teamSettings.invite.button}
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {!isOwner && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            {siteConfig.teamSettings.invite.onlyOwnerNotice}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">
        {siteConfig.teamSettings.pageTitle}
      </h1>
      <Suspense fallback={<SubscriptionSkeleton />}>
        <ManageSubscription />
      </Suspense>
      <UpdateTeamNameForm />
      <Suspense fallback={<TeamMembersSkeleton />}>
        <TeamMembers />
      </Suspense>
      <Suspense fallback={<InviteTeamMemberSkeleton />}>
        <InviteTeamMember />
      </Suspense>
    </section>
  );
}
