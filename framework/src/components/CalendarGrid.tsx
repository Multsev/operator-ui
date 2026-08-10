import { useMemo, type ReactNode } from "react";

const key = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function CalendarGrid({
  month,
  selected,
  onSelect,
  firstDayOfWeek = 1,
  eventDates = [],
  renderCell,
  onMonthChange,
}: {
  month: Date;
  selected: Date;
  onSelect: (date: Date) => void;
  firstDayOfWeek?: 0 | 1 | 6;
  eventDates?: readonly string[];
  renderCell?: (date: Date) => ReactNode;
  onMonthChange?: (month: Date) => void;
}) {
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() - firstDayOfWeek + 7) % 7;
    return Array.from(
      { length: 42 },
      (_, index) => new Date(first.getFullYear(), first.getMonth(), 1 - offset + index),
    );
  }, [firstDayOfWeek, month]);
  const today = key(new Date());
  const selectedKey = key(selected);
  const labels = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(
      new Date(2024, 0, 7 + firstDayOfWeek + index),
    ),
  );
  const move = (date: Date, amount: number) => {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
    onSelect(next);
    if (next.getMonth() !== month.getMonth())
      onMonthChange?.(new Date(next.getFullYear(), next.getMonth(), 1));
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLButtonElement>(`[data-calendar-date="${key(next)}"]`)
        ?.focus(),
    );
  };
  return (
    <div
      className="ou-calendar"
      role="grid"
      aria-label={new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
      }).format(month)}
    >
      <div className="ou-calendar-weekdays" role="row">
        {labels.map((label) => (
          <span role="columnheader" key={label}>
            {label}
          </span>
        ))}
      </div>
      <div className="ou-calendar-days">
        {days.map((date) => {
          const dateKey = key(date);
          return (
            <button
              key={dateKey}
              data-calendar-date={dateKey}
              role="gridcell"
              aria-selected={selectedKey === dateKey}
              className={`${date.getMonth() !== month.getMonth() ? "is-outside" : ""} ${dateKey === today ? "is-today" : ""}`}
              tabIndex={selectedKey === dateKey ? 0 : -1}
              onClick={() => onSelect(date)}
              onKeyDown={(event) => {
                const delta =
                  event.key === "ArrowLeft"
                    ? -1
                    : event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowUp"
                        ? -7
                        : event.key === "ArrowDown"
                          ? 7
                          : 0;
                if (delta) {
                  event.preventDefault();
                  move(date, delta);
                }
                if (event.key === "PageUp" || event.key === "PageDown") {
                  event.preventDefault();
                  const next = new Date(
                    month.getFullYear(),
                    month.getMonth() + (event.key === "PageUp" ? -1 : 1),
                    Math.min(date.getDate(), 28),
                  );
                  onMonthChange?.(
                    new Date(next.getFullYear(), next.getMonth(), 1),
                  );
                  onSelect(next);
                }
              }}
            >
              <span>{date.getDate()}</span>
              {eventDates.includes(dateKey) && <i aria-label="Has events" />}
              {renderCell?.(date)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
