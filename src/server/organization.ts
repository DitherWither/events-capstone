"use server";

import { failure, success, type Result } from "~/lib/try-catch";
import {
  addOrganizationMember,
  createOrganization,
  createOrganizationInvite,
  getOrganizationById,
  getOrganizationInviteById,
  getOrganizationInvitesForOrganization,
  getOrganizationInvitesForUser,
  getUserOrganizationMemberships,
  getUserRoleInOrganization,
  setOrganizationInviteState,
} from "./db/organization";
import type {
  Organization,
  UserInvite,
  OrganizationMemberRole,
  OrganizationMembership,
  AdminInvite,
} from "./db/types";
import { getUserId } from "./auth";
import { findUserByEmail } from "./db/user";
import { revalidatePath } from "next/cache";
import { cache } from "react";

async function getAuthOrganization(
  organizationId: number,
): Promise<
  Result<{ role: OrganizationMemberRole | null; userId: number }, string>
> {
  const userId = await getUserId();

  if (!userId) {
    return failure("User must be logged in to access organization");
  }

  const { data: role, error } = await getUserRoleInOrganization(
    organizationId,
    userId,
  );

  if (error) {
    return failure(error);
  }

  return success({ role, userId });
}

export async function isAdmin(orgId: number) {
  const { data: ctx, error } = await getAuthOrganization(orgId);

  if (error || !ctx) {
    return false;
  }

  if (ctx.role !== "admin") {
    return false;
  }

  return true;
}

/**
 * Create an organization and add the creator as an admin member
 *
 * @param orgInfo - Object containing organization name and optional description
 * @returns Result with organization ID on success, error message on failure
 */
export async function newOrganization(orgInfo: {
  name: string;
  description?: string;
}): Promise<Result<number, string>> {
  const userId = await getUserId();

  if (!userId) {
    return failure("User must be logged in to create an organization");
  }
  // TODO: this should be run in a transaction

  const createOrgResult = await createOrganization({
    name: orgInfo.name,
    description: orgInfo.description,
  });

  if (createOrgResult.error) {
    return failure(createOrgResult.error);
  }

  const orgId = createOrgResult.data!;

  const addMemberResult = await addOrganizationMember(orgId, {
    userId,
    role: "admin",
  });

  if (addMemberResult.error) {
    return failure(addMemberResult.error);
  }

  revalidatePath("/organization/");

  return success(orgId);
}

/**
 * Get invites for an organization
 *
 * @param orgId - The ID of the organization
 * @returns Result with array of invites on success, error message on failure
 */
export async function fetchOrganizationInvites(
  orgId: number,
): Promise<Result<AdminInvite[], string>> {
  const { data: auth, error: authError } = await getAuthOrganization(orgId);

  if (authError || !auth) {
    return failure(authError);
  }

  if (!auth.role) {
    return failure(
      "User must be a part of the organization to view organization invites",
    );
  }

  return await getOrganizationInvitesForOrganization(orgId);
}

/**
 * Adds a user to an organization as a member
 *
 * @param orgId - The ID of the organization
 * @param userId - The ID of the user to add
 * @returns Result with void on success, error message on failure
 */
export async function inviteToOrganization(
  orgId: number,
  email: string,
): Promise<Result<void, string>> {
  // if (!(await isAdmin(orgId))) {
  //   return failure(
  //     "User must be an admin to invite members to the organization",
  //   );
  // }
  const { data: auth, error: authError } = await getAuthOrganization(orgId);

  if (authError || !auth) {
    return failure(authError);
  }

  if (auth.role !== "admin") {
    return failure(
      "User must be an admin to invite members to the organization",
    );
  }

  const user = await findUserByEmail(email);

  if (user.error) {
    return failure(user.error);
  }

  if (user.data === null) {
    return failure("No user found with that email");
  }

  const userId = user.data.id;
  const addMemberResult = await createOrganizationInvite(
    orgId,
    auth.userId,
    userId,
  );

  if (addMemberResult.error) {
    return failure(addMemberResult.error);
  }

  revalidatePath("/organization");

  return success(void 0);
}

/**
 * Marks an invitation as cancelled
 *
 * This is an admin action, so the user must be an admin of the organization
 *
 * This will prevent the invite from being accepted in the future.
 *
 * @param inviteId - The ID of the invitation to cancel
 * @returns Result with void on success, error message on failure
 */
