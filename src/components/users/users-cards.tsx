"use client";

import { useState } from "react";
import { Pencil, Trash2, Power, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { toggleUserActive, deleteUser, type UserRow } from "@/app/actions/users";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  administrator: { label: "Admin", cls: "bg-ruby/10 text-ruby border-ruby/20" },
  supervisor: { label: "Supervizor", cls: "bg-gold/10 text-gold border-gold/20" },
  broker: { label: "Broker", cls: "bg-sapphire/10 text-sapphire border-sapphire/20" },
};

interface UsersCardsProps {
  users: UserRow[];
  isAdmin: boolean;
  currentUserId: string;
  onEdit: (user: UserRow) => void;
}

export default function UsersCards({
  users,
  isAdmin,
  currentUserId,
  onEdit,
}: UsersCardsProps) {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteTarget = users.find((u) => u.id === deleteId);

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteUser(deleteId);
    if (result.success) {
      toast("Uživatel smazán");
    } else {
      toast(result.error || "Nepodařilo se smazat", "error");
    }
    setDeleteId(null);
  }

  async function handleToggleActive(id: string) {
    const result = await toggleUserActive(id);
    if (result.success) {
      toast("Status uživatele změněn");
    } else {
      toast(result.error || "Nepodařilo se změnit status", "error");
    }
  }

  return (
    <>
      <div className="md:hidden space-y-3">
        {users.map((user) => {
          const roleMeta = ROLE_BADGE[user.role] || ROLE_BADGE.broker;
          const isSelf = user.id === currentUserId;

          return (
            <div
              key={user.id}
              className={cn(
                "bg-surface rounded-[16px] border border-border p-4 space-y-3",
                !user.active && "opacity-55"
              )}
            >
              {/* Top row: avatar + name + role badge */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-sm font-bold text-gold shrink-0">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate">
                    {user.firstName} {user.lastName}
                    {isSelf && (
                      <span className="ml-1 text-[10px] text-text-dim">
                        (vy)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-dim truncate">{user.email}</p>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border shrink-0",
                    roleMeta.cls
                  )}
                >
                  {roleMeta.label}
                </span>
              </div>

              {/* Info row */}
              <div className="flex items-center gap-4 text-xs text-text-mid">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                    user.active
                      ? "bg-emerald-pale text-emerald"
                      : "bg-ruby-pale text-ruby"
                  )}
                >
                  {user.active ? "Aktivní" : "Neaktivní"}
                </span>
                <span className="flex items-center gap-1">
                  <FileSignature
                    size={12}
                    className={user.signature ? "text-emerald" : "text-text-faint"}
                  />
                  {user.signature ? "Podpis" : "Bez podpisu"}
                </span>
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="flex gap-2 pt-1 border-t border-border">
                  <button
                    onClick={() => onEdit(user)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[44px] rounded-[8px] text-xs font-medium text-gold hover:bg-gold/10 transition-colors"
                  >
                    <Pencil size={12} />
                    Upravit
                  </button>
                  {!isSelf && (
                    <>
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[44px] rounded-[8px] text-xs font-medium transition-colors",
                          user.active
                            ? "text-amber hover:bg-amber/10"
                            : "text-emerald hover:bg-emerald/10"
                        )}
                      >
                        <Power size={12} />
                        {user.active ? "Deaktivovat" : "Aktivovat"}
                      </button>
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[44px] rounded-[8px] text-xs font-medium text-ruby hover:bg-ruby/10 transition-colors"
                      >
                        <Trash2 size={12} />
                        Smazat
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Smazat uživatele?"
        message={
          deleteTarget
            ? `Opravdu chcete smazat uživatele ${deleteTarget.firstName} ${deleteTarget.lastName}? Tato akce je nevratná.`
            : "Opravdu chcete smazat tohoto uživatele?"
        }
        confirmLabel="Smazat"
        destructive
      />
    </>
  );
}
