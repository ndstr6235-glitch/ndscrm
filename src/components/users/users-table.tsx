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

interface UsersTableProps {
  users: UserRow[];
  isAdmin: boolean;
  currentUserId: string;
  onEdit: (user: UserRow) => void;
}

export default function UsersTable({
  users,
  isAdmin,
  currentUserId,
  onEdit,
}: UsersTableProps) {
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
      <div className="hidden md:block bg-surface rounded-[16px] border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-hover border-b border-border text-left">
              <th className="px-4 py-3 font-medium text-text-mid">Uživatel</th>
              <th className="px-4 py-3 font-medium text-text-mid">Email</th>
              <th className="px-4 py-3 font-medium text-text-mid">Role</th>
              <th className="px-4 py-3 font-medium text-text-mid w-10">
                <FileSignature size={14} className="text-text-dim" />
              </th>
              <th className="px-4 py-3 font-medium text-text-mid">Status</th>
              {isAdmin && (
                <th className="px-4 py-3 font-medium text-text-mid text-right">
                  Akce
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const roleMeta = ROLE_BADGE[user.role] || ROLE_BADGE.broker;
              const isSelf = user.id === currentUserId;

              return (
                <tr
                  key={user.id}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors hover:bg-surface-hover",
                    !user.active && "opacity-55"
                  )}
                >
                  {/* Avatar + Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <span className="font-medium text-text">
                        {user.firstName} {user.lastName}
                        {isSelf && (
                          <span className="ml-1.5 text-[10px] text-text-dim">
                            (vy)
                          </span>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-text-mid">{user.email}</td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border",
                        roleMeta.cls
                      )}
                    >
                      {roleMeta.label}
                    </span>
                  </td>

                  {/* Signature indicator */}
                  <td className="px-4 py-3">
                    {user.signature ? (
                      <FileSignature size={14} className="text-emerald" />
                    ) : (
                      <FileSignature size={14} className="text-text-faint" />
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
                        user.active
                          ? "bg-emerald-pale text-emerald"
                          : "bg-ruby-pale text-ruby"
                      )}
                    >
                      {user.active ? "Aktivní" : "Neaktivní"}
                    </span>
                  </td>

                  {/* Actions */}
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(user)}
                          className="w-10 h-10 flex items-center justify-center rounded-[8px] text-text-dim hover:text-gold hover:bg-gold/10 transition-colors"
                          title="Upravit"
                        >
                          <Pencil size={14} />
                        </button>
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => handleToggleActive(user.id)}
                              className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-[8px] transition-colors",
                                user.active
                                  ? "text-text-dim hover:text-amber hover:bg-amber/10"
                                  : "text-text-dim hover:text-emerald hover:bg-emerald/10"
                              )}
                              title={user.active ? "Deaktivovat" : "Aktivovat"}
                            >
                              <Power size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(user.id)}
                              className="w-10 h-10 flex items-center justify-center rounded-[8px] text-text-dim hover:text-ruby hover:bg-ruby/10 transition-colors"
                              title="Smazat"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
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
