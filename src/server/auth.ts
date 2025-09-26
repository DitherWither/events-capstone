"use server";

import { cookies } from "next/headers";
import z from "zod";
import argon2 from "argon2";
import {
  createUser,
  findUserByEmail,
  findUserById,
  userExistsByEmail,
  toPublicUser,
} from "./db/user";
import type { PublicUser } from "./db/types";
import { failure, success, type Result } from "~/lib/try-catch";

/**
 * Private helper function to set the userId cookie with consistent configuration.
 *
 * @param value - The value to set for the userId cookie (use empty string to clear)
 */
async function setUserIdCookie(value: string) {
  const cookieStore = await cookies();
  cookieStore.set("userId", value, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export async function getUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  // TODO: do something to delete invalid cookie
  // right now we can't just delete it here as this function is used in
  // page render (where we can't set cookies)

  if (!userId) {
    return null;
  }

  let parsedUserId: number;
  try {
    parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      console.error("Invalid userId in cookie:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error parsing userId:", error);
    return null;
  }

  return parsedUserId;
}

/**
 * Registers a new user with the provided information.
 *
 * @param params - An object containing the user's registration details.
 * @param params.name - The user's name. Must be at least 1 character.
 * @param params.email - The user's email address. Must be a valid email format.
 * @param params.password - The user's password. Must be at least 9 characters.
 *
 * @returns A promise that resolves to an object indicating the success or failure of the registration.
 * On success, it returns an object with `success: true` and the registered user's information (id, name, email).
 * On failure, it returns an object with `success: false` and an error message. The error can be due to validation issues,
 * the user already existing, hashing failure, or database errors.
 */
export async function register(params: {
  name: string;
  email: string;
  password: string;
}): Promise<
  Result<
    PublicUser,
    | string
    | { name: string | null; email: string | null; password: string | null }
  >
> {
  // Validate input parameters
  const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(9, "Password must be at least 9 characters"),
  });

  const parsed = registerSchema.safeParse(params);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    /*
     We are using || instead of nullish coalescing because we also want
     empty strings to be turned into null
    
     This prevents a blank error message on the client
    */
    return failure({
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      name: errors.name?.join(", ") || null,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      email: errors.email?.join(", ") || null,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      password: errors.password?.join(", ") || null,
    });
  }

  // Check if user already exists
  const { data: userExists, error: userExistsError } = await userExistsByEmail(
    parsed.data.email,
  );
  if (userExistsError) {
    return failure("Failed to check existing user");
  }

  if (userExists) {
    return failure("User already exists");
  }

  // Proceed with registration logic

  // Hash the password
  const { name, email, password } = parsed.data;

  let passwordHash: string;
  try {
    // passwordHash = await argon2.hash(password);
    passwordHash = await argon2.hash(password);
  } catch (error) {
    console.error("Hashing error:", error);
    return failure("Failed to hash password");
  }

  // Save user to the database

  const { data: userId, error: createUserError } = await createUser({
    name,
    email,
    passwordHash,
  });

  if (createUserError || !userId) {
    return failure(createUserError ?? "Failed to create user");
  }

  // Set cookie
  await setUserIdCookie(userId.toString());

  // Fetch the created user to return consistent public user data
  const { data: user, error: findUserError } = await findUserById(userId);
  if (findUserError || !user) {
    return failure("Failed to retrieve created user");
  }

  return success(toPublicUser(user));
}

/**
 * @async
 * @function getCurrentUser
 * @description Retrieves the current user based on the userId stored in a cookie.
 * @returns {Promise<{success: boolean, user?: User | undefined, error?: string}>} A promise that resolves to an object.
 *          If successful, the object contains `success: true` and the user object.
 *          If unsuccessful, the object contains `success: false` and an error message.
 *
 * @example
 * ```typescript
 * const result = await getCurrentUser();
 * if (result.success) {
 *   console.log('Current user:', result.user);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */
export async function getCurrentUser(): Promise<
  Result<PublicUser | null, string>
> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return success(null);
  }

  let parsedUserId: number;
  try {
    parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      console.error("Invalid userId in cookie:", userId);
      return failure(
        `Invalid userId in cookie: ${userId}. Please delete invalid cookie, then refresh`,
      );
    }
  } catch (error) {
    console.error("Error parsing userId:", error);
    return failure(
      "Error parsing user ID from cookie. Please delete invalid cookie, then refresh",
    );
  }

  const userResult = await findUserById(parsedUserId);

  if (userResult.error) {
    return failure(
      `Failed to find user: ${userResult.error}. Please delete invalid cookie, and then refresh`,
    );
  }

  return success(toPublicUser(userResult.data!));
}

/**
 * Logs out the user by clearing the 'userId' cookie.
 *
 * @returns A promise that resolves to an object indicating the success of the logout operation.
 */
export async function logout(): Promise<Result<void, never>> {
  await setUserIdCookie("");
  return success(undefined);
}

/**
 * Logs in a user with the provided email and password.
 *
 * @param params - An object containing the user's login credentials.
 * @param params.email - The user's email address. Must be a valid email format.
 * @param params.password - The user's password. Must be at least 9 characters.
 *
 * @returns A promise that resolves to an object indicating the success or failure of the login.
 * On success, it returns an object with `success: true` and the logged-in user's information (id, name, email).
 * On failure, it returns an object with `success: false` and an error message.
 */
export async function login(params: {
  email: string;
  password: string;
}): Promise<
  Result<PublicUser, string | { email: string | null; password: string | null }>
> {
  const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(9, "Password must be at least 9 characters"),
  });

  const parsed = loginSchema.safeParse(params);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    /*
     We are using || instead of nullish coalescing because we also want
     empty strings to be turned into null
    
     This prevents a blank error message on the client
    */
    return failure({
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      email: errors.email?.join(", ") || null,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      password: errors.password?.join(", ") || null,
    });
  }

  const { email, password } = parsed.data;

  const userResult = await findUserByEmail(email);

  if (userResult.error) {
    return failure(userResult.error);
  }

  const isValidPassword = await argon2.verify(
    userResult.data!.passwordHash,
    password,
  );
  if (!isValidPassword) {
    return failure("Invalid password");
  }

  // Set cookie
  await setUserIdCookie(userResult.data!.id.toString());

  return success(toPublicUser(userResult.data!));
}
