import { ScreenCard } from "../components/ScreenCard";
import { TaskPill } from "../components/TaskPill";
import { TimePanel } from "../components/TimePanel";
import { useAppData } from "../state/AppDataContext";
import { formatLongDate } from "../lib/date";

export function OrientationScreen() {
  const { lastCompletedTask, nextTask, profile } = useAppData();
  const today = new Date();

  return (
    <div className="screen-grid">
      <ScreenCard accent="hero" title="My Day" subtitle="Pause here whenever you need to reset.">
        <TimePanel mode="hero" />
        <div className="orientation-summary">
          <p>
            <strong>Today is {formatLongDate(today)}.</strong>
          </p>
          <p>You are using NeuroCompass to follow one simple step at a time.</p>
          <p>
            Shared plan: {profile.linked_household} {profile.role === "caregiver" ? "caregiver view" : "survivor view"}.
          </p>
        </div>
      </ScreenCard>

      <ScreenCard title="Next step">
        <TaskPill reminder={nextTask} emptyLabel="Nothing else is scheduled right now." />
      </ScreenCard>

      <ScreenCard title="Last finished">
        <TaskPill reminder={lastCompletedTask} />
      </ScreenCard>

      <ScreenCard title="What to do now">
        <div className="orientation-summary">
          <p>Take a slow breath.</p>
          <p>Check the next step above.</p>
          <p>If you need help, open Caregiver tools or ask your support person.</p>
        </div>
      </ScreenCard>
    </div>
  );
}
