import { failure, success, type Result } from "~/lib/try-catch";
import {
  organizationInvites,
  organizationMembers,
  organizations,
  users,
} from "./schema";
import { db } from ".";
import { and, count, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type {
  Organization,
  UserInvite,
  OrganizationInviteState,
  OrganizationMemberRole,
  OrganizationMembership,
  AdminInvite,
} from "./types";

/**
 * Creates a new organization in the database
 *
 * @param orgData - The organization data to insert
 * @returns Result with organization ID on success, error message on failure
 */
export async function createOrganization(orgData: {
  name: string;
  description?: string;
}): Promise<Result<number, string>> {
  try {
    const [result] = await db
      .insert(organizations)
      .values(orgData)
      .returning({ id: organizations.id });

    if (!result) {
      return failure("Failed to create organization");
    }

    return success(result.id);
  } catch (error) {
    console.error("Database error during organization creation:", error);
    return failure("Database error during organization creation");
  }
}

type OrgMember = {
  userId: number;
  role?: OrganizationMemberRole;
};
/**
 * Adds a member to an organization
 *
 * @param orgId - The ID of the organization
 * @param member - The member data (userId and optional role)
 * @returns Result with member ID on success, error message on failure
 */
export async function addOrganizationMember(
  orgId: number,
  member: OrgMember,
): Promise<Result<void, string>> {
  try {
    await db.insert(organizationMembers).values({
      organizationId: orgId,
      userId: member.userId,
      role: member.role ?? "member",
    });

    return success(void 0);
  } catch (error) {
    console.error("Database error during adding organization member:", error);
    return failure("Database error during adding organization member");
  }
}

/**
 * Creates an organization invite
 *
 * @param orgId - The ID of the organization
 * @param currentUserId - The ID of the user sending the invite
 * @param userIdToInvite - The ID of the user to invite
 * @returns Result with invite ID on success, error message on failure
 */
export async function createOrganizationInvite(
  orgId: number,
  currentUserId: number,
  userIdToInvite: number,
): Promise<Result<number, string>> {
  try {
    const [result] = await db
      .insert(organizationInvites)
      .values({
        organizationId: orgId,
        userId: userIdToInvite,
        state: "pending",
        invitedBy: currentUserId,
      })
      .returning({ id: organizationInvites.id });

    if (!result) {
      return failure("Failed to create organization invite");
    }

    return success(result.id);
  } catch (error) {
    console.error("Database error during creating organization invite:", error);
    return failure("Database error during creating organization invite");
  }
}

/**
 * Get invites for a user
 *
 * @param userId - The ID of the user
 * @returns Result with list of invites on success, error message on failure
 */
export async function getOrganizationInvitesForUser(
  userId: number,
): Promise<Result<UserInvite[], string>> {
  try {
    const invites: UserInvite[] = await db
      .select({
        id: organizationInvites.id,
        userId: organizationInvites.userId,
        organizationId: organizationInvites.organizationId,
        state: organizationInvites.state,
        invitedAt: organizationInvites.invitedAt,
        invitedBy: {
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        },
        organization: {
          id: organizations.id,
          name: organizations.name,
          description: organizations.description,
          createdAt: organizations.createdAt,
        },
      })
      .from(organizationInvites)
      .where(
        and(
          eq(organizationInvites.userId, userId),
          eq(organizationInvites.state, "pending"),
        ),
      )
      .leftJoin(users, eq(organizationInvites.invitedBy, users.id))
      .leftJoin(
        organizations,
        eq(organizationInvites.organizationId, organizations.id),
      );

    return success(invites);
  } catch (error) {
    console.error(
      "Database error during fetching organization invites:",
      error,
    );
    return failure("Database error during fetching organization invites");
  }
}

/**
 * Get invites for an organization
 *
 * @param orgId - The ID of the organization
 * @returns Result with list of invites on success, error message on failure
 */
export async function getOrganizationInvitesForOrganization(
  orgId: number,
): Promise<Result<AdminInvite[], string>> {
  try {
    const invitedUser = alias(users, "invitedUser");
    const inviteCreator = alias(users, "inviteCreator");
    const invites: AdminInvite[] = await db
      .select({
        id: organizationInvites.id,
        user: {
          id: invitedUser.id,
          name: invitedUser.name,
          email: invitedUser.email,
          createdAt: invitedUser.createdAt,
        },
        state: organizationInvites.state,
        invitedAt: organizationInvites.invitedAt,
        invitedBy: {
          id: inviteCreator.id,
          name: inviteCreator.name,
          email: inviteCreator.email,
          createdAt: inviteCreator.createdAt,
        },
      })
      .from(organizationInvites)
      .where(
        and(
          eq(organizationInvites.organizationId, orgId),
          ne(organizationInvites.state, "accepted"),
        ),
      )
      .leftJoin(invitedUser, eq(organizationInvites.userId, invitedUser.id))
      .leftJoin(
        inviteCreator,
        eq(organizationInvites.invitedBy, inviteCreator.id),
      );

    return success(invites);
  } catch (error) {
    console.error(
      "Database error during fetching organization invites for organization:",
      error,
    );
    return failure(
      "Database error during fetching organization invites for organization",
    );
  }
}

/**
 * Set the state of an organization invite
 *
 * @param inviteId - The ID of the invite to update
 * @param state - The new state of the invite
 * @returns Result with void on success, error message on failure
 */
export async function setOrganizationInviteState(
  inviteId: number,
  state: OrganizationInviteState,
): Promise<Result<void, string>> {
  try {
    const [result] = await db
      .update(organizationInvites)
      .set({ state })
      .where(eq(organizationInvites.id, inviteId))
      .returning({ id: organizationInvites.id });

    if (!result) {
      return failure(`Failed to set organization invite state to ${state}`);
    }

    return success(void 0);
  } catch (error) {
    console.error(
      `Database error during setting organization invite state to ${state}:`,
      error,
    );
    return failure(
      `Database error during setting organization invite state to ${state}`,
    );
  }
}

/**
 * Get a user's role in an organization
 *
 * Returns null if the user is not a member of the organization, otherwise returns the role
 *
 * Returns a failure result if there is a database error
 *
 * @param orgId - The ID of the organization
 * @param userId - The ID of the user
 * @returns Result with role on success, error message on failure
 */
export async function getUserRoleInOrganization(
  orgId: number,
  userId: number,
): Promise<Result<OrganizationMemberRole | null, string>> {
  try {
    const [member] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, userId),
        ),
      )
      .limit(1);

    if (!member) {
      return success(null); // User is not a member of the organization
    }

    return success(member.role);
  } catch (error) {
    console.error("Database error during fetching user role:", error);
    return failure("Database error during fetching user role");
  }
}

