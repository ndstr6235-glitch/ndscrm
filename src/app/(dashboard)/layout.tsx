import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import Sidebar from "@/components/layout/sidebar";
import DashboardMain from "@/components/layout/dashboard-main";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = {
    id: session.id,
    firstName: session.firstName,
    lastName: session.lastName,
    email: session.email,
    role: session.role,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh">
        <Sidebar user={user} />
        <DashboardMain
          firstName={user.firstName}
          lastName={user.lastName}
        >
          {children}
        </DashboardMain>
      </div>
    </SidebarProvider>
  );
}
