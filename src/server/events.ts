"use server";

import { failure } from "~/lib/try-catch";
import { createEvent, getEvents, getOrganizationEvents } from "./db/event";
import type { CreateEvent } from "./db/types";
import { getAuthOrganization } from "./organization";
import { revalidatePath } from "next/cache";

// Currently just wrappers, as we don't have any filtering or recommendations

export async function getAllEvents() {
  return getEvents();
}

export async function getEventsForOrganization(organizationId: number) {
  return getOrganizationEvents(organizationId);
}

export async function newEvent(event: CreateEvent) {
  const { data: auth, error: authError } = await getAuthOrganization(
    event.organizationId,
  );

  if (authError || !auth) {
    return failure(authError);
  }

  // TODO: validate input

  const res = await createEvent(event);
  revalidatePath(`/organization/${event.organizationId}/events`);
  return res;
}
