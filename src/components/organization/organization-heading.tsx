import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Calendar, Users } from "lucide-react";
import { getInitials, formatDate } from "~/lib/utils";
import type { Organization } from "~/server/db/types";
import { OrganizationLeaveButton } from "./organization-leave-button";

export function OrganizationHeading({
  organization,
  role,
}: {
  organization: Organization;
  role: string | null;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-xl font-semibold">
            {getInitials(organization.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            {organization.name}
          </h1>
          <p className="text-muted-foreground text-lg">
            {organization.description ?? "No description available"}
          </p>
          <div className="text-muted-foreground mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(organization.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{organization.members.length} members</span>
            </div>
          </div>
        </div>
      </div>
      {role !== "admin" && (
        <div className="mt-4 flex justify-end">
          <OrganizationLeaveButton orgId={organization.id} />
        </div>
      )}
    </div>
  );
}

export function OrganizationHeadingSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarFallback className="text-xl font-semibold"></AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-foreground mb-2 text-3xl font-bold">Loading...</h1>
        <p className="text-muted-foreground text-lg">Loading...</p>
        <div className="text-muted-foreground mt-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created: Loading...</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>??? members</span>
          </div>
        </div>
      </div>
    </div>
  );
}
