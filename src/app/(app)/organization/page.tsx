import { Suspense } from "react";
import InviteList from "~/components/organization/invites/invite-list";
import { CreateOrganizationButton } from "~/components/organization/organization-create";
import { LoadingCard, OrganizationList } from "~/components/organization/organization-list";
import {
  fetchMyOrganizationInvites,
  fetchMyOrganizationMemberships,
} from "~/server/organization";

export default async function OrganizationPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="py-8">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              My Organizations
            </h1>
            <p className="text-muted-foreground pb-2">
              Organizations you&apos;re a member of. Click on any organization
              to view details and manage settings.
            </p>
          </div>

          <CreateOrganizationButton />
        </div>

        <div className="space-y-4">
          <Suspense fallback={<LoadingCard />}>
            <MyOrganizations />
          </Suspense>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-foreground mb-2 text-2xl font-bold">
          Organization Invites
        </h2>
      </div>
      <div className="space-y-4">
        <Suspense
          fallback={
            <LoadingCard />
          }
        >
          <MyInvitesList />
        </Suspense>
      </div>
    </div>
  );
}

async function MyOrganizations() {
  // Fetch user's organization memberships from the server
  const memberships = await fetchMyOrganizationMemberships();

  if (memberships.error || !memberships.data) {
    return (
      <div className="text-destructive text-center">
        Error loading organizations:{" "}
        {memberships.error ?? "An unknown error occurred."}
      </div>
    );
  }

  return <OrganizationList memberships={memberships.data} />;
}

async function MyInvitesList() {
  const { data: invites, error } = await fetchMyOrganizationInvites();

  if (error || !invites) {
    return (
      <div className="text-destructive text-center">
        Error loading invites: {error ?? "An unknown error occurred."}
      </div>
    );
  }

  return <InviteList invites={invites} />;
}
