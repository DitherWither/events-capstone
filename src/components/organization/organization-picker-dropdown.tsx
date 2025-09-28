"use client";
import { Plus } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import type { DbOrganization } from "~/server/db/types";
import { useSidebar } from "../ui/sidebar";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { getInitials } from "~/lib/utils";
import Link from "next/link";
import { ManuallyOpenedCreateOrganizationDialog } from "./organization-create";
import { useState } from "react";

export function OrganizationPickerDropdown({
  organizations,
}: {
  organizations: DbOrganization[];
}) {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);
  return (
    <>
      <ManuallyOpenedCreateOrganizationDialog
        isOpen={open}
        onOpenChange={setOpen}
      />
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Organizations
        </DropdownMenuLabel>
        {organizations.map((organization) => (
          <DropdownMenuItem
            key={organization.name}
            className="gap-2 p-2"
            asChild
          >
            <Link href={`/organization/${organization.id}`}>
              <div className="flex size-6 items-center justify-center rounded-md border">
                <Avatar className="h-full">
                  <AvatarFallback className="font-semibold">
                    {getInitials(organization.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {organization.name}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2" onClick={() => setOpen(true)}>
          <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
            <Plus className="size-4" />
          </div>
          <div className="text-muted-foreground font-medium">Add organization</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </>
  );
}
