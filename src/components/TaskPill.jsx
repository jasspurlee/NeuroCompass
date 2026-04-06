import { formatShortDateTime } from "../lib/date";

export function TaskPill({ reminder }) {
  if (!reminder) {
    return <div className="task-pill">No task scheduled.</div>;
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
