import type { OrganizationMember } from "~/server/db/types";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Mail, Calendar } from "lucide-react";
import { getInitials, formatDate } from "~/lib/utils";
import { RoleBadge } from "./role-badge";

export function OrganizationMembersList({
  members,
}: {
  members: Omit<OrganizationMember, "organization">[];
}) {
  return (
    <div className="grid gap-4">
      {members
        .filter((e) => e.user)
        .map((member) => (
          <Card key={member.user!.id}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-sm font-semibold">
                      {getInitials(member.user!.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold">{member.user!.name}</h3>
                      <RoleBadge role={member.role} />
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>{member.user!.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-muted-foreground text-right text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined: {formatDate(member.joinedAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
