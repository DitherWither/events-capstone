"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { inviteToOrganization, newOrganization } from "~/server/organization";

export function InviteButton({
  children,
  orgId,
}: {
  children?: React.ReactNode;
  orgId: number;
}) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <ManuallyOpenedInviteDialog
      orgId={orgId}
      isOpen={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
    >
      {children}
    </ManuallyOpenedInviteDialog>
  );
}

export function ManuallyOpenedInviteDialog({
  children,
  orgId,
  isOpen,
  onOpenChange,
}: {
  children?: React.ReactNode;
  orgId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
  });

  const handleSendInvite = async () => {
    if (!formData.email.trim()) {
      setCreateError("Email is required");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const { error } = await inviteToOrganization(orgId, formData.email);

      if (error) {
        setCreateError(error);
        return;
      }

      onOpenChange(false);
      setFormData({ email: "" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    setCreateError(null);
    setFormData({ email: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send an Invite</DialogTitle>
          <DialogDescription>
            Invite a user to join your organization by entering their email
            address. They must already have an account to accept the invitation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="Enter email address to invite"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={isCreating}
            />
          </div>
          {createError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDialogClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleSendInvite} disabled={isCreating}>
            {isCreating ? "Sending..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
