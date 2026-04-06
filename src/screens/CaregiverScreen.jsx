import { useState } from "react";
import { ScreenCard } from "../components/ScreenCard";
import { ReminderForm } from "../components/ReminderForm";
import { formatShortDateTime } from "../lib/date";
import { useAppData } from "../state/AppDataContext";

export function CaregiverScreen() {
  const [inviteCode, setInviteCode] = useState("");
  const {
    addReminder,
    createCaregiverInvite,
    invites,
    joinHousehold,
    profile,
    setProfile,
    session,
    status
  } = useAppData();

  async function handleJoin(event) {
    event.preventDefault();
    const joined = await joinHousehold(inviteCode);
    if (joined) {
      setInviteCode("");
    }
  }

  return (
    <div className="screen-grid">
      <ScreenCard title="Caregiver access" subtitle="Shared task list and shared reminders.">
        <div className="role-switch">
          <button
            className={profile.role === "survivor" ? "ghost-button active-chip" : "ghost-button"}
            onClick={() => setProfile((current) => ({ ...current, role: "survivor" }))}
          >
            Survivor view
          </button>
          <button
            className={profile.role === "caregiver" ? "ghost-button active-chip" : "ghost-button"}
            onClick={() => setProfile((current) => ({ ...current, role: "caregiver" }))}
          >
            Caregiver view
          </button>
        </div>
        <p className="status-text">
          {session
            ? "Signed in. Caregivers can add reminders for the shared plan."
            : "In demo mode, role switching previews caregiver actions locally."}
        </p>
        <p className="status-text">Household code: {profile.linked_household}</p>
      </ScreenCard>

      <ScreenCard title="Add reminder for shared task list">
        <ReminderForm onSubmit={addReminder} buttonLabel="Add for shared list" />
      </ScreenCard>

      <ScreenCard
        title="Invite a caregiver"
        subtitle="Create one short code and share it by phone or text."
        actions={
          <button className="ghost-button" onClick={createCaregiverInvite}>
            Create code
          </button>
        }
      >
        <div className="notes-list">
          {invites.length ? (
            invites.slice(0, 3).map((invite) => (
              <article className="note-item" key={invite.id}>
                <p>
                  <strong>{invite.invite_code}</strong>
                </p>
                <span>
                  Created {formatShortDateTime(invite.created_at)}
                  {invite.used_at ? ` • Used ${formatShortDateTime(invite.used_at)}` : " • Unused"}
                </span>
              </article>
            ))
          ) : (
            <p className="status-text">No invite codes yet.</p>
          )}
        </div>
      </ScreenCard>

      <ScreenCard title="Join with a caregiver code" subtitle="Caregiver enters the shared code here.">
        <form className="stack-form" onSubmit={handleJoin}>
          <label>
            Invite code
            <input
              className="text-input"
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="AB12CD"
              value={inviteCode}
            />
          </label>
          <button className="primary-button" type="submit">
            Join household
          </button>
        </form>
        <p className="status-text">{status}</p>
      </ScreenCard>
    </div>
  );
}
