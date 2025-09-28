"use client";

import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import type { UserInvite } from "~/server/db/types";
import { respondToOrganizationInvite } from "~/server/organization";

export default function InviteActions({ invite }: { invite: UserInvite }) {
  const [loadingState, setLoadingState] = useState<
    "idle" | "accepting" | "rejecting"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (action: "accept" | "decline") => {
    setLoadingState(action === "accept" ? "accepting" : "rejecting");
    const result = await respondToOrganizationInvite(
      invite.id,
      action === "accept",
    );
    setLoadingState("idle");
    if (result.error) {
      setError(result.error);
    }

    if (action === "accept") {
      router.push(`/organization/${invite.organization?.id}`);
    }
  };

  return (
    <>
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={() => handleAction("accept")}
          disabled={loadingState !== "idle"}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {loadingState === "accepting" ? "Accepting..." : "Accept"}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleAction("decline")}
          disabled={loadingState !== "idle"}
          className="flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          {loadingState === "rejecting" ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </>
  );
}
