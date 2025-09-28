import { Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InviteButton } from "~/components/organization/invites/invite-create";
import { OutgoingInvites } from "~/components/organization/invites/outgoing-invites";
import { OrganizationMembersList } from "~/components/organization/members-list";
import { Button } from "~/components/ui/button";
import { getUserId } from "~/server/auth";
import {
  fetchMyOrganizationInvites,
  fetchOrganizationById,
  fetchOrganizationInvites,
} from "~/server/organization";

export default async function OrganizationMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);

  if (isNaN(id)) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-4 px-4 py-8">
      <Suspense fallback={<MyMembersListSkeleton />}>
        <MyMembersList id={id} />
      </Suspense>
      <Suspense fallback={<MyOrganizationInvitesSkeleton />}>
        <MyOrganizationInvites id={id} />
      </Suspense>
    </div>
  );
}

async function MyMembersList({ id }: { id: number }) {
  const userId = await getUserId();
  if (!userId) {
    notFound();
  }

  const { data: organization, error } = await fetchOrganizationById(id);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!organization) {
    notFound();
  }

  // Asserting not-null because the fetchOrganizationById function
  // already checks that the user is a member of the organization
  // before returning it.
  //
  // If this assertion fails, something is very wrong.
  const currentMember = organization.members.find(
    (m) => m.user?.id === userId,
  )!;

  const isAdmin = currentMember.role === "admin";

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Members</h2>
        {isAdmin && (
          <InviteButton orgId={id}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Invite Member
            </Button>
          </InviteButton>
        )}
      </div>
      <OrganizationMembersList members={organization.members} />
    </>
  );
}

function MyMembersListSkeleton() {
  return (
    <>
      <h2 className="text-2xl font-semibold">Members</h2>
      <div>Loading members...</div>
    </>
  );
}

async function MyOrganizationInvites({ id }: { id: number }) {
  const { data: invites, error } = await fetchOrganizationInvites(id);

  if (error || !invites) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <h2 className="pt-8 text-2xl font-semibold">Invites</h2>
      <OutgoingInvites invites={invites} />
    </>
  );
}

function MyOrganizationInvitesSkeleton() {
  return (
    <>
      <h2 className="pt-8 text-2xl font-semibold">Invites</h2>
      <div>Loading invites...</div>
    </>
  );
}
