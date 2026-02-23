import { Home, ClipboardList, Users, AlertCircle } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  const navItems = [
    { name: "Home", icon: Home, path: "/child/home" },
    { name: "Tasks", icon: ClipboardList, path: "/child/task" },
    { name: "Log Medicine", icon: AlertCircle, path: "/child/log" },
    { name: "Contact", icon: AlertCircle, path: "/child/contact" },
  ];

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#0b1220] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center text-xs transition"
            >
              <Icon
                size={24}
                className={`mb-1 ${
                  isActive ? "text-orange-400" : "text-slate-400"
                }`}
              />
              <span
                className={`${
                  isActive ? "text-orange-400" : "text-slate-400"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}