import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-dvh flex-col bg-background">
        <nav className="shrink-0 border-b bg-card px-4 py-2">
          <div className="flex gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-foreground ${
                  isActive
                    ? "text-foreground border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                }`
              }
            >
              Capture
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-foreground ${
                  isActive
                    ? "text-foreground border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                }`
              }
            >
              Dashboard
            </NavLink>
          </div>
        </nav>
        <main className="min-h-0 flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
