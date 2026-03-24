"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import TemplateCard from "./template-card";
import TemplateForm from "./template-form";
import type { TemplateRow } from "@/app/actions/templates";

interface TemplatesPageClientProps {
  templates: TemplateRow[];
}

export default function TemplatesPageClient({
  templates,
}: TemplatesPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState<TemplateRow | null>(null);

  function handleEdit(template: TemplateRow) {
    setEditTemplate(template);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditTemplate(null);
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-text">
            Šablony emailů
          </h1>
          <p className="mt-0.5 text-sm text-text-mid">
            {templates.length}{" "}
            {templates.length === 1
              ? "šablona"
              : templates.length < 5
                ? "šablony"
                : "šablon"}
          </p>
        </div>
        <button
          onClick={() => {
            setEditTemplate(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nová šablona</span>
        </button>
      </div>

      {/* Content */}
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4">
            <FileText size={24} className="text-gold" />
          </div>
          <h3 className="font-display text-base font-semibold text-text mb-1">
            Žádné šablony
          </h3>
          <p className="text-sm text-text-dim max-w-xs">
            Zatím nemáte žádné emailové šablony. Vytvořte první.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Template form modal */}
      <TemplateForm
        open={showForm}
        onClose={handleCloseForm}
        editData={editTemplate}
      />
    </div>
  );
}
