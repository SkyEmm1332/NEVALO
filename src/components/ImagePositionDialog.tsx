"use client";

import { useRef, useState } from "react";

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function parsePosition(position: string | null | undefined) {
  const match = /(\d{1,3})%\s+(\d{1,3})%/.exec(position ?? "");
  const x = match ? Number(match[1]) : 50;
  const y = match ? Number(match[2]) : 50;
  return { x: clamp(x), y: clamp(y) };
}

export function ImagePositionDialog({
  open,
  title,
  aspect,
  imageSrc,
  initialPosition,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  aspect: string;
  imageSrc: string;
  initialPosition: string | null | undefined;
  onCancel: () => void;
  onConfirm: (position: string) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(parsePosition(initialPosition));
  const draggingRef = useRef(false);

  if (!open) return null;

  function updateFromPointer(clientX: number, clientY: number) {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: clamp(((clientX - rect.left) / rect.width) * 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-line bg-surface p-5 shadow-lift">
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs text-muted">
          Déplacez l&apos;image ou utilisez les curseurs pour ajuster la
          position.
        </p>

        <div
          ref={viewportRef}
          onPointerDown={(event) => {
            draggingRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            updateFromPointer(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (draggingRef.current) {
              updateFromPointer(event.clientX, event.clientY);
            }
          }}
          onPointerUp={() => {
            draggingRef.current = false;
          }}
          onPointerCancel={() => {
            draggingRef.current = false;
          }}
          className="mt-4 w-full cursor-move touch-none overflow-hidden rounded-lg bg-black"
          style={{ aspectRatio: aspect }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            draggable={false}
            className="h-full w-full select-none object-cover"
            style={{
              objectPosition: `${position.x}% ${position.y}%`,
              pointerEvents: "none",
            }}
          />
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
              Horizontal
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={position.x}
              onChange={(event) =>
                setPosition((current) => ({
                  ...current,
                  x: Number(event.target.value),
                }))
              }
              className="mt-1 w-full accent-accent"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
              Vertical
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={position.y}
              onChange={(event) =>
                setPosition((current) => ({
                  ...current,
                  y: Number(event.target.value),
                }))
              }
              className="mt-1 w-full accent-accent"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onConfirm(`${position.x}% ${position.y}%`)}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}
