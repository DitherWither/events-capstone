import { and, eq, gt, inArray, lt, or, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { events, eventWatchers, users } from "~/server/db/schema";
import { resend } from "~/server/resend";
import { NotificationEmail } from "./email";
import { isAfter, isBefore, subDays } from "date-fns";

function* chunks<T>(arr: T[], n: number) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

const RATE = 5;
const INTERVAL = 1000;

const DELAY = INTERVAL / RATE;

// Vercel's max runtime for a function is 300 seconds
const MAX_RUNTIME = 300 * 1000;

// Safety buffer for marking db watcher entries as "sent", in case
// we can't send everything in one request
const SAFETY_BUFFER = 30 * 1000;

const SENDING_TIME = MAX_RUNTIME - SAFETY_BUFFER;

// GET request so that it is supported by vercel cron
export async function GET() {
  const startTime = Date.now();
  try {
    const toSend = await db
      .select()
      .from(eventWatchers)
      .leftJoin(events, eq(events.id, eventWatchers.userId))
      .leftJoin(users, eq(users.id, eventWatchers.userId))
      .where(
        and(
          or(
            eq(eventWatchers.notifiedPreviousWeek, false),
            eq(eventWatchers.notifiedPreviousDay, false),
          ),
          lt(events.date, sql`now()`),
          gt(events.date, sql`now() - interval '1 week'`),
          eq(users.verified, true), // We don't want to send ANY emails to non-verified users
        ),
      );

    // Resend API can only handle 50 emails per API request
    const sendChunks = [
      ...chunks(
        toSend.filter(
          (e) => e.events && e.event_watchers && e.users && e.events.date,
        ),
        100,
      ),
    ];
    const sendQueue = sendChunks.map((e) => async () => {
      await resend.batch.send(
        e.map((u) => ({
          from: "Cappuchino Events <cappuchino-events@dither.dev>",
          to: u.users!.email,
          subject: `Event Reminder: ${u.events!.title}`,
          react: NotificationEmail({
            name: u.users!.name,
            eventDate: u.events!.date!,
            eventTitle: u.events!.title,
            eventDescription: u.events!.description!,
            eventId: u.events!.id,
          }),
        })),
      );
      return e.map((u) => ({
        eventId: u.event_watchers.eventId,
        userId: u.event_watchers.userId,
        notifiedPreviousWeek: isAfter(u.events?.date!, subDays(startTime, 8)),
        notifiedPreviousDay: isAfter(u.events?.date!, subDays(startTime, 2)),
      }));
    });

    const sent: {
      eventId: number;
      userId: number;
      notifiedPreviousWeek: boolean;
      notifiedPreviousDay: boolean;
    }[] = [];
    let didBreak = false;
    for (const task of sendQueue) {
      // Stop sending, we need to mark db entries
      // before the runtime kills the function
      if (Date.now() - startTime > SENDING_TIME) {
        didBreak = true;
        break;
      }
      sent.push(...(await task()));

      // We aren't subtracting the time taken making
      // the api request, to have some leeway and avoid
      // triggering a ratelimit
      await new Promise((r) => setTimeout(r, DELAY));
    }

    // update db entries for all sent
    // This is the easiest way to do a bulk update,
    // Counterintuitively
    await db
      .insert(eventWatchers)
      .values(sent)
      .onConflictDoUpdate({
        target: [eventWatchers.eventId, eventWatchers.userId],
        set: {
          notifiedPreviousDay: sql`excluded.notified_previous_day`,
          notifiedPreviousWeek: sql`excluded.notified_previous_week`,
        },
      });

    return Response.json({ status: "ok", finished: !didBreak });
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
