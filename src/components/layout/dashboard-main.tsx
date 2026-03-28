"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import MobileHeader from "./mobile-header";
import CommandPaletteProvider from "@/components/ui/command-palette-provider";
import type { Role } from "@/lib/types";

interface DashboardMainProps {
  firstName: string;
  lastName: string;
  userRole: Role;
  children: React.ReactNode;
}

export default function DashboardMain({
  firstName,
  lastName,
  userRole,
  children,
}: DashboardMainProps) {
  const { collapsed } = useSidebar();

  return (
    <CommandPaletteProvider userRole={userRole}>
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 w-full overflow-x-hidden transition-[margin] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "md:ml-[68px]",
          collapsed ? "lg:ml-[68px]" : "lg:ml-[220px]"
        )}
      >
        <MobileHeader firstName={firstName} lastName={lastName} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6 lg:py-8 lg:px-9">
          {children}
        </main>
      </div>
    </CommandPaletteProvider>
  );
}
