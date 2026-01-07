import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventsEditor } from "~/components/events/events-editor";
import { getUserId } from "~/server/auth";
import { getEventByIdAction } from "~/server/events";
import { fetchOrganizationById } from "~/server/organization";

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
  // TODO make this concurrent
  const userId = await getUserId();
  if (!userId) {
    notFound();
  }

  const { data: event, error } = await getEventByIdAction(id);
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  if (!event) {
    notFound();
  }

  // TODO: Code to check role copied as-is from /organizations/[id]/members page, we should really refactor
  // To make this its own route or something

  const { data: organization, error: orgError } = await fetchOrganizationById(
    event.organizationId,
  );

  if (orgError) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!organization) {
    notFound();
  }

  // Asserting not-null because the fetchOrganizationById function
  // already checks that the user is a member of the organization
  // before returning it.
  //
  // If this assertion fails, something is very wrong.
  const currentMember = organization.members.find(
    (m) => m.user?.id === userId,
  )!;

  const isAdmin = currentMember.role === "admin";

  return <EventsEditor event={event} isAdmin={isAdmin} />;
}
