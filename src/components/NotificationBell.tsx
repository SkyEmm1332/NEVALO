"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationItem = {
  id: string;
  type: "REVIEW" | "SYSTEM";
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

function formatRelative(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function NotificationBell() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/company/notifications")
      .then((response) => response.json())
      .then((data: { unread: number; items: NotificationItem[] }) => {
        if (!active) return;
        setUnread(data.unread ?? 0);
        setItems(data.items ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (open && !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function markAllRead() {
    await fetch("/api/company/notifications/read", { method: "POST" }).catch(
      () => {},
    );
    setItems((current) =>
      current.map((item) => ({ ...item, readAt: new Date().toISOString() })),
    );
    setUnread(0);
  }

  async function markRead(id: string) {
    await fetch("/api/company/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  async function openItem(item: NotificationItem) {
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry,
      ),
    );
    setUnread((count) => Math.max(0, count - (item.readAt ? 0 : 1)));
    setOpen(false);
    await markRead(item.id);
    if (item.link) router.push(item.link);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-16 w-16 items-center justify-center text-sm font-semibold text-paper transition hover:bg-white/10 hover:text-white"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-6 w-6"
        >
          <path
            d="M5.5 8.25a4.5 4.5 0 0 1 9 0c0 2.1.6 3.2 1.25 4H4.25c.65-.8 1.25-1.9 1.25-4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M8.25 15a1.75 1.75 0 0 0 3.5 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {unread > 0 ? (
          <span className="absolute right-0.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 font-mono text-[10px] font-bold text-ink">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-lift">
          <div className="flex items-center justify-between border-b border-line bg-paper/60 px-4 py-3">
            <span className="font-semibold text-ink">Notifications</span>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="font-mono text-xs text-accent transition hover:text-accent-deep"
              >
                Tout marquer comme lu
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              Aucune notification.
            </p>
          ) : (
            <ul className="max-h-96 overflow-auto">
              {items.map((item) => {
                const inner = (
                  <div className="flex gap-3 px-4 py-3 transition hover:bg-paper">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        item.readAt ? "bg-line-strong" : "bg-accent"
                      }`}
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          item.readAt ? "text-soft" : "text-ink"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                        {item.message}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">
                        {formatRelative(item.createdAt)}
                      </p>
                    </div>
                  </div>
                );

                return (
                  <li
                    key={item.id}
                    className={item.readAt ? "" : "bg-accent/5"}
                  >
                    {item.link ? (
                      <button
                        type="button"
                        onClick={() => openItem(item)}
                        className="block w-full text-left"
                      >
                        {inner}
                      </button>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
