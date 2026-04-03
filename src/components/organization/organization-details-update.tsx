"use client";

import { useState } from "react";
import type { Organization } from "~/server/db/types";
import { setOrganizationDetails } from "~/server/organization";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { InputGroup, InputGroupInput, InputGroupText } from "../ui/input-group";

export function OrganizationDetailsUpdate({
  organization,
  admin,
}: {
  organization: Organization;
  admin: boolean;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || "",
    locationX: organization.location?.x.toString() || "",
    locationY: organization.location?.y.toString() || "",
    addressLine1: organization.addressLine1 || "",
    addressLine2: organization.addressLine2 || "",
    city: organization.city || "",
    state: organization.state || "",
    postalCode: organization.postalCode || "",
    googleMapsLink: organization.googleMapsLink || "",
  });

  const handleUpdateOrganization = async () => {
    if (!formData.name.trim()) {
      setUpdateError("Organization name is required");
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const { error } = await setOrganizationDetails(organization.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        location:
          formData.locationX && formData.locationY
            ? {
                x: Number(formData.locationX),
                y: Number(formData.locationY),
              }
            : undefined,
        addressLine1: formData.addressLine1.trim() || undefined,
        addressLine2: formData.addressLine2.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
        googleMapsLink: formData.googleMapsLink.trim() || undefined,
      });

      if (error) {
        setUpdateError(error);
        return;
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 rounded-md border p-4">
      <h3 className="text-lg font-semibold">Update Organization Details</h3>
      {updateError && <p className="text-red-500">Error: {updateError}</p>}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Organization Name</Label>
          <Input
            id="name"
            placeholder="Enter organization name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            disabled={!admin || isUpdating}
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
            disabled={!admin || isUpdating}
            rows={3}
          />
        </div>
        <div className="grid gap-2">
          <Label>Location (optional)</Label>

          <div className="grid grid-cols-2 gap-3 rounded-md border px-4 py-2">
            <Label htmlFor="locationX">Latitude</Label>
            <Input
              id="locationX"
              placeholder="Latitude"
              value={formData.locationX}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, locationX: e.target.value }))
              }
              disabled={!admin || isUpdating}
            />
            <Label htmlFor="locationY">Longitude</Label>
            <Input
              id="locationY"
              placeholder="Longitude"
              value={formData.locationY}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, locationY: e.target.value }))
              }
              disabled={!admin || isUpdating}
            />
            <Button
              variant="outline"
              size="sm"
              className="col-span-2"
              disabled={!admin}
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setFormData((prev) => ({
                        ...prev,
                        locationX: position.coords.latitude.toString(),
                        locationY: position.coords.longitude.toString(),
                      }));
                    },
                    (error) => {
                      console.error("Error getting location:", error);
                      alert(
                        "Unable to retrieve location. Please allow location access and try again.",
                      );
                    },
                  );
                } else {
                  alert("Geolocation is not supported by this browser.");
                }
              }}
            >
              Get Current Location
            </Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              placeholder="Enter address line 1"
              value={formData.addressLine1}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  addressLine1: e.target.value,
                }))
              }
              disabled={!admin || isUpdating}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              placeholder="Enter address line 2"
              value={formData.addressLine2}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  addressLine2: e.target.value,
                }))
              }
              disabled={!admin || isUpdating}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              disabled={!admin || isUpdating}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="Enter state"
              value={formData.state}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, state: e.target.value }))
              }
              disabled={!admin || isUpdating}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            placeholder="Enter postal code"
            value={formData.postalCode}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                postalCode: e.target.value,
              }))
            }
            disabled={!admin || isUpdating}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="googleMapsLink">Google Maps Link</Label>
          <Input
            id="googleMapsLink"
            placeholder="Enter Google Maps link"
            value={formData.googleMapsLink}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                googleMapsLink: e.target.value,
              }))
            }
            disabled={!admin || isUpdating}
          />
        </div>
        <Button
          onClick={handleUpdateOrganization}
          disabled={!admin || isUpdating}
        >
          Update Organization
        </Button>
      </div>
    </div>
  );
}
