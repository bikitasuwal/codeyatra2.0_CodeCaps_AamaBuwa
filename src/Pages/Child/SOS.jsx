import { Plus, Trash2, Bell, Home, ListChecks } from "lucide-react";
import { useState } from "react";
import { useAlarms } from "../../context/AlarmContext";

export default function SOS() {
  const { alarms, addAlarm: createAlarm, deleteAlarm, toggleAlarm } = useAlarms();
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  // Custom Time Picker State
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState("AM");

  const addAlarm = () => {
    if (!newLabel.trim()) return;

    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")} ${period}`;

    createAlarm({
      time: formattedTime,
      label: newLabel,
    });

    setNewLabel("");
    setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white flex flex-col justify-between">
      <div className="p-6 space-y-6">


        {/* Title */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Parent Alarms</h2>
            <p className="text-gray-400 text-sm">
              Schedule reminders that appear for आमा-बुवा.
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="bg-orange-500 p-3 rounded-full hover:bg-orange-600 transition"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Add Alarm Panel */}
        {showAdd && (
          <div className="mt-4 space-y-4 bg-[#111a2e] p-5 rounded-xl">

            {/* Custom Time Picker */}
            <div className="flex items-center justify-center gap-6 bg-[#1c2439] p-4 rounded-xl">

              {/* Hour */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setHour((prev) => (prev === 12 ? 1 : prev + 1))}
                  className="text-orange-500 text-xl"
                >
                  ▲
                </button>

                <span className="text-3xl font-bold">
                  {hour.toString().padStart(2, "0")}
                </span>

                <button
                  onClick={() => setHour((prev) => (prev === 1 ? 12 : prev - 1))}
                  className="text-orange-500 text-xl"
                >
                  ▼
                </button>
              </div>

              <span className="text-3xl font-bold">:</span>

              {/* Minute */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() =>
                    setMinute((prev) => (prev === 59 ? 0 : prev + 1))
                  }
                  className="text-orange-500 text-xl"
                >
                  ▲
                </button>

                <span className="text-3xl font-bold">
                  {minute.toString().padStart(2, "0")}
                </span>

                <button
                  onClick={() =>
                    setMinute((prev) => (prev === 0 ? 59 : prev - 1))
                  }
                  className="text-orange-500 text-xl"
                >
                  ▼
                </button>
              </div>

              {/* AM/PM */}
              <div className="flex flex-col items-center ml-4">
                <button
                  onClick={() =>
                    setPeriod((prev) => (prev === "AM" ? "PM" : "AM"))
                  }
                  className="px-4 py-2 bg-orange-500 rounded-lg text-black font-semibold"
                >
                  {period}
                </button>
              </div>
            </div>

            {/* Label Input */}
            <input
              type="text"
              placeholder="Alarm label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full rounded-md bg-[#1c2439] text-white p-2"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-md border border-gray-600 hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={addAlarm}
                className="px-4 py-2 rounded-md bg-orange-500 hover:bg-orange-600"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Alarm List */}
        <ul className="mt-6 space-y-3">
          {alarms.length === 0 && (
            <p className="text-gray-500 text-center mt-6">
              No alarms yet. Click + to add one.
            </p>
          )}

          {alarms.map(({ id, time, label, enabled = true }) => (
            <li
              key={id}
              className="flex items-center justify-between bg-[#111a2e] rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleAlarm(id)}
                  className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition ${
                    enabled
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-600"
                  }`}
                >
                  {enabled && (
                    <span className="text-black text-xs font-bold">✓</span>
                  )}
                </button>

                <div>
                  <p
                    className={`font-semibold text-lg ${
                      enabled ? "text-white" : "text-orange-500 line-through"
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-gray-400 text-sm">{time}</p>
                </div>
              </div>

              <Trash2
                size={18}
                className="text-gray-400 cursor-pointer hover:text-red-500"
                onClick={() => deleteAlarm(id)}
              />
            </li>
          ))}
        </ul>

        {/* Info Box */}
        <div className="bg-[#111a2e] border border-[#1e2a45] rounded-xl p-4 flex gap-3 mt-6">
          <Bell className="text-blue-400 mt-1" size={18} />
          <p className="text-sm text-gray-400">
            Scheduled alarms will automatically trigger a full-screen alert on
            the parent's device at the exact time.
          </p>
        </div>
      </div>

     
    </div>
  );
}