import type { AdminInvite } from "~/server/db/types";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Mail, Calendar } from "lucide-react";
import { getInitials, formatDate } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { getStateColor } from "./invite-list";

export function OutgoingInvites({ invites }: { invites: AdminInvite[] }) {
  if (invites.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="py-12 text-center">
            <Mail className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-medium">No outgoing invites</h3>
            <p className="text-muted-foreground mb-6">
              Your organization has not sent any invites.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {invites
        .filter((e) => e.user)
        .map((invite) => (
          <Card key={invite.id}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-sm font-semibold">
                      {getInitials(invite.user!.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold">{invite.user!.name}</h3>

                      <Badge className={getStateColor(invite.state)}>
                        {invite.state}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>{invite.user!.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-muted-foreground text-right text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Invited at: {formatDate(invite.invitedAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
