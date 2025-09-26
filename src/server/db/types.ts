import type {
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
 * Organization invite type
 */
export type OrganizationInvite = Omit<
  typeof organizationInvites.$inferSelect,
  "invitedBy" | "organizationId"
> & {
  organization: DbOrganization | null;
  invitedBy: PublicUser | null;
};
