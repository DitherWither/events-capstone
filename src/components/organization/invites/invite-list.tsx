import { Building2, Badge, User, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import type { OrganizationInvite } from "~/server/db/types";
import InviteActions from "./invite-actions";
import { formatDate } from "~/lib/utils";

function getStateColor(state: string) {
  switch (state) {
    case "accepted":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

export default function InviteList({
  invites,
}: {
  invites: OrganizationInvite[];
}) {
  if (invites.length === 0) {
    return (
      <div className="text-muted-foreground text-center">
        No organization invites found.
      </div>
    );
  }

  return invites.map((invite) => (
    <InviteCard key={invite.id} invite={invite} />
  ));
}

function InviteCard({ invite }: { invite: OrganizationInvite }) {
  return (
    <Card key={invite.id} className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                <Building2 className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {invite.organization?.name ?? "Unknown Organization"}
              </CardTitle>
              <CardDescription>
                {invite.organization?.description ?? "No description available"}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStateColor(invite.state)}>{invite.state}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Invite Details */}
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Invited by: {invite.invitedBy?.name ?? "Unknown"}</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Invited: {formatDate(invite.invitedAt)}</span>
            </div>
          </div>

          <InviteActions invite={invite} />
        </div>
      </CardContent>
    </Card>
  );
}
