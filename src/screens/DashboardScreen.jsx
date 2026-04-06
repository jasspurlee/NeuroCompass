import { Link } from "react-router-dom";
import { ScreenCard } from "../components/ScreenCard";
import { TaskPill } from "../components/TaskPill";
import { TimePanel } from "../components/TimePanel";
import { ReminderForm } from "../components/ReminderForm";
import { useAppData } from "../state/AppDataContext";
import { requestNotificationPermission } from "../lib/notifications";

const quickLinks = [
  { label: "Today's Plan", to: "/reminders" },
  { label: "Add Reminder", to: "/reminders" },
  { label: "Conversation Notes", to: "/notes" },
  { label: "Where Am I In My Day?", to: "/orientation" }
];

export function DashboardScreen() {
  const {
    addReminder,
    enablePushNotifications,
    disablePushNotifications,
    nextTask,
    pushSubscription,
    status
  } = useAppData();

  return (
    <div className="screen-grid">
      <ScreenCard accent="hero" title="Home Dashboard" subtitle="Simple steps for today.">
        <TimePanel />
        <div className="next-task-box">
          <span className="section-label">Next task</span>
          <TaskPill reminder={nextTask} />
        </div>
        <div className="button-grid">
          {quickLinks.map((item) => (
            <Link className="primary-button secondary-button" key={item.label} to={item.to}>
              {item.label}
            </Link>
          ))}
        </div>
      </ScreenCard>

      <ScreenCard
        title="Add a reminder"
        subtitle="Medication, appointment, or a daily task."
        actions={
          <div className="card-actions">
            <button className="ghost-button" onClick={() => requestNotificationPermission()}>
              Browser alerts
            </button>
            <button
              className="ghost-button"
              onClick={pushSubscription ? disablePushNotifications : enablePushNotifications}
            >
              {pushSubscription ? "Turn off device alerts" : "Enable device alerts"}
            </button>
          </div>
        }
      >
        <ReminderForm onSubmit={addReminder} />
        <p className="status-text">{status}</p>
      </ScreenCard>
    </div>
  );
}
