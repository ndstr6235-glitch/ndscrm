import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAuditLogs, getAuditUsers } from "@/app/actions/audit";
import { AuditPageClient } from "./audit-client";

export default async function AuditPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "administrator") redirect("/dashboard");

  const [auditData, users] = await Promise.all([
    getAuditLogs({ page: 1 }),
    getAuditUsers(),
  ]);

  return <AuditPageClient initialData={auditData} users={users} />;
}
