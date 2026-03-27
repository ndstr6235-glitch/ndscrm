"use client";

import { useState, useTransition, useRef } from "react";
import { fmtCZK } from "@/lib/utils";
import { PIPELINE_STAGES, SCORE_META } from "@/lib/constants";
import { updateClientStage } from "@/app/actions/clients";
import type { PipelineClient } from "@/app/actions/clients";

interface Props {
  clients: PipelineClient[];
  onSelectClient?: (id: string) => void;
}

export default function PipelineBoard({ clients: initial, onSelectClient }: Props) {
  const [clients, setClients] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dragOverStage = useRef<string | null>(null);

  function handleDragStart(clientId: string) {
    setDragging(clientId);
  }

  function handleDragOver(e: React.DragEvent, stageKey: string) {
    e.preventDefault();
    dragOverStage.current = stageKey;
  }

  function handleDrop(stageKey: string) {
    if (!dragging) return;
    const client = clients.find((c) => c.id === dragging);
    if (!client || client.stage === stageKey) {
      setDragging(null);
      return;
    }

    // Optimistic update
    setClients((prev) =>
      prev.map((c) => (c.id === dragging ? { ...c, stage: stageKey } : c))
    );
    setDragging(null);

    startTransition(async () => {
      await updateClientStage(dragging, stageKey);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:overflow-x-auto pb-4 sm:snap-x sm:snap-mandatory md:snap-none">
      {PIPELINE_STAGES.map((stage) => {
        const stageClients = clients.filter((c) => c.stage === stage.key);
        return (
          <div
            key={stage.key}
            className="flex-shrink-0 w-full sm:w-[260px] md:w-[240px] lg:flex-1 sm:snap-start"
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDrop={() => handleDrop(stage.key)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <h3 className="text-sm font-semibold text-text">{stage.label}</h3>
              <span className="text-xs text-text-dim bg-surface-hover rounded-full px-2 py-0.5">
                {stageClients.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[100px] p-2 rounded-[12px] bg-surface-hover/50 border border-border/50 transition-colors">
              {stageClients.length === 0 && (
                <p className="text-xs text-text-faint text-center py-6">
                  Prazdne
                </p>
              )}
              {stageClients.map((client) => {
                const scoreMeta = SCORE_META[client.score];
                return (
                  <div
                    key={client.id}
                    draggable
                    onDragStart={() => handleDragStart(client.id)}
                    onClick={() => onSelectClient?.(client.id)}
                    className={`bg-surface rounded-[10px] border border-border p-3 cursor-pointer hover:shadow-card transition-all ${
                      dragging === client.id ? "opacity-40" : ""
                    } ${isPending ? "pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {/* Score badge */}
                      <span
                        className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: scoreMeta.pale,
                          color: scoreMeta.color,
                        }}
                      >
                        {client.score}
                      </span>
                      <p className="text-sm font-medium text-text truncate flex-1">
                        {client.firstName} {client.lastName}
                      </p>
                    </div>
                    {client.totalDeposit > 0 && (
                      <p className="text-xs text-emerald font-medium">
                        {fmtCZK(client.totalDeposit)}
                      </p>
                    )}
                    <p className="text-[10px] text-text-dim mt-1 truncate">
                      {client.brokerName}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
