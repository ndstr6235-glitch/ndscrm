"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import CommandPalette from "./command-palette";
import type { Role } from "@/lib/types";

interface CommandPaletteContextValue {
  open: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  open: () => {},
});

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

interface CommandPaletteProviderProps {
  children: React.ReactNode;
  userRole: Role;
  onSelectClient?: (clientId: string) => void;
}

export default function CommandPaletteProvider({
  children,
  userRole,
  onSelectClient,
}: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandPaletteContext value={{ open: handleOpen }}>
      {children}
      <CommandPalette
        open={isOpen}
        onClose={handleClose}
        userRole={userRole}
        onSelectClient={onSelectClient}
      />
    </CommandPaletteContext>
  );
}
