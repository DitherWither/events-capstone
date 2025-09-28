import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { d } from "node_modules/drizzle-kit/index-BAUrj6Ib.mjs";
import { Suspense } from "react";
import { OrganizationMembersList } from "~/components/organization/members-list";
import {
  OrganizationHeading,
  OrganizationHeadingSkeleton,
} from "~/components/organization/organization-heading";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  fetchOrganizationById,
  getAuthOrganization,
} from "~/server/organization";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);

  if (isNaN(id)) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Suspense fallback={<OrganizationDetailsSkeleton />}>
        <OrganizationDetails id={id} />
      </Suspense>
      <Separator className="mb-8" />
      <h2 className="text-foreground mb-2 text-2xl font-bold">
        Welcome to the Organization Dashboard
      </h2>
      <p className="text-muted-foreground pb-2">
        Here you can manage your organization&apos;s settings, view analytics,
        create and manage events, and oversee member activities.
      </p>

      <p>
        Use the navigation menu to access different sections of your
        organization&apos;s dashboard. If you need assistance, refer to the help
        section.
      </p>
    </div>
  );
}

async function OrganizationDetails({ id }: { id: number }) {
  const [
    { data: organization, error: orgFetchError },
    { data: auth, error: authFetchError },
  ] = await Promise.all([fetchOrganizationById(id), getAuthOrganization(id)]);

  if (orgFetchError || authFetchError || !auth) {
    return <div className="text-red-500">Error: {authFetchError ?? orgFetchError}</div>;
  }

  if (!organization) {
    notFound();
  }

  return (
    <div className="flex items-start justify-between">
      <OrganizationHeading organization={organization} role={auth.role} />
    </div>
  );
}

function OrganizationDetailsSkeleton() {
  return (
    <div className="flex items-start justify-between">
      <OrganizationHeadingSkeleton />
    </div>
  );
}
