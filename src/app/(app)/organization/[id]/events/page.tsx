import { Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CreateEventButton } from "~/components/events/events-create";
import { EventsList } from "~/components/events/events-list";
import { Button } from "~/components/ui/button";
import { getEventsForOrganization } from "~/server/events";

export default async function OrganizationEventsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);

  if (isNaN(id)) {
    notFound();
  }
  return (
    <div className="container mx-auto max-w-4xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Events</h2>
        <CreateEventButton organizationId={id}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </CreateEventButton>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <MyEventsList id={id} />
      </Suspense>
    </div>
  );
}

async function MyEventsList({ id }: { id: number }) {
  const { data: events, error } = await getEventsForOrganization(id);
  if (error || !events) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return <EventsList events={events} />;
}
