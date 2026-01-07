import { failure, success } from "~/lib/try-catch";
import { db } from ".";
import { desc, eq } from "drizzle-orm";
import { auditLogs, users } from "./schema";

export async function addLog(entry: {
  organizationId: number;
  userId: number;
  action: string;
  params: unknown;
}) {
  try {
    await db.insert(auditLogs).values(entry);
  } catch (e) {
    console.error("Adding audit log failed:", e);
  }
}

export async function getLogsForOrganization(
  organizationId: number,
  page: number,
) {
  try {
    const res = (
      await db
        .select({
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
          id: auditLogs.id,
          action: auditLogs.action,
          params: auditLogs.params,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .where(eq(auditLogs.organizationId, organizationId))
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .orderBy(desc(auditLogs.createdAt))
        .offset(page * 50)
        .limit(50)
    ).reverse();
    return success(res);
  } catch (e) {
    console.error("Database error getting audit log:", e);
    return failure("Database error getting audit log");
  }
}
