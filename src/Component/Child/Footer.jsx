import { Home, ClipboardList, AlertCircle, Phone } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  const navItems = [
    { name: "Home", icon: Home, path: "/child/home" },
    { name: "Tasks", icon: ClipboardList, path: "/child/task" },
    { name: "Log Medicine", icon: AlertCircle, path: "/child/log" },
    { name: "Contact", icon: Phone, path: "/child/contact" },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full bg-[#0b1220] border-t border-slate-800 z-50">
      <div className="max-w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 flex justify-between items-center gap-2 sm:gap-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center text-xs sm:text-xs md:text-sm transition-all duration-200 flex-1"
            >
              <Icon
                size={18}
                className={`mb-1 sm:mb-1.5 md:mb-2 transition ${
                  isActive ? "text-orange-400" : "text-slate-400"
                }`}
              />
              <span
                className={`transition text-xs sm:text-xs md:text-sm ${
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