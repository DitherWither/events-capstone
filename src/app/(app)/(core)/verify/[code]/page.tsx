import { eq } from "drizzle-orm";
import { AlertCircleIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { getCurrentUser } from "~/server/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const code = (await params).code;

  const { data, error } = await getCurrentUser();

  if (error) {
    return (
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Error with authentication</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (data?.verificationKey === code) {
    await db.update(users).set({ verified: true }).where(eq(users.id, data.id));
    return redirect("/");
  }
  console.log(data);
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Wrong verification key, check your emails again
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
