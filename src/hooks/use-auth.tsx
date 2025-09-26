import useSWR from "swr";
import { getCurrentUser } from "~/server/auth";
import type { PublicUser } from "~/server/db/types";

export function useAuth():
  | {
      user: PublicUser | null;
      error: null;
      isLoading: false;
    }
  | {
      user: null;
      error: string;
      isLoading: false;
    }
  | {
      user: null;
      error: null;
      isLoading: true;
    } {
  const { data, isLoading } = useSWR("getCurrentUser", getCurrentUser);

  if (isLoading) {
    return { user: null, error: null, isLoading };
  }

  if (!data) {
    return {
      user: null,
      error: "Failed to fetch action",
      isLoading: false,
    };
  }

  if (data.error) {
    return {
      user: null,
      error: data.error,
      isLoading: false,
    };
  }

  return {
    user: data.data,
    error: null,
    isLoading: false,
  };
}
