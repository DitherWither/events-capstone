import { AlertCircleIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { getCurrentUser } from "~/server/auth";
import { LocationFetcher } from "./location-fetcher";

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

  return children;
}
