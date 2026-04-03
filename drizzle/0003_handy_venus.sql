CREATE TABLE "events_capstone_event_watchers" (
	"event_id" serial NOT NULL,
	"user_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "event_watcher_pkey" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "events_capstone_events" ADD COLUMN "registration_link" text;--> statement-breakpoint
ALTER TABLE "events_capstone_event_watchers" ADD CONSTRAINT "events_capstone_event_watchers_event_id_events_capstone_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events_capstone_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_capstone_event_watchers" ADD CONSTRAINT "events_capstone_event_watchers_user_id_events_capstone_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."events_capstone_users"("id") ON DELETE cascade ON UPDATE no action;