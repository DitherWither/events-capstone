import { ExternalLink, Calendar, Building2, Users } from "lucide-react";
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
import { Badge } from "../ui/badge";

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "member":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "contributor":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

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
        <div className="flex items-start justify-start gap-4">
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
                <Badge className={getRoleColor(membership.role)}>
                  {membership.role}
                </Badge>
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
