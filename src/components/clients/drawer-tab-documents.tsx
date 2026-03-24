"use client";

import { useState, useTransition, useRef } from "react";
import {
  Upload,
  FileText,
  Image,
  Trash2,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  getClientDocuments,
  uploadDocument,
  deleteDocument,
} from "@/app/actions/documents";
import type { DocumentRow } from "@/app/actions/documents";
import ConfirmDialog from "@/components/ui/confirm-dialog";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
  return FileText;
}

interface Props {
  clientId: string;
}

export default function DrawerTabDocuments({ clientId }: Props) {
  const { toast } = useToast();
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents on first render
  if (!loaded) {
    startTransition(async () => {
      const result = await getClientDocuments(clientId);
      setDocs(result);
      setLoaded(true);
    });
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    let hasError = false;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("clientId", clientId);
      formData.set("name", file.name);

      const result = await uploadDocument(formData);
      if (!result.success) {
        toast(result.error || "Chyba pri nahravani", "error");
        hasError = true;
      }
    }

    // Refresh list
    const updated = await getClientDocuments(clientId);
    setDocs(updated);
    setUploading(false);
    if (!hasError) toast("Dokument nahran");
  }

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteDocument(deleteId);
    if (result.success) {
      setDocs((prev) => prev.filter((d) => d.id !== deleteId));
      toast("Dokument smazan");
    } else {
      toast(result.error || "Chyba", "error");
    }
    setDeleteId(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-text-dim" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "border-2 border-dashed border-border rounded-[12px] p-6 text-center transition-colors",
          "hover:border-gold hover:bg-gold-pale/30 cursor-pointer"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        {uploading ? (
          <Loader2 size={24} className="mx-auto animate-spin text-gold mb-2" />
        ) : (
          <Upload size={24} className="mx-auto text-text-dim mb-2" />
        )}
        <p className="text-sm text-text-mid">
          {uploading ? "Nahravam..." : "Pretahnete soubor nebo kliknete"}
        </p>
        <p className="text-xs text-text-faint mt-1">
          PDF, DOC, DOCX, JPG, PNG (max 10MB)
        </p>
      </div>

      {/* Document list */}
      {docs.length === 0 ? (
        <div className="text-center py-8">
          <FileText size={32} className="mx-auto text-text-faint mb-2" />
          <p className="text-sm text-text-dim">Zadne dokumenty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => {
            const Icon = getIcon(doc.mimeType);
            const isImage = doc.mimeType.startsWith("image/");
            const isPdf = doc.mimeType === "application/pdf";

            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-[10px] bg-surface-hover hover:bg-border/30 transition-colors group"
              >
                <div className="w-9 h-9 rounded-[8px] bg-sapphire-pale flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-sapphire" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-text-dim">
                    {formatSize(doc.fileSize)} &middot; {doc.uploaderName} &middot;{" "}
                    {new Date(doc.createdAt).toLocaleDateString("cs-CZ")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {/* Preview/Open */}
                  {(isPdf || isImage) && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-[6px] hover:bg-sapphire-pale text-text-dim hover:text-sapphire transition-colors"
                      title="Otevrit"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {/* Download */}
                  <a
                    href={doc.fileUrl}
                    download={doc.name}
                    className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-[6px] hover:bg-emerald-pale text-text-dim hover:text-emerald transition-colors"
                    title="Stahnout"
                  >
                    <Download size={14} />
                  </a>
                  {/* Delete */}
                  <button
                    onClick={() => setDeleteId(doc.id)}
                    className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-[6px] hover:bg-ruby-pale text-text-dim hover:text-ruby transition-colors"
                    title="Smazat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Smazat dokument?"
        message="Tato akce je nevratna."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
