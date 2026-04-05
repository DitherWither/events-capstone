import {
  ArrowUpRight,
  ArrowUpRightSquare,
  Building2,
  Calendar1,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MarkdownView } from "~/components/markdown-view";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { formatDate } from "~/lib/utils";
import {
  getEventByIdAction,
  unwatchEventAction,
  watchEventAction,
} from "~/server/events";

export default async function EventPage({
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
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">{event.title}</h2>
        <div>
          <form
            action={async () => {
              "use server";
              event.isWatching
                ? await unwatchEventAction(id)
                : await watchEventAction(id);
            }}
          >
            <Button variant="outline" size="sm">
              {event.isWatching ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Unwatch
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Watch
                </>
              )}
            </Button>
          </form>
          {event.registrationLink && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ArrowUpRightSquare className="h-4 w-4" />
                Register
              </Link>
            </Button>
          )}
        </div>
      </div>
      {event.date && (
        <div className="text-muted-foreground flex items-center gap-2">
          <Calendar1 className="h-4 w-4" />
          <span>{formatDate(event.date)}</span>
        </div>
      )}
      {event.watchersCount > 0 && (
        <div className="text-muted-foreground flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>{event.watchersCount} watching</span>
        </div>
      )}
      <p className="text-muted-foreground">
        <MarkdownView text={event.description ?? ""} />
      </p>
      <p className="py-4">
        <MarkdownView text={event.body ?? ""} />
      </p>
      {event.organization && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <CardTitle>{event.organization.name}</CardTitle>
              </div>
              <CardDescription>
                {event.organization.description}
              </CardDescription>
              {event.organization.googleMapsLink ||
              event.organization.location ? (
                <Link
                  href={
                    event.organization.googleMapsLink ??
                    `https://www.google.com/maps?q=${event.organization.location?.x},${event.organization.location?.y}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground flex items-center gap-1 underline"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  View on Google Maps
                </Link>
              ) : null}
            </CardHeader>
            <CardContent>
              <address className="not-italic">
                {event.organization.addressLine1 && (
                  <div className="flex items-center gap-2">
                    <span>{event.organization.addressLine1}</span>
                  </div>
                )}
                {event.organization.addressLine2 && (
                  <div className="flex items-center gap-2">
                    <span>{event.organization.addressLine2}</span>
                  </div>
                )}
                {event.organization.city && (
                  <div className="flex items-center gap-2">
                    <span>
                      {event.organization.city}
                      {event.organization.state &&
                        `, ${event.organization.state}`}
                      {event.organization.postalCode &&
                        ` - ${event.organization.postalCode}`}
                    </span>
                  </div>
                )}
              </address>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
