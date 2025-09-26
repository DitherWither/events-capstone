"use client";

import { Plus, AlertCircle } from "lucide-react";
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
import { newOrganization } from "~/server/organization";

export function CreateOrganizationButton() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleCreateOrganization = async () => {
    if (!formData.name.trim()) {
      setCreateError("Organization name is required");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const { error } = await newOrganization({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      if (error) {
        setCreateError(error);
        return;
      }

      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setCreateError(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team. You&amp;ll
            be the admin of this organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              placeholder="Enter organization name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isCreating}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter organization description (optional)"
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
            {isCreating ? "Creating..." : "Create Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
