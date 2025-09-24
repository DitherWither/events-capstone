import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";
import { failure, success, type Result } from "~/lib/try-catch";

/**
 * User data type inferred from the database schema
 */
export type User = typeof users.$inferSelect;

/**
 * User data type for public operations (excludes sensitive fields)
 */
export type PublicUser = Omit<User, "passwordHash">;

/**
 * Creates a new user in the database
 *
 * @param userData - The user data to insert
 * @returns Result with user ID on success, error message on failure
 */
export async function createUser(userData: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<Result<number, string>> {
  try {
    const [result] = await db
      .insert(users)
      .values(userData)
      .returning({ id: users.id });

    if (!result) {
      return failure("Failed to create user");
    }

    return success(result.id);
  } catch (error) {
    console.error("Database error during user creation:", error);
    return failure("Database error during user creation");
  }
}

/**
 * Finds a user by email address
 *
 * @param email - The email address to search for
 * @returns Result with user data on success, error message on failure
 */
export async function findUserByEmail(
  email: string,
): Promise<Result<User, string>> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return failure("User not found");
    }

    return success(user);
  } catch (error) {
    console.error("Database error during user lookup by email:", error);
    return failure("Database error during user lookup");
  }
}

/**
 * Finds a user by ID
 *
 * @param id - The user ID to search for
 * @returns Result with user data on success, error message on failure
 */
export async function findUserById(id: number): Promise<Result<User, string>> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return failure("User not found");
    }

    return success(user);
  } catch (error) {
    console.error("Database error during user lookup by ID:", error);
    return failure("Database error during user lookup");
  }
}

/**
 * Checks if a user exists with the given email
 *
 * @param email - The email address to check
 * @returns Result with existence boolean on success, error message on failure
 */
export async function userExistsByEmail(
  email: string,
): Promise<Result<boolean, string>> {
  try {
    const [result] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return success(!!result);
  } catch (error) {
    console.error("Database error during user existence check:", error);
    return failure("Database error during user existence check");
  }
}

/**
 * Converts a full user object to a public user object (removes sensitive data)
 *
 * @param user - The full user object
 * @returns The public user object
 */
export function toPublicUser(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}
