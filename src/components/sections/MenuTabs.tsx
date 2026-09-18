"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

interface MenuTabsProps {
  /** Only what the tab strip needs. The items themselves stay on the server. */
  categories: { id: string; label: string }[];
  /** Each category's panel contents, server-rendered, in the same order. */
  panels: ReactNode[];
}

export default function MenuTabs({ categories, panels }: MenuTabsProps) {
  const [active, setActive] = useState(categories[0].id);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // Left and right move between tabs and wrap around, which is what a tablist is
  // expected to do once it announces itself as one.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (index + step + categories.length) % categories.length;
    setActive(categories[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <>
      <div className="menu__tabs" role="tablist" aria-label="Menu sections">
        {categories.map((category, index) => (
          <button
            key={category.id}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            className={active === category.id ? "menu__tab is-active" : "menu__tab"}
            role="tab"
            aria-selected={active === category.id}
            data-tab={category.id}
            onClick={() => setActive(category.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {categories.map((category, index) => (
        <div
          key={category.id}
          className={active === category.id ? "menu__panel is-active" : "menu__panel"}
          data-panel={category.id}
        >
          {panels[index]}
        </div>
      ))}
    </>
  );
}
