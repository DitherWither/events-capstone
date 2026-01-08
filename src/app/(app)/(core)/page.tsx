import { Suspense } from "react";
import { EventsList } from "~/components/events/events-list";
import { getAllEvents } from "~/server/events";

export default function HomePage() {
  return (
    <>
      <div className="mx-auto max-w-prose pt-10">
        <Suspense fallback={<div>Loading...</div>}>
          <MyHomePage />
        </Suspense>
      </div>
    </>
  );
}

async function MyHomePage() {
  const { data, error } = await getAllEvents();
  if (error || !data) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return <EventsList events={data} />;
}
