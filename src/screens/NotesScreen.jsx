import { useState } from "react";
import { ScreenCard } from "../components/ScreenCard";
import { formatShortDateTime } from "../lib/date";
import { useAppData } from "../state/AppDataContext";

export function NotesScreen() {
  const [content, setContent] = useState("");
  const { addNote, notes } = useAppData();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }

    await addNote(content.trim());
    setContent("");
  }

  return (
    <div className="screen-grid">
      <ScreenCard title="Conversation notes" subtitle="Add a quick memory right after a talk.">
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Quick note
            <textarea
              className="text-input text-area"
              onChange={(event) => setContent(event.target.value)}
              placeholder="Spoke with Dr. Lee about next Tuesday."
              rows="4"
              value={content}
            />
          </label>
          <button className="primary-button" type="submit">
            Save note
          </button>
        </form>
      </ScreenCard>

      <ScreenCard title="Recent notes">
        <div className="notes-list">
          {notes.map((note) => (
            <article className="note-item" key={note.id}>
              <p>{note.content}</p>
              <span>{formatShortDateTime(note.created_at)}</span>
            </article>
          ))}
        </div>
      </ScreenCard>
    </div>
  );
}
