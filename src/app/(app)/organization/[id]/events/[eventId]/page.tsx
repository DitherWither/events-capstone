import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventsEditor } from "~/components/events/events-editor";
import { getEventByIdAction } from "~/server/events";

export default async function OrganizationEventsPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const id = Number((await params).id);
  const eventId = Number((await params).eventId);

  if (isNaN(id)) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Event Editor</h2>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <MyEventEditor id={eventId} />
      </Suspense>
    </div>
  );
}

async function MyEventEditor({ id }: { id: number }) {
  const { data: event, error } = await getEventByIdAction(id);
  if (error || !event) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return <EventsEditor event={event} />;
}
