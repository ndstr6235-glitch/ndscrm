"use client";

import { useState } from "react";
import { Pencil, Trash2, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { deleteTemplate, type TemplateRow } from "@/app/actions/templates";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const ROLE_LABELS: Record<string, string> = {
  administrator: "Admin",
  supervisor: "Supervizor",
  broker: "Broker",
};

// Detect variables in template body
function extractVariables(body: string): string[] {
  const matches = body.match(/\[[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+\]/g);
  return matches ? [...new Set(matches)] : [];
}

interface TemplateCardProps {
  template: TemplateRow;
  onEdit: (template: TemplateRow) => void;
}

export default function TemplateCard({ template, onEdit }: TemplateCardProps) {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const variables = extractVariables(template.body);

  async function handleDelete() {
    const result = await deleteTemplate(template.id);
    if (result.success) {
      toast("Šablona smazána");
    } else {
      toast(result.error || "Nepodařilo se smazat", "error");
    }
    setShowDeleteConfirm(false);
  }

  return (
    <>
      <div className="bg-surface rounded-[16px] border border-border p-4 space-y-3 hover:shadow-md transition-shadow">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text truncate">
              {template.label}
            </h3>
            <p className="text-xs text-text-dim truncate mt-0.5">
              {template.subject}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(template)}
              className="w-8 h-8 flex items-center justify-center rounded-[8px] text-text-dim hover:text-gold hover:bg-gold/10 transition-colors"
              title="Upravit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-8 h-8 flex items-center justify-center rounded-[8px] text-text-dim hover:text-ruby hover:bg-ruby/10 transition-colors"
              title="Smazat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Body preview */}
        <p className="text-xs text-text-mid line-clamp-3 leading-relaxed">
          {template.body}
        </p>

        {/* Variables */}
        {variables.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Code size={12} className="text-text-faint shrink-0" />
            {variables.map((v) => (
              <span
                key={v}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gold-pale text-gold border border-gold-border"
              >
                {v}
              </span>
            ))}
          </div>
        )}

        {/* Role pills */}
        <div className="flex gap-1.5 flex-wrap">
          {template.allowedRoles.map((role) => (
            <span
              key={role}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium",
                role === "administrator"
                  ? "bg-ruby/10 text-ruby"
                  : role === "supervisor"
                    ? "bg-gold/10 text-gold"
                    : "bg-sapphire/10 text-sapphire"
              )}
            >
              {ROLE_LABELS[role] || role}
            </span>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Smazat šablonu?"
        message={`Opravdu chcete smazat šablonu "${template.label}"? Tato akce je nevratná.`}
        confirmLabel="Smazat"
        destructive
      />
    </>
  );
}
