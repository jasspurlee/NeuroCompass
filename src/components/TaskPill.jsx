import { formatShortDateTime } from "../lib/date";

export function TaskPill({ reminder, emptyLabel = "No task scheduled." }) {
  if (!reminder) {
    return <div className="task-pill">{emptyLabel}</div>;
  }

  return (
    <div className="task-pill">
      <strong>{reminder.title}</strong>
      <span>
        {reminder.category} • {formatShortDateTime(reminder.scheduled_for)}
      </span>
    </div>
  );
}
