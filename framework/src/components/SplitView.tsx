import { useEffect, useState, type ReactNode } from "react";
import { frameworkPersistence } from "../framework";

export function SplitView({
  first,
  second,
  orientation = "vertical",
  initial = 36,
  min = 20,
  max = 78,
  storageKey,
  label = "Resize panes",
}: {
  first: ReactNode;
  second: ReactNode;
  orientation?: "vertical" | "horizontal";
  initial?: number;
  min?: number;
  max?: number;
  storageKey?: string;
  label?: string;
}) {
  const clamp = (value: number) => Math.max(min, Math.min(max, value));
  const [ratio, setRatio] = useState(() =>
    clamp(
      storageKey
        ? frameworkPersistence.get(`${storageKey}:split`, initial)
        : initial,
    ),
  );
  useEffect(() => {
    if (storageKey) frameworkPersistence.set(`${storageKey}:split`, ratio);
  }, [ratio, storageKey]);
  const horizontal = orientation === "horizontal";
  const style = horizontal
    ? { gridTemplateRows: `${ratio}% 7px minmax(0, 1fr)` }
    : { gridTemplateColumns: `${ratio}% 7px minmax(0, 1fr)` };
  return (
    <div className={`ou-split-view is-${orientation}`} style={style}>
      <div className="ou-split-pane">{first}</div>
      <div
        className="ou-split-handle"
        role="separator"
        aria-label={label}
        aria-orientation={orientation}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(ratio)}
        tabIndex={0}
        onKeyDown={(event) => {
          const decrease = horizontal
            ? event.key === "ArrowUp"
            : event.key === "ArrowLeft";
          const increase = horizontal
            ? event.key === "ArrowDown"
            : event.key === "ArrowRight";
          if (decrease || increase) {
            event.preventDefault();
            setRatio((value) => clamp(value + (increase ? 2 : -2)));
          }
        }}
        onPointerDown={(event) => {
          const root = event.currentTarget.parentElement;
          if (!root) return;
          const startPointer = horizontal ? event.clientY : event.clientX;
          const start = ratio;
          const bounds = root.getBoundingClientRect();
          const available = horizontal ? bounds.height : bounds.width;
          const move = (next: PointerEvent) =>
            setRatio(
              clamp(
                start +
                  (((horizontal ? next.clientY : next.clientX) - startPointer) /
                    available) *
                    100,
              ),
            );
          const stop = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", stop);
            window.removeEventListener("pointercancel", stop);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", stop);
          window.addEventListener("pointercancel", stop);
        }}
      />
      <div className="ou-split-pane">{second}</div>
    </div>
  );
}
