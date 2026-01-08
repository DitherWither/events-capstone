import { Calendar1, Mail } from "lucide-react";
import type { DbEvent } from "~/server/db/types";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";

export function OrganizationEventsList({ events }: { events: DbEvent[] }) {
  if (events.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="py-12 text-center">
            <Calendar1 className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-medium">No events</h3>
            <p className="text-muted-foreground mb-6">
              Your organization has not created any events yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Link
          href={`/organization/${event.organizationId}/events/${event.id}`}
          key={event.id}
        >
          <Card>
            <CardContent>
              <h3 className="text-2xl font-semibold">{event.title}</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function EventsList({ events }: { events: DbEvent[] }) {
  if (events.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="py-12 text-center">
            <Calendar1 className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-medium">No events</h3>
            <p className="text-muted-foreground mb-6">
              There are no events in our system right now, check back later
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // TODO: show creator of events

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Link href={`/events/${event.id}`} key={event.id}>
          <Card>
            <CardContent>
              <h3 className="text-2xl font-semibold">{event.title}</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
