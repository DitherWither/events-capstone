import { Clock, Mail, User2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { fetchOrganizationAuditLogs } from "~/server/organization";

export default async function OrganizationMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);

  if (isNaN(id)) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-4 px-4 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <MyAuditLogs id={id} />
      </Suspense>
    </div>
  );
}

async function MyAuditLogs({ id }: { id: number }) {
  const { data, error } = await fetchOrganizationAuditLogs(id);
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Logs</h2>
      </div>
      {data?.map((log) => (
        <Card key={log.id}>
          <CardContent>
            <h3 className="text-2xl font-semibold">{log.action}</h3>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <User2 className="h-4 w-4" />{" "}
              <span>
                {log.user?.name} ({log.user?.email})
              </span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />{" "}
              <span>{log.createdAt?.toLocaleString()}</span>
            </div>
            <pre className="text-muted-foreground">
              {JSON.stringify(log.params, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
