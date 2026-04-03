// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  boolean,
  geometry,
  index,
  jsonb,
  pgEnum,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `events_capstone_${name}`);

export const users = createTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  locationLastKnown: geometry("location_last_known", {
    type: "point",
    mode: "xy",
    srid: 4326,
  }),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const organizations = createTable("organizations", {
  id: serial("id").primaryKey(),

  name: text("name").notNull().unique(),
  description: text("description"),
  location: geometry("location", { type: "point", mode: "xy", srid: 4326 }),

  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),

  googleMapsLink: text("google_maps_link"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const organizationRole = pgEnum("organization_role", [
  "admin",
  "member",
]);

export const organizationMembers = createTable(
  "organization_members",
  {
    organizationId: serial("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: serial("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: organizationRole().notNull().default("member"),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (table) => [
    primaryKey({
      name: "organization_member_pkey",
      columns: [table.organizationId, table.userId],
    }),
    index("organization_member_role_index").on(table.role),
  ],
);

export const inviteState = pgEnum("organization_invite_state", [
  "pending",
  "cancelled",
  "accepted",
  "declined",
]);

export const organizationInvites = createTable("organization_invites", {
  id: serial("id").primaryKey(),
  organizationId: serial("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: serial("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  state: text("state").notNull().default("pending"),
  invitedBy: serial("invited_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  invitedAt: timestamp("invited_at").defaultNow(),
});

// TODO: tsvector based search index for title body and description

export const events = createTable("events", {
  id: serial("id").primaryKey(),

  organizationId: serial("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  description: text("description"),
  body: text("body"),

  published: boolean("published").notNull().default(false),

  registrationLink: text("registration_link"),

  date: timestamp("date"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const eventWatchers = createTable(
  "event_watchers",
  {
    eventId: serial("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: serial("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    primaryKey({
      name: "event_watcher_pkey",
      columns: [table.eventId, table.userId],
    }),
  ],
);

export const auditLogs = createTable("audit_logs", {
  id: serial("id").primaryKey(),
  organizationId: serial("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),

  userId: serial("user_id").notNull(), // We do not reference the user, we want the log to stay if after the user account gets deleted

  action: text("action").notNull(),
  params: jsonb("params").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
