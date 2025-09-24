export type Result<T, E = Error> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: E;
    };

// Helper functions to create results
export function success<T, E = Error>(
  data: T,
): {
  data: T;
  error: null;
} {
  return { data, error: null };
}

export function failure<E>(error: E): {
  data: null;
  error: E;
} {
  return { data: null, error };
}

// Main wrapper function
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

export function tryCatchSync<T, E = Error>(callback: () => T): Result<T, E> {
  try {
    const data = callback();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
