import { Link } from "react-router-dom";
import { ScreenCard } from "../components/ScreenCard";
import { TaskPill } from "../components/TaskPill";
import { TimePanel } from "../components/TimePanel";
import { useAppData } from "../state/AppDataContext";
import { requestNotificationPermission } from "../lib/notifications";

const quickLinks = [
  { label: "My Day", to: "/orientation" },
  { label: "Conversation Notes", to: "/notes" },
  { label: "Caregiver Tools", to: "/caregiver" }
];

export function DashboardScreen() {
  const {
    enablePushNotifications,
    disablePushNotifications,
    nextTask,
    pushSubscription,
    status,
    profile
  } = useAppData();

  return (
    <div className="screen-grid">
      <ScreenCard accent="hero" title="Today" subtitle="One clear step at a time.">
        <TimePanel mode="hero" />
        <p className="support-copy">
          You are on track, {profile.full_name || "friend"}. Start with the next step below.
        </p>
        <div className="next-task-box">
          <span className="section-label">Next step</span>
          <TaskPill reminder={nextTask} />
        </div>
        <div className="button-grid">
          <Link className="primary-button" to="/reminders">
            See today&apos;s plan
          </Link>
          <Link className="secondary-button" to="/orientation">
            Open My Day
          </Link>
        </div>
      </ScreenCard>

      <ScreenCard
        title="Helpful tools"
        subtitle="Use these only when you need them."
        actions={
          <div className="card-actions">
            <button className="ghost-button" onClick={() => requestNotificationPermission()} type="button">
              Browser alerts
            </button>
            <button
              className="ghost-button"
              onClick={pushSubscription ? disablePushNotifications : enablePushNotifications}
              type="button"
            >
              {pushSubscription ? "Turn off device alerts" : "Enable device alerts"}
            </button>
          </div>
        }
      >
        <div className="button-grid button-grid-compact">
          {quickLinks.map((item) => (
            <Link className="secondary-button" key={item.label} to={item.to}>
              {item.label}
            </Link>
          ))}
          <Link className="secondary-button" to="/reminders">
            Add a reminder
          </Link>
        </div>
        <p className="status-text">{status}</p>
      </ScreenCard>
    </div>
  );
}
