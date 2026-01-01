import { notFound } from "next/navigation";

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
    <div>
      {id} - {eventId}
    </div>
  );
}
