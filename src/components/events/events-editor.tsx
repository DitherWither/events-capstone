"use client";
import type { DbEvent } from "~/server/db/types";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { deleteEventAction, updateEventAction } from "~/server/events";
import { useRouter } from "next/navigation";
import { Checkbox } from "../ui/checkbox";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";

export function EventsEditor({
  event,
  isAdmin,
}: {
  event: DbEvent;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: event.title ?? "",
    description: event.description ?? "",
    body: event.body ?? "",
    published: event.published,
    // Temporary hack to make discard text work
    // This is because currently, calling
    // setFormData on formData.body does nothing
    // as it is one way (SimpleEditor -> this component)
    // and doesn't work the other way around
    //
    // TODO: fix this hack
    bkey: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setSaveError("Event title is required");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    console.log(formData);

    try {
      const { data, error } = await updateEventAction(event.id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        body: formData.body.trim() || undefined,
        published: formData.published,
      });

      if (error || !data) {
        if (!error) {
          setSaveError(
            "An unknown error occured: No data from server, but no error returned",
          );
          return;
        }
        setSaveError(error);
        return;
      }

      setFormData({
        title: data.title ?? "",
        description: data.description ?? "",
        body: data.body ?? "",
        published: data.published,
        bkey: formData.bkey + 1,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        className="grid gap-4 py-4"
        onKeyDown={(e) => {
          if (e.key == "s" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
          }
        }}
      >
        <div className="container mx-auto grid max-w-4xl gap-2 py-4">
          <input
            id="title"
            placeholder="Enter event title"
            className="text-2xl font-semibold focus:outline-0"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            disabled={isSaving}
          />
          <textarea
            id="description"
            placeholder="Enter event description"
            className="text-muted-foreground focus:outline-0"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            disabled={isSaving}
            rows={3}
          />
          {isAdmin && (
            <div className="flex gap-2">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={(e) =>
                  setFormData((prev) => ({ ...prev, published: e as boolean }))
                }
              />
              <Label htmlFor="published">Event Published</Label>
            </div>
          )}
        </div>
        <SimpleEditor
          content={formData.body}
          setContent={(e) =>
            setFormData((prev) => ({ ...prev, body: e ?? "" }))
          }
          key={formData.bkey}
        />
        {saveError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
      </div>
      <div className="flex w-full justify-end gap-1">
        {/* TODO: Confirmation Dialog */}
        <Button
          variant="destructive"
          onClick={async (e) => {
            setIsSaving(true);
            const { error } = await deleteEventAction(event.id);
            if (error) {
              setSaveError(error);
            } else {
              router.push(`/organization/${event.organizationId}/events`);
            }
          }}
        >
          Delete Event (DESTRUCTIVE)
        </Button>
        <Button
          variant="outline"
          onClick={(e) => {
            setFormData((prev) => ({
              title: event.title ?? "",
              description: event.description ?? "",
              body: event.body ?? "",
              published: event.published,
              bkey: prev.bkey + 1,
            }));
          }}
          disabled={isSaving}
        >
          Discard Changes
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Event"}
        </Button>
      </div>
    </>
  );
}
