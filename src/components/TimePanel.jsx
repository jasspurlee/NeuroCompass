import { useEffect, useState } from "react";
import { formatClock, formatLongDate } from "../lib/date";

export function TimePanel({ mode = "compact" }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000 * 30);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={mode === "hero" ? "time-panel time-panel-hero" : "time-panel"}>
      <span className="time-label">{mode === "hero" ? "Current time" : "Now"}</span>
      <strong>{formatClock(now)}</strong>
      <span>{formatLongDate(now)}</span>
    </div>
  );
}
