import { failure, success, type Result } from "~/lib/try-catch";
import type { CreateEvent, DbEvent, UpdateEvent } from "./types";
import { db } from ".";
import { events } from "./schema";
import { and, eq } from "drizzle-orm";

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

export async function getPublishedEvents(): Promise<Result<DbEvent[], string>> {
  try {
    return success(
      await db.select().from(events).where(eq(events.published, true)),
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

export async function getEventById(
  eventId: number,
): Promise<Result<DbEvent | null, string>> {
  try {
    return success(
      (
        await db
          .select()
          .from(events)
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
