"use client";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/use-auth";
import { logout } from "~/server/auth";

export default function HomePage() {
  const { user, error, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error || !user) {
    return <p>Unknown error occured</p>;
  }

  return (
    <>
      <h1>WIP</h1>
      <p>Logged in as {user.name}</p>
      <Button
        onClick={async () => {
          await logout();

          router.push("/login");
        }}
      >
        Logout
      </Button>
    </>
  );
}
