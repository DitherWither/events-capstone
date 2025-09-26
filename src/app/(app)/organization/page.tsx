import { Suspense } from "react";
import { OrganizationList } from "~/components/organization/organization-list";
import { fetchMyOrganizationMemberships } from "~/server/organization";

export default async function OrganizationPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-3xl font-bold">
          My Organizations
        </h1>
        <p className="text-muted-foreground">
          Organizations you&amp;re a member of. Click on any organization to
          view details and manage settings.
        </p>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<div>Loading...</div>}>
          <MyOrganizations />
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
