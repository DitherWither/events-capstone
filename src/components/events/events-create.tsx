"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { newEvent } from "~/server/events";

export function CreateEventButton({
  organizationId,
  children,
}: {
  organizationId: number;
  children?: React.ReactNode;
}) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <ManuallyOpenedCreateEventDialog
      organizationId={organizationId}
      isOpen={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
    >
      {children}
    </ManuallyOpenedCreateEventDialog>
  );
}

// TODO: better page based UI for this
export function ManuallyOpenedCreateEventDialog({
  organizationId,
  children,
  isOpen,
  onOpenChange,
}: {
  organizationId: number;
  children?: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    body: "",
  });

  const handleCreateOrganization = async () => {
    if (!formData.title.trim()) {
      setCreateError("Event title is required");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const { error } = await newEvent({
        organizationId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        body: formData.body.trim() || undefined,
      });

      if (error) {
        setCreateError(error);
        return;
      }

      onOpenChange(false);
      setFormData({ title: "", description: "", body: "" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    setCreateError(null);
    setFormData({ title: "", description: "", body: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Create a new organization to share with the world.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Event Name</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              disabled={isCreating}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter event description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={isCreating}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="body">Event Body</Label>
            <Textarea
              id="body"
              placeholder="Enter event body"
              value={formData.body}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  body: e.target.value,
                }))
              }
              disabled={isCreating}
              rows={3}
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
          <Button onClick={handleCreateOrganization} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
