import { failure, success, type Result } from "~/lib/try-catch";
import type { CreateEvent, DbEvent, UpdateEvent } from "./types";
import { db } from ".";
import { events, eventWatchers, organizations } from "./schema";
import { and, asc, count, desc, eq, is, sql } from "drizzle-orm";

export async function createEvent(
  event: CreateEvent,
): Promise<Result<number, string>> {
  try {
    const res = await db
      .insert(events)
      .values(event)
      .returning({ id: events.id });

    const id = res[0]?.id;

    return id ? success(id) : failure("Could not create event");
  } catch (e) {
    console.error("Database error during event creation: ", e);
    return failure("Database error during event creation");
  }
}

export async function getPublishedEvents(): Promise<
  Result<
    {
      id: number;
      organizationId: number;
      title: string;
      description: string | null;
      body: string | null;
      published: boolean;
      registrationLink: string | null;
      watchersCount?: number;
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
        distance?: number;
      } | null;
    }[],
    string
  >
> {
  try {
    return success(
      await db
        .select({
          id: events.id,
          organizationId: events.organizationId,
          title: events.title,
          description: events.description,
          body: events.body,
          published: events.published,
          createdAt: events.createdAt,
          date: events.date,
          registrationLink: events.registrationLink,
          watchersCount: sql<number>`(SELECT COUNT(*) FROM ${eventWatchers} WHERE ${eventWatchers.eventId} = ${events.id})`,
          organization: {
            name: organizations.name,
            description: organizations.description,
            location: organizations.location,
            createdAt: organizations.createdAt,
            addressLine1: organizations.addressLine1,
            addressLine2: organizations.addressLine2,
            city: organizations.city,
            state: organizations.state,
            postalCode: organizations.postalCode,
            googleMapsLink: organizations.googleMapsLink,
          },
        })
        .from(events)
        .leftJoin(organizations, eq(events.organizationId, organizations.id))
        .where(eq(events.published, true)),
    );
  } catch (e) {
    console.error("Database error when fetching events: ", e);
    return failure("Database error when fetching events");
  }
}

export async function watchEvent(
  eventId: number,
  userId: number,
): Promise<Result<null, string>> {
  try {
    await db.insert(eventWatchers).values({
      eventId,
      userId,
    });
    return success(null);
  } catch (e) {
    console.error("Database error when watching event: ", e);
    return failure("Database error when watching event");
  }
}

export async function unwatchEvent(
  eventId: number,
  userId: number,
): Promise<Result<null, string>> {
  try {
    await db
      .delete(eventWatchers)
      .where(
        and(
          eq(eventWatchers.eventId, eventId),
          eq(eventWatchers.userId, userId),
        ),
      );
    return success(null);
  } catch (e) {
    console.error("Database error when unwatching event: ", e);
    return failure("Database error when unwatching event");
  }
}

export async function isWatchingEvent(
  eventId: number,
  userId: number,
): Promise<Result<boolean, string>> {
  try {
    const res = await db
      .select()
      .from(eventWatchers)
      .where(
        and(
          eq(eventWatchers.eventId, eventId),
          eq(eventWatchers.userId, userId),
        ),
      );

    return success(res.length > 0);
  } catch (e) {
    console.error("Database error when checking if watching event: ", e);
    return failure("Database error when checking if watching event");
  }
}

export async function getEventsForLocation(
  location: {
    x: number;
    y: number;
  },
  userId: number,
): Promise<
  Result<
    {
      id: number;
      organizationId: number;
      title: string;
      description: string | null;
      body: string | null;
      published: boolean;
      createdAt: Date | null;
      date: Date | null;
      watchersCount?: number;
      isWatching?: number;
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
        distance?: number;
      } | null;
    }[],
    string
  >