/**
 * Get invite by ID
 *
 * @param inviteId - The ID of the invite
 * @returns Result with invite on success, error message on failure
 */
export async function getOrganizationInviteById(
  inviteId: number,
): Promise<Result<UserInvite | null, string>> {
  try {
    const [invite] = await db
      .select({
        id: organizationInvites.id,
        userId: organizationInvites.userId,
        organizationId: organizationInvites.organizationId,
        state: organizationInvites.state,
        invitedAt: organizationInvites.invitedAt,
        invitedBy: {
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        },
        organization: {
          id: organizations.id,
          name: organizations.name,
          description: organizations.description,
          createdAt: organizations.createdAt,
        },
      })
      .from(organizationInvites)
      .where(eq(organizationInvites.id, inviteId))
      .leftJoin(users, eq(organizationInvites.invitedBy, users.id))
      .leftJoin(
        organizations,
        eq(organizationInvites.organizationId, organizations.id),
      )
      .limit(1);

    return success(invite ?? null);
  } catch (error) {
    console.error("Database error during fetching invite by ID:", error);
    return failure("Database error during fetching invite by ID");
  }
}

/**
 * Get organization details by ID
 *
 * @param orgId - The ID of the organization
 * @returns Result with organization details on success, error message on failure
 */
export async function getOrganizationById(
  orgId: number,
): Promise<Result<Organization | null, string>> {
  try {
    const org = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        description: organizations.description,
        createdAt: organizations.createdAt,
        members: {
          role: organizationMembers.role,
          joinedAt: organizationMembers.joinedAt,
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        },
      })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .leftJoin(
        organizationMembers,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .leftJoin(users, eq(organizationMembers.userId, users.id));

    if (org.length === 0) {
      return success(null); // Organization not found
    }

    const orgFirst = org[0]!;

    const organization: Organization = {
      id: orgFirst.id,
      name: orgFirst.name,
      description: orgFirst.description,
      createdAt: orgFirst.createdAt,
      members: org
        .filter((m) => m.members !== null && m.user !== null)
        .map((m) => ({
          user: m.user,
          role: m.members!.role,
          joinedAt: m.members!.joinedAt,
        })),
    };

    return success(organization);
  } catch (error) {
    console.error("Database error during fetching organization by ID:", error);
    return failure("Database error during fetching organization by ID");
  }
}

/**
 * Get all organizations a user belongs to
 *
 * @param userId - The ID of the user
 * @returns Result with list of organization memberships on success, error message on failure
 */
export async function getUserOrganizationMemberships(
  userId: number,
): Promise<Result<OrganizationMembership[], string>> {
  try {
    // TODO: this is probably slow for large orgs, optimize if needed
    // A computed count of members per organization stored in the db is a better option
    // or maybe a trigger to update a member count field in the organizations table

    const otherMembers = alias(organizationMembers, "otherMembers");
    const memberships = await db
      .select({
        role: organizationMembers.role,
        joinedAt: organizationMembers.joinedAt,
        organization: {
          id: organizations.id,
          name: organizations.name,
          description: organizations.description,
          createdAt: organizations.createdAt,
          memberCount: count(otherMembers.userId),
        },
      })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId))
      .leftJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .leftJoin(otherMembers, eq(otherMembers.organizationId, organizations.id))
      .groupBy(
        organizationMembers.userId,
        organizationMembers.organizationId,
        organizations.id,
      );

    const membershipsWithOrgs = memberships.filter(
      (m) => m.organization !== null,
    ) as OrganizationMembership[];

    return success(membershipsWithOrgs);
  } catch (error) {
    console.error(
      "Database error during fetching user organization memberships:",
      error,
    );
    return failure(
      "Database error during fetching user organization memberships",
    );
  }
}
