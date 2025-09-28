import { Crown, User } from "lucide-react";
import { Badge } from "../ui/badge";
import type { OrganizationMemberRole } from "~/server/db/types";
import { cn } from "~/lib/utils";

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "member":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return <Crown className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

export function RoleBadge({ role, className }: { role: OrganizationMemberRole, className?: string }) {
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  return (
    <Badge className={cn(getRoleColor(role), className)}>
      <div className="flex items-center gap-1">
        {getRoleIcon(role)}
        {capitalizedRole}
      </div>
    </Badge>
  );
}
