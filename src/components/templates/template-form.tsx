"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  createTemplate,
  updateTemplate,
  type TemplateRow,
} from "@/app/actions/templates";

interface TemplateFormProps {
  open: boolean;
  onClose: () => void;
  editData?: TemplateRow | null;
}

const ALL_ROLES = [
  { value: "administrator", label: "Administrátor" },
  { value: "supervisor", label: "Supervizor" },
  { value: "broker", label: "Broker" },
];

export default function TemplateForm({
  open,
  onClose,
  editData,
}: TemplateFormProps) {
  const { toast } = useToast();
  const isEdit = !!editData;

  const [label, setLabel] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [allowedRoles, setAllowedRoles] = useState<string[]>([
    "administrator",
    "supervisor",
    "broker",
  ]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- intentional form reset on open */
  useEffect(() => {
    if (open) {
      setLabel(editData?.label ?? "");
      setSubject(editData?.subject ?? "");
      setBody(editData?.body ?? "");
      setAllowedRoles(
        editData?.allowedRoles ?? ["administrator", "supervisor", "broker"]
      );
      setError("");
    }
  }, [open, editData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function toggleRole(role: string) {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!label.trim()) {
      setError("Název šablony je povinný");
      return;
    }
    if (!subject.trim()) {
      setError("Předmět je povinný");
      return;
    }
    if (!body.trim()) {
      setError("Tělo šablony je povinné");
      return;
    }
    if (allowedRoles.length === 0) {
      setError("Vyberte alespoň jednu roli");
      return;
    }

    setSubmitting(true);

    const formData = { label, subject, body, allowedRoles };

    const result = isEdit
      ? await updateTemplate(editData!.id, formData)
      : await createTemplate(formData);

    setSubmitting(false);

    if (result.success) {
      toast(isEdit ? "Šablona upravena" : "Šablona vytvořena");
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
      title={isEdit ? "Upravit šablonu" : "Nová šablona"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Název šablony *
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder='Např: "Prezentace", "Follow-up"'
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            required
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Předmět emailu *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Předmět emailu"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            required
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Tělo šablony *
          </label>
          <p className="text-[10px] text-text-faint mb-1">
            Proměnné: [OSLOVENÍ], [PODPIS], [VKLAD], [CASTKA]
          </p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="Vážený/á [OSLOVENÍ],&#10;&#10;...&#10;&#10;[PODPIS]"
            className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition resize-none leading-relaxed"
            required
          />
        </div>

        {/* Allowed roles */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-2">
            Povolené role *
          </label>
          <div className="flex gap-2 flex-wrap">
            {ALL_ROLES.map((r) => {
              const isSelected = allowedRoles.includes(r.value);
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => toggleRole(r.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                    isSelected
                      ? "bg-gold text-white border-gold"
                      : "bg-surface-hover text-text-mid border-border hover:border-gold/30"
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
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
          {isEdit ? "Uložit změny" : "Vytvořit šablonu"}
        </button>
      </form>
    </Modal>
  );
}
