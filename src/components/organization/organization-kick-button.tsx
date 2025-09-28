"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import type { PublicUser } from "~/server/db/types";
import { kickMemberFromOrganization } from "~/server/organization";

export function OrganizationKickButton({
  orgId,
  member,
  children,
}: {
  orgId: number;
  member: PublicUser;
  children?: React.ReactNode;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isKicking, setIsKicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleKick = async () => {
    setIsKicking(true);
    const result = await kickMemberFromOrganization(orgId, member.id);
    setIsKicking(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    setIsDialogOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kick Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to kick {member.name} from the organization?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleKick}
            disabled={isKicking}
          >
            {isKicking ? "Kicking..." : "Kick Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
