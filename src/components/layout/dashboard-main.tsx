"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import MobileHeader from "./mobile-header";

interface DashboardMainProps {
  firstName: string;
  lastName: string;
  children: React.ReactNode;
}

export default function DashboardMain({
  firstName,
  lastName,
  children,
}: DashboardMainProps) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex-1 flex flex-col transition-[margin] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "md:ml-[68px]",
        collapsed ? "lg:ml-[68px]" : "lg:ml-[220px]"
      )}
    >
      <MobileHeader firstName={firstName} lastName={lastName} />
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:py-8 lg:px-9">
        {children}
      </main>
    </div>
  );
}
