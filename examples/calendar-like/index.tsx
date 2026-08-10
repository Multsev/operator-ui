import { useState } from "react";
import { CalendarGrid, Inspector, SplitView } from "../../framework/src/index.ts";

export function CalendarLikeExample() {
  const [month, setMonth] = useState(new Date(2026, 7, 1));
  const [selected, setSelected] = useState(new Date(2026, 7, 10));
  return <SplitView initial={72} first={
    <CalendarGrid month={month} selected={selected} onSelect={setSelected} onMonthChange={setMonth} eventDates={["2026-08-10", "2026-08-14"]} />
  } second={
    <Inspector title={selected.toLocaleDateString()} metadata={[{ label: "Events", value: "2" }]}>Select an event to inspect it.</Inspector>
  } />;
}
