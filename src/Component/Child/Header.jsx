import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";

export default function Header({ user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-orange-500">आमा-बुवा</h1>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 border border-orange-500 rounded-full pl-2 pr-1 py-1 hover:bg-orange-500/10 transition"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-orange-500 font-medium bg-slate-800">
            {user ? getInitials(user.full_name) : "U"}
          </div>
          <ChevronDown size={18} className="text-orange-500" />
        </button>

        {isDropdownOpen && (
          <>
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="py-3 px-4 border-b border-slate-700">
                <p className="text-sm font-medium text-white">{user?.full_name || "User"}</p>
                <p className="text-xs text-slate-400 mt-1">{user?.email || "user@example.com"}</p>
                <p className="text-xs text-orange-500 mt-1 capitalize">{user?.role_display || "Role"}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition border-t border-slate-700"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
          </>
        )}
      </div>
    </div>
  );
}