"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { createUser, updateUser, type UserRow } from "@/app/actions/users";

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  editData?: UserRow | null;
}

const ROLES = [
  { value: "administrator", label: "Administrátor" },
  { value: "supervisor", label: "Supervizor" },
  { value: "broker", label: "Broker" },
];

export default function UserForm({ open, onClose, editData }: UserFormProps) {
  const { toast } = useToast();
  const isEdit = !!editData;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("broker");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- intentional form reset on open */
  useEffect(() => {
    if (open) {
      setFirstName(editData?.firstName ?? "");
      setLastName(editData?.lastName ?? "");
      setEmail(editData?.email ?? "");
      setPassword("");
      setRole(editData?.role ?? "broker");
      setError("");
    }
  }, [open, editData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Jméno a příjmení jsou povinné");
      return;
    }
    if (!email.trim()) {
      setError("Email je povinný");
      return;
    }
    if (!isEdit && !password.trim()) {
      setError("Heslo je povinné");
      return;
    }

    setSubmitting(true);

    const result = isEdit
      ? await updateUser(editData!.id, {
          firstName,
          lastName,
          email,
          role,
          password: password || undefined,
        })
      : await createUser({
          firstName,
          lastName,
          email,
          password,
          role,
        });

    setSubmitting(false);

    if (result.success) {
      toast(isEdit ? "Uživatel upraven" : "Uživatel vytvořen");
      onClose();
    } else {
      toast(result.error || "Nepodařilo se uložit", "error");
      setError(result.error || "Nastala chyba");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Upravit uživatele" : "Nový uživatel"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Jméno *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Příjmení *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@buildfund.cz"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Heslo {isEdit ? "(ponechte prázdné pro zachování)" : "*"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? "••••••••" : "Zadejte heslo"}
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            required={!isEdit}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-ruby bg-ruby-pale border border-ruby-border rounded-[8px] px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Uložit změny" : "Vytvořit uživatele"}
        </button>
      </form>
    </Modal>
  );
}
