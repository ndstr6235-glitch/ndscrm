"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import UsersTable from "./users-table";
import UsersCards from "./users-cards";
import UserForm from "./user-form";
import type { UserRow } from "@/app/actions/users";

interface UsersPageClientProps {
  users: UserRow[];
  isAdmin: boolean;
  currentUserId: string;
}

export default function UsersPageClient({
  users,
  isAdmin,
  currentUserId,
}: UsersPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);

  function handleEdit(user: UserRow) {
    setEditUser(user);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditUser(null);
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-text">
            Uživatelé
          </h1>
          <p className="mt-0.5 text-sm text-text-mid">
            {users.length}{" "}
            {users.length === 1
              ? "uživatel"
              : users.length < 5
                ? "uživatelé"
                : "uživatelů"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditUser(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Přidat uživatele</span>
          </button>
        )}
      </div>

      {/* Desktop table */}
      <UsersTable
        users={users}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        onEdit={handleEdit}
      />

      {/* Mobile cards */}
      <UsersCards
        users={users}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        onEdit={handleEdit}
      />

      {/* User form modal */}
      {isAdmin && (
        <UserForm
          open={showForm}
          onClose={handleCloseForm}
          editData={editUser}
        />
      )}
    </div>
  );
}
