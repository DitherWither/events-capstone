import type {
  events,
  inviteState,
  organizationInvites,
  organizationMembers,
  organizationRole,
  organizations,
  users,
} from "./schema";

/**
 * User data type inferred from the database schema
 */
export type User = typeof users.$inferSelect;

/**
 * User data type for public operations (excludes sensitive fields)
 */
export type PublicUser = Omit<User, "passwordHash">;

/**
 * Organization data type inferred from the database schema
 */
export type DbOrganization = typeof organizations.$inferSelect;

/**
 * Organization member role type
 */
export type OrganizationMemberRole =
  (typeof organizationRole.enumValues)[number];

export type OrganizationMembership = Omit<
  typeof organizationMembers.$inferSelect,
  "organizationId" | "userId"
> & {
  organization: DbOrganization & { memberCount: number };
};

export type OrganizationMember = OrganizationMembership & {
  user: PublicUser | null;
};

export type Organization = DbOrganization & {
  members: Omit<OrganizationMember, "organization">[];
};

/**
 * Organization invite state type
 */
export type OrganizationInviteState = (typeof inviteState.enumValues)[number];

/**
 * Organization invite type for user operations
 */
export type UserInvite = Omit<
  typeof organizationInvites.$inferSelect,
  "invitedBy" | "organizationId"
> & {
  organization: DbOrganization | null;
  invitedBy: PublicUser | null;
};

/**
 * Organization invite type for admin operations
 *
 */
export type AdminInvite = Omit<
  typeof organizationInvites.$inferSelect,
  "invitedBy" | "organizationId" | "userId"
> & {
  user: PublicUser | null;
  invitedBy: PublicUser | null;
};

export type DbEvent = typeof events.$inferSelect;

export type CreateEvent = {
  organizationId: number;
  title: string;
  description?: string;
  body?: string;
};

export type UpdateEvent = {
  title?: string;
  description?: string;
  body?: string;
  published?: boolean;
};
