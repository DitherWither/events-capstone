import { ChevronsUpDown } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { fetchMyOrganizationMemberships } from "~/server/organization";
import { notFound } from "next/navigation";
import { OrganizationPickerDropdown } from "./organization-picker-dropdown";
import { Suspense } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { getInitials } from "~/lib/utils";
import { RoleBadge } from "./role-badge";

export async function OrganizationSwitcher({
  organizationId,
}: {
  organizationId: number;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <Suspense fallback={<SwitcherInnerFallback />}>
            <SwitcherInner organizationId={organizationId} />
          </Suspense>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

async function SwitcherInner({ organizationId }: { organizationId: number }) {
  const { data: memberships, error } = await fetchMyOrganizationMemberships();

  if (error || !memberships) {
    return (
      <div className="text-destructive text-center">
        Error loading organizations: {error ?? "An unknown error occurred."}
      </div>
    );
  }

  const organizations = memberships.map((m) => m.organization);
  const activeOrganization = memberships.find(
    (org) => org.organization.id === organizationId,
  );

  if (!activeOrganization) {
    // User is not a member of the active organization
    notFound();
  }

  return (
    <>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="xl"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(activeOrganization.organization.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {activeOrganization.organization.name}
            </span>
            <RoleBadge role={activeOrganization.role} className="m-2" />
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <OrganizationPickerDropdown organizations={organizations} />
    </>
  );
}

export function SwitcherInnerFallback() {
  return (
    <SidebarMenuButton
      size="xl"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <Avatar className="h-12 w-12">
        <AvatarFallback className="text-lg font-semibold">?</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">Loading...</span>
        <RoleBadge role={"member"} className="m-2" />
      </div>
      <ChevronsUpDown className="ml-auto" />
    </SidebarMenuButton>
  );
}
