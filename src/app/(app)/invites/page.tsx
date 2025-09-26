import { Suspense } from "react";
import InviteList from "~/components/organization/invites/invite-list";
import { fetchMyOrganizationInvites } from "~/server/organization";

export default function InvitesPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-foreground mb-4 text-xl font-semibold">
          Pending Invites
        </h2>
        <div className="space-y-4">
          <Suspense
            fallback={
              <div className="text-center text-muted-foreground">
                Loading invites...
              </div>
            }
          >
            <MyInvitesList/>
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
      <div className="text-center text-destructive">
        Error loading invites: {error ?? "An unknown error occurred."}
      </div>
    );
  }

  return <InviteList invites={invites} />;
}