export async function cancelOrganizationInvite(
  inviteId: number,
): Promise<Result<void, string>> {
  // Separate check to ensure user is logged in
  //
  // Even if we are doing the admin check later, we want this to
  // run before any database calls, so we can fail fast
  // and DDoS protection
  const userId = await getUserId();

  if (!userId) {
    return failure("User must be logged in to cancel an invite");
  }

  // Fetch the invite to get the organization ID
  const { data: invite, error: fetchError } =
    await getOrganizationInviteById(inviteId);

  if (fetchError) {
    return failure(fetchError);
  }

  if (!invite) {
    return failure("Invite not found");
  }

  // Make sure the user is an admin of the organization

  if (!invite.organization) {
    if (invite.state !== "cancelled") {
      // Just in case, cancel the invite if the organization is gone
      //
      // All invites should be cancelled if the organization is deleted,
      // but just in case something went wrong, we don't want to leave
      // a pending invite dangling around
      const { error } = await setOrganizationInviteState(inviteId, "cancelled");

      if (error) {
        console.error(
          "Failed to cancel invite for deleted organization:",
          error,
        );
        return failure(
          "Invite is not associated with an organization, probably got deleted. Additionally, failed to cancel the invite.",
        );
      }
    }

    return failure(
      "Invite is not associated with an organization, probably got deleted",
    );
  }

  if (!(await isAdmin(invite.organization.id))) {
    return failure("User must be an admin to cancel an organization invite");
  }

  // Make sure the invite is still pending
  if (invite.state === "cancelled") {
    return failure("Invite is already cancelled");
  }

  if (invite.state === "accepted") {
    return failure(
      "Invite has already been accepted, consider removing the user from the organization instead",
    );
  }

  // Now we can cancel the invite
  const res = await cancelOrganizationInvite(inviteId);
  revalidatePath("/organization");
  return res;
}

/**
 * Accept or decline an organization invitation
 *
 * @param inviteId - The ID of the invitation
 * @param accept - True to accept the invite, false to decline
 * @returns Result with void on success, error message on failure
 */
export async function respondToOrganizationInvite(
  inviteId: number,
  accept: boolean,
): Promise<Result<void, string>> {
  const userId = await getUserId();

  if (!userId) {
    return failure("User must be logged in to respond to an invite");
  }

  const { data: invite, error: fetchError } =
    await getOrganizationInviteById(inviteId);

  if (fetchError) {
    return failure(fetchError);
  }

  if (!invite) {
    return failure("Invite not found");
  }

  if (invite.userId !== userId) {
    return failure("User can only respond to their own invitations");
  }

  if (invite.state !== "pending") {
    return failure("Invite is no longer pending");
  }

  if (!invite.organization) {
    // Just in case, cancel the invite if the organization is gone
    //
    // All invites should be cancelled if the organization is deleted,
    // but just in case something went wrong, we don't want to leave
    // a pending invite dangling around
    const { error } = await setOrganizationInviteState(inviteId, "cancelled");

    if (error) {
      console.error("Failed to cancel invite for deleted organization:", error);
      return failure(
        "Invite is not associated with an organization, probably got deleted. Additionally, failed to cancel the invite.",
      );
    }

    return failure(
      "Invite is not associated with an organization, probably got deleted",
    );
  }

  if (accept) {
    const addMemberResult = await addOrganizationMember(
      invite.organization.id,
      { userId },
    );

    if (addMemberResult.error) {
      return failure(addMemberResult.error);
    }
  }

  // Update the invite state to accepted or declined
  const res = await setOrganizationInviteState(
    inviteId,
    accept ? "accepted" : "declined",
  );

  revalidatePath("/organization");
  return res;
}

/**
 * Fetches all organization invites for the authenticated user
 *
 * @returns Result with array of invites on success, error message on failure
 */
export const fetchMyOrganizationInvites = cache(async function (): Promise<
  Result<UserInvite[], string>
> {
  const userId = await getUserId();
  if (!userId) {
    return failure("User must be logged in to view invites");
  }

  return await getOrganizationInvitesForUser(userId);
});

/**
 * Fetches all organization memberships for the authenticated user
 *
 * @returns Result with array of memberships on success, error message on failure
 */
export const fetchMyOrganizationMemberships = cache(async function (): Promise<
  Result<OrganizationMembership[], string>
> {
  const userId = await getUserId();
  if (!userId) {
    return failure("User must be logged in to view organizations");
  }

  return await getUserOrganizationMemberships(userId);
});

/**
 * Fetches a specific organization for the authenticated user
 *
 * @returns Result with organization on success, error message on failure
 */
export const fetchOrganizationById = cache(async function (
  orgId: number,
): Promise<Result<Organization | null, string>> {
  const userId = await getUserId();
  if (!userId) {
    return failure("User must be logged in to view organizations");
  }

  const { data: organization, error } = await getOrganizationById(orgId);
  if (error) {
    return failure(error);
  }

  if (!organization) {
    return success(null);
  }

  // Make sure the user is a member of the organization
  for (const member of organization.members) {
    if (member.user?.id === userId) {
      return success(organization);
    }
  }

  return failure("User is not a member of this organization");
});
