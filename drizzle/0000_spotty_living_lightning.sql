CREATE TYPE "public"."organization_invite_state" AS ENUM('pending', 'cancelled', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."organization_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TABLE "events_capstone_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" serial NOT NULL,
	"user_id" serial NOT NULL,
	"action" text NOT NULL,
	"params" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events_capstone_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" serial NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"body" text,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events_capstone_organization_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" serial NOT NULL,
	"user_id" serial NOT NULL,
	"state" text DEFAULT 'pending' NOT NULL,
	"invited_by" serial NOT NULL,
	"invited_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events_capstone_organization_members" (
	"organization_id" serial NOT NULL,
	"user_id" serial NOT NULL,
	"role" "organization_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "organization_member_pkey" PRIMARY KEY("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "events_capstone_organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"location" geometry(point),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "events_capstone_organizations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "events_capstone_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"location_last_known" geometry(point),
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "events_capstone_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "events_capstone_audit_logs" ADD CONSTRAINT "events_capstone_audit_logs_organization_id_events_capstone_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."events_capstone_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_capstone_events" ADD CONSTRAINT "events_capstone_events_organization_id_events_capstone_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."events_capstone_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_capstone_organization_invites" ADD CONSTRAINT "events_capstone_organization_invites_organization_id_events_capstone_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."events_capstone_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_capstone_organization_invites" ADD CONSTRAINT "events_capstone_organization_invites_user_id_events_capstone_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."events_capstone_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_capstone_organization_invites" ADD CONSTRAINT "events_capstone_organization_invites_invited_by_events_capstone_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."events_capstone_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_capstone_organization_members" ADD CONSTRAINT "events_capstone_organization_members_organization_id_events_capstone_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."events_capstone_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_capstone_organization_members" ADD CONSTRAINT "events_capstone_organization_members_user_id_events_capstone_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."events_capstone_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organization_member_role_index" ON "events_capstone_organization_members" USING btree ("role");