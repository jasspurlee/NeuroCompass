import { useState } from "react";
import { ScreenCard } from "../components/ScreenCard";
import { useAppData } from "../state/AppDataContext";

export function AuthScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [role, setRole] = useState("survivor");
  const { profile, session, signIn, signOut, signUp, status } = useAppData();

  async function handleSubmit(event) {
    event.preventDefault();
    if (mode === "signup") {
      await signUp(email, password, fullName, role);
      return;
    }

    await signIn(email, password);
  }

  return (
    <div className="screen-grid">
      <ScreenCard title="Account access" subtitle="Secure sign-in for survivor or caregiver.">
        {session ? (
          <div className="stack-form">
            <p className="status-text">Signed in as {session.user.email}</p>
            <p className="status-text">
              {profile.full_name} • {profile.role}
            </p>
            <button className="primary-button" onClick={signOut}>
              Sign out
            </button>
          </div>
        ) : (
          <form className="stack-form" onSubmit={handleSubmit}>
            <div className="role-switch">
              <button
                className={mode === "signin" ? "ghost-button active-chip" : "ghost-button"}
                onClick={() => setMode("signin")}
                type="button"
              >
                Sign in
              </button>
              <button
                className={mode === "signup" ? "ghost-button active-chip" : "ghost-button"}
                onClick={() => setMode("signup")}
                type="button"
              >
                Create account
              </button>
            </div>
            {mode === "signup" ? (
              <>
                <label>
                  Full name
                  <input
                    className="text-input"
                    onChange={(event) => setFullName(event.target.value)}
                    value={fullName}
                  />
                </label>
                <label>
                  Role
                  <select
                    className="text-input"
                    onChange={(event) => setRole(event.target.value)}
                    value={role}
                  >
                    <option value="survivor">Survivor</option>
                    <option value="caregiver">Caregiver</option>
                  </select>
                </label>
              </>
            ) : null}
            <label>
              Email
              <input
                className="text-input"
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                value={email}
              />
            </label>
            <label>
              Password
              <input
                className="text-input"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>
            <button className="primary-button" type="submit">
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
        )}
        <p className="status-text">{status}</p>
      </ScreenCard>
    </div>
  );
}
