import { useState } from "react";

const categories = ["Medication", "Appointment", "Daily task"];

export function ReminderForm({ onSubmit, buttonLabel = "Save reminder" }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [scheduledFor, setScheduledFor] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!title || !scheduledFor) {
      return;
    }

    onSubmit({
      title,
      category,
      scheduled_for: new Date(scheduledFor).toISOString()
    });
    setTitle("");
    setCategory(categories[0]);
    setScheduledFor("");
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      <label>
        Reminder
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
        Time
        <input
          aria-label="Reminder time"
          className="text-input"
          onChange={(event) => setScheduledFor(event.target.value)}
          type="datetime-local"
          value={scheduledFor}
        />
      </label>

      <button className="primary-button" type="submit">
        {buttonLabel}
      </button>
    </form>
  );
}
