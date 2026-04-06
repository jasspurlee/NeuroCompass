import { ScreenCard } from "../components/ScreenCard";
import { ReminderForm } from "../components/ReminderForm";
import { formatShortDateTime } from "../lib/date";
import { useAppData } from "../state/AppDataContext";

export function RemindersScreen() {
  const { addReminder, completeReminder, reminders } = useAppData();

  return (
    <div className="screen-grid">
      <ScreenCard title="Today's plan" subtitle="Large, clear reminders in time order.">
        <div className="reminder-list">
          {reminders.map((reminder) => (
            <article className="reminder-item" key={reminder.id}>
              <div>
                <h3>{reminder.title}</h3>
                <p>
                  {reminder.category} • {formatShortDateTime(reminder.scheduled_for)}
                </p>
                <p className="meta-text">Added by {reminder.created_by}</p>
              </div>
              <button
                className="primary-button"
                disabled={reminder.completed}
                onClick={() => completeReminder(reminder.id)}
              >
                {reminder.completed ? "Done" : "Mark done"}
              </button>
            </article>
          ))}
        </div>
      </ScreenCard>

      <ScreenCard title="New reminder" subtitle="Keep text short and specific.">
        <ReminderForm onSubmit={addReminder} />
      </ScreenCard>
    </div>
  );
}
