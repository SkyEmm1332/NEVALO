"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  label: string;
};

export function ScrollSpyNav({
  items,
  ariaLabel,
  className = "",
}: {
  items: Item[];
  ariaLabel: string;
  className?: string;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const offset = 128;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      if (atBottom) {
        setActiveId(elements[elements.length - 1].id);
        return;
      }

      let nextId = elements[0].id;

      for (const element of elements) {
        if (element.getBoundingClientRect().top <= offset) {
          nextId = element.id;
        } else {
          break;
        }
      }

      setActiveId(nextId);
    };

    const onScroll = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <nav aria-label={ariaLabel} className={className}>
      {items.map((item, index) => {
        const isActive = item.id === activeId;

        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={isActive ? "location" : undefined}
            onClick={() => setActiveId(item.id)}
            className={`flex items-baseline gap-3 border-l-2 py-1.5 pl-3 text-sm transition ${
              isActive
                ? "border-accent text-accent"
                : "border-line text-soft hover:border-accent hover:text-accent"
            }`}
          >
            <span
              className={`font-mono text-[11px] ${
                isActive ? "text-accent" : "text-muted"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
