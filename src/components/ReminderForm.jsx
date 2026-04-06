import { useState } from "react";

const categories = ["Medication", "Appointment", "Daily task"];
const scheduleOptions = [
  { id: "soon", label: "In 1 hour" },
  { id: "afternoon", label: "This afternoon" },
  { id: "evening", label: "This evening" },
  { id: "tomorrow-morning", label: "Tomorrow morning" },
  { id: "custom", label: "Pick date and time" }
];

function nextFutureTime(hour, minute = 0, dayOffset = 0) {
  const now = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() + dayOffset);
  target.setHours(hour, minute, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

function resolveScheduledTime(scheduleChoice, customValue) {
  if (scheduleChoice === "soon") {
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  if (scheduleChoice === "afternoon") {
    return nextFutureTime(14);
  }

  if (scheduleChoice === "evening") {
    return nextFutureTime(18);
  }

  if (scheduleChoice === "tomorrow-morning") {
    return nextFutureTime(9, 0, 1);
  }

  if (scheduleChoice === "custom" && customValue) {
    return new Date(customValue);
  }

  return null;
}

export function ReminderForm({ onSubmit, buttonLabel = "Save reminder" }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [scheduleChoice, setScheduleChoice] = useState(scheduleOptions[0].id);
  const [customScheduledFor, setCustomScheduledFor] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const scheduledFor = resolveScheduledTime(scheduleChoice, customScheduledFor);

    if (!trimmedTitle || !scheduledFor || Number.isNaN(scheduledFor.getTime())) {
      return;
    }

    onSubmit({
      title: trimmedTitle,
      category,
      scheduled_for: scheduledFor.toISOString()
    });
    setTitle("");
    setCategory(categories[0]);
    setScheduleChoice(scheduleOptions[0].id);
    setCustomScheduledFor("");
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      <label>
        What do you need to remember?
        <input
          aria-label="Reminder title"
          className="text-input"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Take blood pressure pill"
          value={title}
        />
      </label>

      <label>
        Type
        <select
          className="text-input"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label>
        When should this happen?
        <div className="choice-grid" role="radiogroup" aria-label="Reminder time">
          {scheduleOptions.map((option) => (
            <button
              key={option.id}
              aria-checked={scheduleChoice === option.id}
              className={scheduleChoice === option.id ? "choice-chip choice-chip-active" : "choice-chip"}
              onClick={() => setScheduleChoice(option.id)}
              role="radio"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </label>

      {scheduleChoice === "custom" ? (
        <label>
          Pick date and time
          <input
            aria-label="Reminder time"
            className="text-input"
            onChange={(event) => setCustomScheduledFor(event.target.value)}
            type="datetime-local"
            value={customScheduledFor}
          />
        </label>
      ) : null}

      <button className="primary-button" type="submit">
        {buttonLabel}
      </button>
    </form>
  );
}
