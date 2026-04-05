import { AlertCircleIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { getCurrentUser } from "~/server/auth";
import { LocationFetcher } from "./location-fetcher";
import { Button } from "~/components/ui/button";
import { resend } from "~/server/resend";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, error } = await getCurrentUser();

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

  if (!user) {
    redirect("/login");
  }

  if (user.locationLastKnown === null) {
    return <LocationFetcher>{children}</LocationFetcher>;
  }

  return (
    <>
      {user && !user.verified && (
        <div className="flex w-full items-center justify-between border-b bg-red-950 p-4">
          <p>
            Your Email isn't verified, please verify to get reminder
            notifications
          </p>
          <form
            action={async () => {
              "use server";

              await resend.emails.send({
                from: "Cappuchino Events <cappuchino-events@dither.dev>",
                to: user.email,
                subject: "Verify your account",
                html: `
    <h1>Verify your Account</h1>
    <p>You need to click on the link below before you get any reminder emails</p>
    <a href="${process.env.APP_URL}/verify/${user.verificationKey}">${process.env.APP_URL}/verify/${user.verificationKey}</a>
    `,
              });
            }}
          >
            <Button variant="outline">Resend Email</Button>
          </form>
        </div>
      )}
      {children}
    </>
  );
}
