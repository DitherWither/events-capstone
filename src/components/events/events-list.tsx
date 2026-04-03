"use client";
import {
  Building,
  Building2,
  Calendar1,
  Eye,
  LocationEditIcon,
  Mail,
} from "lucide-react";
import type { DbEvent } from "~/server/db/types";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { formatDate } from "~/lib/utils";
import { Badge } from "../ui/badge";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
              <div className="flex items-center gap-2">
                <Badge variant={event.published ? "default" : "outline"}>
                  {event.published ? "Published" : "Draft"}
                </Badge>
                <h3 className="text-2xl font-semibold">{event.title}</h3>
              </div>

              <div className="text-muted-foreground grid gap-1 pb-4 text-sm">
                {event.date && (
                  <div className="flex items-center gap-2">
                    <Calendar1 className="h-4 w-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                )}
              </div>

              <p className="text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function EventsList({
  events,
}: {
  events: {
    id: number;
    organizationId: number;
    title: string;
    description: string | null;
    body: string | null;
    published: boolean;
    registrationLink: string | null;
    watchersCount?: number | undefined;
    createdAt: Date | null;
    date: Date | null;
    organization: {
      name: string;
      description: string | null;
      location: {
        x: number;
        y: number;
      } | null;
      addressLine1: string | null;
      addressLine2: string | null;
      city: string | null;
      state: string | null;
      postalCode: string | null;
      googleMapsLink: string | null;
      createdAt: Date | null;
      distance?: number | undefined;
    } | null;
  }[];
}) {
  const [sortBy, setSortBy] = useState<
    "dateAsc" | "dateDesc" | "distance" | "watching"
  >(events[0]?.organization?.distance ? "distance" : "dateAsc");

  const sortedEvents = useMemo(() => {
    if (sortBy === "dateAsc") {
      return [...events].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.getTime() - b.date.getTime();
      });
    } else if (sortBy === "dateDesc") {
      return [...events].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.getTime() - a.date.getTime();
      });
    } else if (sortBy === "distance") {
      return [...events].sort((a, b) => {
        if (a.organization?.distance === undefined) return 1;
        if (b.organization?.distance === undefined) return -1;
        return b.organization.distance - a.organization.distance;
      });
    } else {
      return [...events].sort((a, b) => {
        if (a.watchersCount === undefined) return 1;
        if (b.watchersCount === undefined) return -1;
        return b.watchersCount - a.watchersCount;
      });
    }
  }, [events, sortBy]);
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

  return (
    <div>
      <div className="flex justify-between">
        <Button variant="outline" className="mb-4">
          <LocationEditIcon className="mr-2 h-4 w-4" />
          Refetch my location
        </Button>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateAsc">Date (ascending)</SelectItem>
            <SelectItem value="dateDesc">Date (descending)</SelectItem>
            <SelectItem value="watching">Most watching</SelectItem>
            {events[0]?.organization?.distance && (
              <SelectItem value="distance">Distance</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4">
        {sortedEvents.map((event) => (
          <Link href={`/events/${event.id}`} key={event.id}>
            <Card>
              <CardContent>
                <h3 className="text-2xl font-semibold">{event.title}</h3>

                <div className="text-muted-foreground grid gap-1 pb-4 text-sm">
                  {event.organization && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{event.organization.name}</span>
                    </div>
                  )}
                  {event.organization?.city && (
                    <div className="flex items-center gap-2">
                      <LocationEditIcon className="h-4 w-4" />
                      <span>
                        {event.organization.city}
                        {event.organization.state &&
                          `, ${event.organization.state}`}
                      </span>
                    </div>
                  )}
                  {event.date && (
                    <div className="flex items-center gap-2">
                      <Calendar1 className="h-4 w-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{event.watchersCount} watching</span>
                  </div>
                </div>
                <p className="text-muted-foreground">{event.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
