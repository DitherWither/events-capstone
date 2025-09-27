import { ArrowLeft, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrganizationMembersList } from "~/components/organization/members-list";
import { OrganizationHeading, OrganizationHeadingSkeleton } from "~/components/organization/organization-heading";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { getInitials, formatDate } from "~/lib/utils";
import { fetchOrganizationById } from "~/server/organization";

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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link className="flex items-center gap-2" href="/organization">
            <ArrowLeft className="h-4 w-4" />
            Back to Organizations
          </Link>
        </Button>
      </div>

      <Suspense fallback={<OrganizationDetailsSkeleton />}>
        <OrganizationDetails id={id} />
      </Suspense>
    </div>
  );
}

async function OrganizationDetails({ id }: { id: number }) {
  const { data: organization, error } = await fetchOrganizationById(id);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!organization) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <OrganizationHeading organization={organization} />
      </div>

      <Separator className="mb-8" />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Members</h2>
        <Badge variant="secondary" className="text-sm">
          {organization.members.length} total
        </Badge>
      </div>
      <OrganizationMembersList members={organization.members} />
    </div>
  );
}

function OrganizationDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <OrganizationHeadingSkeleton />
      </div>

      <Separator className="mb-8" />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Members</h2>
        <Badge variant="secondary" className="text-sm">
          ??? total
        </Badge>
      </div>
      <div>Loading members...</div>
    </div>
  )
}