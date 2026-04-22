import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Mail,
  CheckSquare,
  BarChart2,
  Sun,
  Moon,
  Settings,
  History,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  icon: ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: <Home size={18} />, label: "Accueil", path: "/home" },
  { icon: <Mail size={18} />, label: "E-mails", path: "/emails" },
  { icon: <CheckSquare size={18} />, label: "Tâches", path: "/tasks" },
  { icon: <BarChart2 size={18} />, label: "Analyses", path: "/analysis" },
];

function playPop(expanding: boolean) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const baseFreq = expanding ? 160 : 260;
    osc.frequency.setValueAtTime(baseFreq * 1.6, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // AudioContext may be blocked before user interaction — fail silently
  }
}

function AnimatedHamburger({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex flex-col gap-[4px] w-[18px]">
      {[0, 0.13, 0.26].map((delay, i) => (
        <motion.span
          key={i}
          animate={
            collapsed
              ? { x: [0, 4, -4, 0], opacity: [0.6, 1, 1, 0.6] }
              : { x: 0, opacity: 0.7 }
          }
          transition={
            collapsed
              ? { duration: 1.0, repeat: Infinity, repeatDelay: 2.5, delay, ease: "easeInOut" }
              : { duration: 0.2 }
          }
          className="h-[1.5px] w-full bg-current rounded-full"
        />
      ))}
    </div>
  );
}

function AnimatedEnvelope({ sidebarOpen }: { sidebarOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 18 18"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="6" width="16" height="10" rx="1.5" />
      <motion.path
        animate={
          sidebarOpen
            ? {
                d: [
                  "M1 6 L9 11.5 L17 6",
                  "M1 6 L9 1.5 L17 6",
                  "M1 6 L9 1.5 L17 6",
                  "M1 6 L9 11.5 L17 6",
                ],
              }
            : { d: "M1 6 L9 11.5 L17 6" }
        }
        transition={
          sidebarOpen
            ? {
                duration: 1.0,
                repeat: Infinity,
                repeatDelay: 4,
                times: [0, 0.25, 0.75, 1],
                ease: "easeInOut",
              }
            : { duration: 0 }
        }
      />
    </svg>
  );
}

const labelVariants = {
  hidden: { opacity: 0, x: -6, width: 0 },
  visible: { opacity: 1, x: 0, width: "auto" },
};

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggle = () => {
    const expanding = sidebarCollapsed;
    playPop(expanding);
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 56 : 176 }}
        initial={false}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden"
      >
        {/* Top: hamburger + avatar */}
        <div className="flex flex-col items-center pt-4 pb-2 gap-3">
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <AnimatedHamburger collapsed={sidebarCollapsed} />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.p
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.18, delay: 0.05 }}
                className="text-xs text-sidebar-foreground/60 font-medium uppercase tracking-wide whitespace-nowrap overflow-hidden"
              >
                {user?.email.split("@")[0]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-2 mt-1 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <span className="shrink-0">
                  {item.path === "/emails" ? (
                    <AnimatedEnvelope sidebarOpen={!sidebarCollapsed} />
                  ) : (
                    item.icon
                  )}
                </span>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      variants={labelVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ duration: 0.18, delay: 0.06 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="mx-3 my-2 h-px bg-sidebar-border/50" />

        {/* Bottom nav */}
        <div className="flex flex-col gap-1 px-2 pb-4">
          {/* Theme toggle — icon glows orange periodically when collapsed */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full text-left"
          >
            <motion.span
              className="shrink-0"
              animate={
                sidebarCollapsed
                  ? {
                      filter: [
                        "drop-shadow(0 0 0px rgba(249,115,22,0))",
                        "drop-shadow(0 0 7px rgba(249,115,22,1))",
                        "drop-shadow(0 0 0px rgba(249,115,22,0))",
                      ],
                      color: ["currentColor", "#f97316", "currentColor"],
                    }
                  : { filter: "drop-shadow(0 0 0px rgba(249,115,22,0))" }
              }
              transition={
                sidebarCollapsed
                  ? { duration: 1.6, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </motion.span>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  variants={labelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.18, delay: 0.06 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {theme === "dark" ? "Mode clair" : "Mode sombre"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Settings — gear spins periodically */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full text-left"
          >
            <motion.span
              className="shrink-0"
              animate={{ rotate: [0, 0, 360, 360] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                repeatDelay: 5,
                times: [0, 0.05, 0.95, 1],
                ease: "easeInOut",
              }}
            >
              <Settings size={18} />
            </motion.span>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  variants={labelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.18, delay: 0.06 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Paramètres
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* History */}
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full text-left">
            <span className="shrink-0">
              <History size={18} />
            </span>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  variants={labelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.18, delay: 0.06 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Historique
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-sidebar-accent transition-colors w-full text-left"
          >
            <span className="shrink-0">
              <LogOut size={18} />
            </span>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  variants={labelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.18, delay: 0.06 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Déconnexion
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative">{children}</main>

      {/* Settings Panel */}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
