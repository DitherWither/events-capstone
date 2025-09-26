import { env } from "~/env";

export function assert(assertion: () => boolean | Promise<boolean>, message: string): void {
  if (env.NODE_ENV !== "production") {
    const result = assertion();
    if (result instanceof Promise) {
      result.then((res) => {
        console.assert(res, message);
      }).catch(() => {
        console.error("Assertion promise rejected");
        console.assert(false, message);
      });
    } else {
      console.assert(result);
    }
  }
}