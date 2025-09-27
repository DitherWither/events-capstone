import { ExternalLink, Calendar, Building2, Users, Loader } from "lucide-react";
import Link from "next/link";
import { getInitials, formatDate } from "~/lib/utils";
import { type OrganizationMembership } from "~/server/db/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { RoleBadge } from "./role-badge";

function OrganizationCard({
  membership,
}: {
  membership: OrganizationMembership;
}) {
  return (
    <Link
      key={membership.organization.id}
      href={`/organization/${membership.organization.id}`}
    >
      <Card className="group w-full cursor-pointer transition-shadow hover:shadow-md">
        <div className="flex items-start justify-start">
          <Avatar className="ml-5 h-14 w-14">
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(membership.organization.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <CardTitle className="group-hover:text-primary text-xl transition-colors">
                      {membership.organization.name}
                    </CardTitle>
                    <ExternalLink className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <CardDescription className="text-base">
                    {membership.organization.description ??
                      "No description available"}
                  </CardDescription>
                </div>
                <RoleBadge role={membership.role} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined: {formatDate(membership.joinedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>
                    Created: {formatDate(membership.organization.createdAt)}
                  </span>
                </div>
                {membership.organization.memberCount && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {membership.organization.memberCount} member
                      {membership.organization.memberCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function OrganizationList({
  memberships,
}: {
  memberships: OrganizationMembership[];
}) {
  if (memberships.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="py-12 text-center">
            <Building2 className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-medium">No organizations found</h3>
            <p className="text-muted-foreground mb-6">
              You&apos;re not a member of any organizations yet. Check your
              invites or ask an admin to invite you.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return memberships.map((membership) => (
    <OrganizationCard
      key={membership.organization.id}
      membership={membership}
    />
  ));
}

export function LoadingCard({ name }: { name: string }) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="py-12 text-center">
          <Loader className="mx-auto mb-4 h-16 w-16 animate-spin" />
          <h3 className="mb-2 text-xl font-medium">Loading {name}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
