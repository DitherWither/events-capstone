import { formatDistanceToNow } from "date-fns";

export function NotificationEmail({
  name,
  eventTitle,
  eventDescription,
  eventDate,
  eventId,
}: {
  name: string;
  eventTitle: string;
  eventDescription: string;
  eventDate: Date;
  eventId: number;
}) {
  const dist = formatDistanceToNow(eventDate);

  return (
    <div>
      <p>Dear {name},</p>
      <p>
        <strong>{eventTitle}</strong> is {dist}
      </p>
      <p>
        <a href={`${process.env.APP_URL}/events/${eventId}`}>
          Click here to go to the event
        </a>
      </p>
      <p>
        <strong>Event Description: </strong>
        {eventDescription}
      </p>
      <p>
        You got this email because you are watching for it in Cappuchino Events.
      </p>
    </div>
  );
}
