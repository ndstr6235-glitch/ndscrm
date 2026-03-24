import { getSession } from "@/lib/auth";
import { getEmailPageData } from "@/app/actions/emails";
import EmailsPageClient from "@/components/emails/emails-page-client";
import type { Role } from "@/lib/types";

export default async function EmailsRoute() {
  const session = await getSession();
  if (!session) return null;

  const data = await getEmailPageData();
  if (!data) return null;

  return (
    <EmailsPageClient
      clients={data.clients}
      templates={data.templates}
      userRole={session.role as Role}
    />
  );
}
