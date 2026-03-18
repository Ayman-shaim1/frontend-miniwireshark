import { NavLink } from "react-router-dom";
import { LayoutDashboard, Radio, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/", label: "Capture", icon: Radio },
  { to: "/packet-history", label: "Historique", icon: History },
];

export default function AppNav() {
  return (
    <nav className="shrink-0 border-b bg-card/50 backdrop-blur-sm">
      <div className="flex gap-1 px-4 py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-muted hover:text-foreground",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-muted-foreground"
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
