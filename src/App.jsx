import { NavLink, Route, Routes } from "react-router-dom";
import { DashboardScreen } from "./screens/DashboardScreen";
import { OrientationScreen } from "./screens/OrientationScreen";
import { RemindersScreen } from "./screens/RemindersScreen";
import { NotesScreen } from "./screens/NotesScreen";
import { CaregiverScreen } from "./screens/CaregiverScreen";
import { AuthScreen } from "./screens/AuthScreen";
import { AppDataProvider } from "./state/AppDataContext";
import { InstallPrompt } from "./components/InstallPrompt";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/orientation", label: "My Day" },
  { to: "/reminders", label: "Plan" },
  { to: "/notes", label: "Notes" }
];

export default function App() {
  return (
    <AppDataProvider>
      <div className="app-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">NeuroCompass</p>
            <h1>Daily support, one clear step at a time.</h1>
          </div>
          <div className="header-actions">
            <InstallPrompt />
            <NavLink className="header-link" to="/caregiver">
              Caregiver
            </NavLink>
            <NavLink className="header-link" to="/auth">
              Sign in
            </NavLink>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/orientation" element={<OrientationScreen />} />
            <Route path="/reminders" element={<RemindersScreen />} />
            <Route path="/notes" element={<NotesScreen />} />
            <Route path="/caregiver" element={<CaregiverScreen />} />
            <Route path="/auth" element={<AuthScreen />} />
          </Routes>
        </main>

        <nav className="bottom-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </AppDataProvider>
  );
}
