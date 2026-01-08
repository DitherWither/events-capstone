import "server-only";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MarkdownView } from "~/components/markdown-view";
import { getEventByIdAction } from "~/server/events";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const id = Number((await params).id);
  if (isNaN(id)) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-4 px-4 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <EventViewer id={id} />
      </Suspense>
    </div>
  );
}

async function EventViewer({ id }: { id: number }) {
  const { data: event, error } = await getEventByIdAction(id);
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">{event.title}</h2>
      <p className="text-muted-foreground">
        <MarkdownView text={event.description ?? ""} />
      </p>
      <p>
        <MarkdownView text={event.body ?? ""} />
      </p>
    </div>
  );
}
