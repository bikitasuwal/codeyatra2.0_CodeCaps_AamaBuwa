import { CheckCircle, Clock, Phone, Pill, ShoppingCart, User } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-orange-400">आमा-बुवा</h1>
          <div className="w-9 h-9 rounded-full border border-orange-400 flex items-center justify-center text-orange-400">
            B
          </div>
        </div>

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