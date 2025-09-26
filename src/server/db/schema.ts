// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  index,
  pgEnum,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
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
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const organizations = createTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
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

export const organizationInvites = createTable(
  "organization_invites",
  {
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
  },
  (table) => [
    uniqueIndex("organization_invite_unique_index").on(
      table.organizationId,
      table.userId,
    ),
  ],
);
