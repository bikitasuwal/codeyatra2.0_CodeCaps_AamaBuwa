import { CheckCircle, Clock, Phone, Pill, ShoppingCart, User, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAlarms } from "../../context/AlarmContext";

const TIMEOUT_MINUTES = 10;

export default function Home() {
  const { alarms } = useAlarms();
  const [overdueAlerts, setOverdueAlerts] = useState([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState([]);

  useEffect(() => {
    const checkForOverdueAlarms = () => {
      const now = new Date().getTime();
      const timeoutMs = TIMEOUT_MINUTES * 60 * 1000;

      const overdue = alarms.filter((alarm) => {
        if (!alarm.triggeredAt || alarm.acknowledgedAt) return false;
        
        const elapsedMs = now - alarm.triggeredAt;
        return elapsedMs >= timeoutMs;
      });

      setOverdueAlerts(overdue);
    };

    checkForOverdueAlarms();
    const intervalId = setInterval(checkForOverdueAlarms, 5000);

    return () => clearInterval(intervalId);
  }, [alarms]);

  useEffect(() => {
    const checkForAcknowledgedAlarms = () => {
      const now = new Date().getTime();
      const recentThresholdMs = 10000; // Show for 10 seconds

      const recentlyAcknowledged = alarms.filter((alarm) => {
        if (!alarm.acknowledgedAt) return false;
        
        const elapsedSinceAck = now - alarm.acknowledgedAt;
        return elapsedSinceAck < recentThresholdMs;
      });

      setAcknowledgedAlerts(recentlyAcknowledged);
    };

    checkForAcknowledgedAlarms();
    const intervalId = setInterval(checkForAcknowledgedAlarms, 1000);

    return () => clearInterval(intervalId);
  }, [alarms]);

  const handleCallParent = () => {
    window.location.href = "tel:+977-9876543210";
  };

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

        {/* Medication Taken Success Alert */}
        {acknowledgedAlerts.length > 0 && (
          <div className="bg-green-900 border-2 border-green-600 p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="text-green-400" size={28} />
              <div>
                <h3 className="text-lg font-bold text-green-200">
                  Medication Taken! ✓
                </h3>
                <p className="text-sm text-green-300">
                  आमा has confirmed taking the medication
                </p>
              </div>
            </div>

            {acknowledgedAlerts.map((alarm) => (
              <div
                key={alarm.id}
                className="bg-green-950 border border-green-700 rounded-xl p-3"
              >
                <p className="font-semibold text-green-200">{alarm.label}</p>
                <p className="text-sm text-green-400">Scheduled: {alarm.time} • Taken ✓</p>
              </div>
            ))}
          </div>
        )}

        {/* Overdue Medication Alert */}
        {overdueAlerts.length > 0 && (
          <div className="bg-red-900 border-2 border-red-600 p-5 rounded-2xl animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="text-red-400" size={28} />
              <div>
                <h3 className="text-lg font-bold text-red-200">
                  Medication Not Taken!
                </h3>
                <p className="text-sm text-red-300">
                  आमा has not confirmed medication for 10+ minutes
                </p>
              </div>
            </div>

            {overdueAlerts.map((alarm) => (
              <div
                key={alarm.id}
                className="bg-red-950 border border-red-700 rounded-xl p-3 mb-3"
              >
                <p className="font-semibold text-red-200">{alarm.label}</p>
                <p className="text-sm text-red-400">Scheduled: {alarm.time}</p>
              </div>
            ))}

            <button
              onClick={handleCallParent}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold mt-2"
            >
              <Phone size={18} />
              Call आमा Now
            </button>
          </div>
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