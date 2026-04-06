import { ScreenCard } from "../components/ScreenCard";
import { TaskPill } from "../components/TaskPill";
import { TimePanel } from "../components/TimePanel";
import { useAppData } from "../state/AppDataContext";

export function OrientationScreen() {
  const { lastCompletedTask, nextTask } = useAppData();

  return (
    <div className="screen-grid">
      <ScreenCard accent="hero" title="Where am I in my day?">
        <TimePanel mode="hero" />
      </ScreenCard>

      <ScreenCard title="Last completed task">
        <TaskPill reminder={lastCompletedTask} />
      </ScreenCard>

      <ScreenCard title="Next scheduled activity">
        <TaskPill reminder={nextTask} />
      </ScreenCard>
    </div>
  );
}
