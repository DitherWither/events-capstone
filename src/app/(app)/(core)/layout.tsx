"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { logout } from "~/server/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <>
      <div className="flex w-full justify-between border-b p-4">
        <Link href="/">
          <h1 className="text-3xl">Cappuchino Events</h1>
        </Link>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/organization">Go to Organizations Dashboard</Link>
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            Log Out
          </Button>
        </div>
      </div>
      {children}
    </>
  );
}
