"use server";

import { failure } from "~/lib/try-catch";
import {
  createEvent,
  getPublishedEvents,
  getOrganizationEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "./db/event";
import type { CreateEvent, UpdateEvent } from "./db/types";
import { getAuthOrganization } from "./organization";
import { revalidatePath } from "next/cache";

// Currently just wrappers, as we don't have any filtering or recommendations

export async function getAllEvents() {
  return getPublishedEvents();
}

export async function getEventsForOrganization(organizationId: number) {
  return getOrganizationEvents(organizationId);
}

export async function getEventByIdAction(eventId: number) {
  // TODO: If user not part of org, return not found if not published
  return getEventById(eventId);
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

export async function updateEventAction(eventId: number, event: UpdateEvent) {
  // Get the event
  const { data: currentEvent, error: currentEventError } =
    await getEventById(eventId);

  if (currentEventError || !currentEvent) {
    return failure(currentEventError);
  }

  const { data: auth, error: authError } = await getAuthOrganization(
    currentEvent.organizationId,
  );

  if (authError || !auth) {
    return failure(authError);
  }

  if (event.published == currentEvent.published && auth.role != "admin") {
    return failure("You must be an admin to change publish status of an event");
  }

  // TODO: validate input
  const res = await updateEvent(currentEvent.organizationId, eventId, event);

  revalidatePath("/");
  return res;
}

export async function deleteEventAction(eventId: number) {
  // Get the event
  const { data: currentEvent, error: currentEventError } =
    await getEventById(eventId);

  if (currentEventError || !currentEvent) {
    return failure(currentEventError);
  }

  const { data: auth, error: authError } = await getAuthOrganization(
    currentEvent.organizationId,
  );

  if (authError || !auth) {
    return failure(authError);
  }

  if (auth.role != "admin") {
    return failure("You must be an admin to delete an event");
  }

  // TODO: validate input
  const res = await deleteEvent(currentEvent.organizationId, eventId);

  revalidatePath("/");
  return res;
}
