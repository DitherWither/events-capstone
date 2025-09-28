"use client";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { leaveOrganization } from "~/server/organization";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { IconDoorExit } from "@tabler/icons-react";

export function OrganizationLeaveButton({ orgId }: { orgId: number }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLeave = async () => {
    setIsLeaving(true);
    const result = await leaveOrganization(orgId);
    setIsLeaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    setIsDialogOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <IconDoorExit />
          Leave Organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Organization</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave this organization? You will lose
            access to its resources.
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
            onClick={handleLeave}
            disabled={isLeaving}
          >
            {isLeaving ? "Leaving..." : "Leave Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
