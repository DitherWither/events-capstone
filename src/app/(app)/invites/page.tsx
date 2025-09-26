import { Suspense } from "react";
import InviteList from "~/components/organization/invites/invite-list";
import { fetchMyOrganizationInvites } from "~/server/organization";

export default function InvitesPage() {
  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Organization Invites
          </h1>
          <p className="text-muted-foreground">
            Manage your pending organization invitations and view your invite
            history.
          </p>
        </div>
        <div className="space-y-4">
          <Suspense
            fallback={
              <div className="text-muted-foreground text-center">
                Loading invites...
              </div>
            }
          >
            <MyInvitesList />
          </Suspense>
        </div>
      </div>
    </>
  );
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
