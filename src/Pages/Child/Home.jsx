import { CheckCircle, Clock, Phone, Pill, ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Get user data from localStorage when component mounts
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/");
  };

  // Get initials from full name
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header with Profile Dropdown */}
        <div className="flex justify-between items-center relative">
          <h1 className="text-xl font-bold text-orange-400">आमा-बुवा</h1>
          
          {/* Profile Icon with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 border border-orange-400 rounded-full pl-2 pr-1 py-1 hover:bg-orange-400/10 transition"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-orange-400 font-medium">
                {user ? getInitials(user.full_name) : "B"}
              </div>
              <ChevronDown size={16} className="text-orange-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="py-3 px-4 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">{user?.full_name || "User Name"}</p>
                  <p className="text-xs text-slate-400 mt-1">{user?.email || "user@example.com"}</p>
                  <p className="text-xs text-orange-400 mt-1 capitalize">{user?.role_display || "Role"}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}

        {/* Parent Status Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Today's Parent Status
          </p>

          <h2 className="text-lg font-semibold mt-3">
            Sita Devi's Health
          </h2>
          <p className="text-sm text-slate-400">
            68 Years · Pokhara · 
            <span className="text-green-400 ml-1">● Live monitoring</span>
          </p>

          <div className="grid grid-cols-2 gap-4 mt-5">
            {/* Morning */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center">
              <p className="text-xs text-slate-400">Morning (8AM)</p>
              <CheckCircle className="mx-auto mt-2 text-green-400" size={26} />
              <p className="text-green-400 text-sm mt-1">Taken</p>
            </div>

            {/* Evening */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center">
              <p className="text-xs text-slate-400">Evening (7PM)</p>
              <Clock className="mx-auto mt-2 text-slate-400" size={26} />
              <p className="text-slate-400 text-sm mt-1">Pending</p>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            My Tasks Today
          </p>

          <div className="mt-4 space-y-4">
            <Task text="Call आमा this evening" />
            <Task text="Refill Metformin prescription" />
            <Task text="Check on BP readings" completed />
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Weekly Summary
          </p>

          <div className="flex justify-between mt-4">
            <div>
              <p className="text-sm text-slate-400">Task Completion</p>
              <p className="text-xl font-bold">4 of 6 complete</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Meds Streak</p>
              <p className="text-lg font-semibold text-green-400">
                12 Days 🔥
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-slate-800 h-2 rounded-full">
            <div className="bg-orange-400 h-2 rounded-full w-2/3"></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">
            Quick Actions
          </p>

          <div className="grid grid-cols-2 gap-4">
            <QuickButton icon={<Phone size={18} />} label="Call आमा now" />
            <QuickButton icon={<Pill size={18} />} label="Log Medicine" />
            <QuickButton icon={<ShoppingCart size={18} />} label="Order Grocery" />
            <QuickButton icon={<User size={18} />} label="Book Officer" />
          </div>
        </div>

      </div>
    </div>
  );
}

function Task({ text, completed }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-4 h-4 rounded-full border ${
          completed
            ? "bg-orange-400 border-orange-400"
            : "border-orange-400"
        }`}
      ></div>
      <p
        className={`text-sm ${
          completed ? "line-through text-slate-500" : "text-white"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function QuickButton({ icon, label }) {
  return (
    <button className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center hover:border-orange-400 transition">
      <div className="text-orange-400">{icon}</div>
      <p className="text-sm mt-2 text-slate-300">{label}</p>
    </button>
  );
}