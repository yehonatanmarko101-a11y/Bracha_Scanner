import { Outlet, NavLink } from "react-router-dom";
import { Camera, BookOpen, MessageCircleQuestion, History as HistoryIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "../contexts/SettingsContext";
import { ReactNode } from "react";

export default function Layout() {
  const { t } = useSettings();

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <main className="flex-1 overflow-y-auto w-full relative">
        <Outlet />
      </main>
      <nav className="w-full bg-card border-t border-border z-50 shrink-0 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-end justify-between px-2 pb-2 pt-1 max-w-md mx-auto relative h-16">
          <NavItem to="/brachot" icon={<BookOpen size={24} />} label={t('nav_brachot')} />
          <NavItem to="/ask" icon={<MessageCircleQuestion size={24} />} label={t('nav_ask')} />
          
          <div className="relative -top-6 flex-shrink-0">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-all active:scale-95",
                  isActive ? "bg-primary scale-105 shadow-primary/50" : "bg-primary/90 hover:bg-primary"
                )
              }
            >
              <Camera size={28} />
              <span className="text-[10px] font-medium mt-0.5">{t('nav_scan')}</span>
            </NavLink>
          </div>

          <NavItem to="/history" icon={<HistoryIcon size={24} />} label={t('nav_history')} />
          <NavItem to="/profile" icon={<User size={24} />} label={t('nav_profile')} />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-16 gap-1 p-1 rounded-lg text-muted-foreground transition-all active:scale-95",
          isActive && "text-primary font-medium"
        )
      }
    >
      {icon}
      <span className="text-[10px] truncate w-full text-center">{label}</span>
    </NavLink>
  );
}

