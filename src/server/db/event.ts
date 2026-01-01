import { failure, success, type Result } from "~/lib/try-catch";
import type { CreateEvent, DbEvent } from "./types";
import { db } from ".";
import { events } from "./schema";
import { eq } from "drizzle-orm";

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

export async function getEvents(): Promise<Result<DbEvent[], string>> {
  try {
    return success(await db.select().from(events));
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