> {
  try {
    return success(
      await db
        .select({
          id: events.id,
          organizationId: events.organizationId,
          title: events.title,
          description: events.description,
          body: events.body,
          published: events.published,
          createdAt: events.createdAt,
          date: events.date,
          registrationLink: events.registrationLink,
          watchersCount: db.$count(
            eventWatchers,
            eq(eventWatchers.eventId, events.id),
          ),
          ...(userId
            ? {
                isWatching: db.$count(
                  eventWatchers,
                  and(
                    eq(eventWatchers.eventId, events.id),
                    eq(eventWatchers.userId, userId),
                  ),
                ),
              }
            : {}),
          organization: {
            name: organizations.name,
            description: organizations.description,
            location: organizations.location,
            addressLine1: organizations.addressLine1,
            addressLine2: organizations.addressLine2,
            city: organizations.city,
            state: organizations.state,
            postalCode: organizations.postalCode,
            googleMapsLink: organizations.googleMapsLink,
            createdAt: organizations.createdAt,
            distance: sql<number>`ST_DistanceSphere(${organizations.location}, ST_MakePoint(${location.y}, ${location.x}))`,
          },
        })
        .from(events)
        .where(eq(events.published, true))
        .leftJoin(organizations, eq(events.organizationId, organizations.id))
        .orderBy(
          desc(
            sql`ST_DistanceSphere(${organizations.location}, ST_MakePoint(${location.y}, ${location.x}))`,
          ),
        ),
    );
  } catch (e) {
    console.error("Database error when fetching events: ", e);
    return failure("Database error when fetching events");
  }
}

export async function getOrganizationEvents(
  organizationId: number,
): Promise<Result<DbEvent[], string>> {
  try {
    return success(
      await db
        .select()
        .from(events)
        .where(eq(events.organizationId, organizationId)),
    );
  } catch (e) {
    console.error("Database error when fetching events: ", e);
    return failure("Database error when fetching events");
  }
}

export async function getEventById(eventId: number, userId?: number) {
  try {
    return success(
      (
        await db
          .select({
            id: events.id,
            organizationId: events.organizationId,
            title: events.title,
            description: events.description,
            body: events.body,
            published: events.published,
            createdAt: events.createdAt,
            registrationLink: events.registrationLink,
            watchersCount: db.$count(
              eventWatchers,
              eq(eventWatchers.eventId, events.id),
            ),
            ...(userId
              ? {
                  isWatching: db.$count(
                    eventWatchers,
                    and(
                      eq(eventWatchers.eventId, events.id),
                      eq(eventWatchers.userId, userId),
                    ),
                  ),
                }
              : {}),
            date: events.date,
            organization: {
              name: organizations.name,
              description: organizations.description,
              location: organizations.location,
              addressLine1: organizations.addressLine1,
              addressLine2: organizations.addressLine2,
              city: organizations.city,
              state: organizations.state,
              postalCode: organizations.postalCode,
              googleMapsLink: organizations.googleMapsLink,
              createdAt: organizations.createdAt,
            },
          })
          .from(events)
          .leftJoin(organizations, eq(events.organizationId, organizations.id))
          .where(and(eq(events.id, eventId)))
      )[0] ?? null,
    );
  } catch (e) {
    console.error("Database error when fetching event: ", e);
    return failure("Database error when fetching event");
  }
}

// Even if eventId is globally unique, adding in the organizationId column
// adds an additional auth check

export async function updateEvent(
  organizationId: number,
  eventId: number,
  newEvent: UpdateEvent,
) {
  try {
    return success(
      (
        await db
          .update(events)
          .set(newEvent)
          .where(
            and(
              eq(events.organizationId, organizationId),
              eq(events.id, eventId),
            ),
          )
          .returning()
      )[0],
    );
  } catch (e) {
    console.error("Database error when updating event: ", e);
    return failure("Database error when updating event");
  }
}

export async function deleteEvent(organizationId: number, eventId: number) {
  try {
    await db
      .delete(events)
      .where(
        and(eq(events.organizationId, organizationId), eq(events.id, eventId)),
      );
    return success(null);
  } catch (e) {
    console.error("Database error when deleting event: ", e);
    return failure("Database error when deleting event");
  }
}
