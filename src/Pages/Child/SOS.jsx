import { Plus, Trash2, Bell, CalendarDays, Phone, MapPin, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAlarms } from "../../context/AlarmContext";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_VALUES = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTE_VALUES = Array.from({ length: 60 }, (_, index) => index);
const PICKER_ITEM_HEIGHT = 48;
const PICKER_CONTAINER_HEIGHT = 144;
const PICKER_PADDING = (PICKER_CONTAINER_HEIGHT - PICKER_ITEM_HEIGHT) / 2;
const HOUR_LOOP_MULTIPLIER = 5;
const MINUTE_LOOP_MULTIPLIER = 5;

const todayDateValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatSchedule = ({ date, repeatMode, repeatDays }) => {
  const dateText = date || "No date";

  if (repeatMode === "customDays") {
    const days = Array.isArray(repeatDays)
      ? repeatDays
          .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
          .map((day) => WEEK_DAYS[day])
      : [];

    return `${dateText} • ${days.length ? days.join(", ") : "No days selected"}`;
  }

  return `${dateText} • Everyday`;
};

export default function SOS() {
  const { alarms, addAlarm: createAlarm, deleteAlarm, toggleAlarm } = useAlarms();
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [alarmDate, setAlarmDate] = useState(todayDateValue());
  const [repeatMode, setRepeatMode] = useState("everyday");
  const [repeatDays, setRepeatDays] = useState([]);
  const [alarmSoundOn, setAlarmSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);
  const [snoozeOn, setSnoozeOn] = useState(true);
  const [user, setUser] = useState(null);
  const [childContact, setChildContact] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom Time Picker State
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState("AM");
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const hourScrollValues = Array.from(
    { length: HOUR_VALUES.length * HOUR_LOOP_MULTIPLIER },
    (_, index) => HOUR_VALUES[index % HOUR_VALUES.length]
  );
  const minuteScrollValues = Array.from(
    { length: MINUTE_VALUES.length * MINUTE_LOOP_MULTIPLIER },
    (_, index) => MINUTE_VALUES[index % MINUTE_VALUES.length]
  );

  const toggleRepeatDay = (dayIndex) => {
    setRepeatDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((day) => day !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  const addAlarm = () => {
    if (!newLabel.trim()) return;
    if (repeatMode === "customDays" && repeatDays.length === 0) return;

    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")} ${period}`;

    createAlarm({
      time: formattedTime,
      label: newLabel,
      date: alarmDate,
      repeatMode,
      repeatDays,
    });

    setNewLabel("");
    setAlarmDate(todayDateValue());
    setRepeatMode("everyday");
    setRepeatDays([]);
    setAlarmSoundOn(true);
    setVibrationOn(true);
    setSnoozeOn(true);
    setShowAdd(false);
  };

  const toggleEveryday = () => {
    if (repeatMode === "everyday") {
      setRepeatMode("customDays");
      if (repeatDays.length === 0) {
        setRepeatDays([1, 2, 3, 4, 5, 6, 0]);
      }
      return;
    }

    setRepeatMode("everyday");
  };

  // Load user and child contact info
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadChildContact(parsedUser.id);
    }
  }, []);

  const loadChildContact = async (userId) => {
    try {
      const response = await fetch(`http://10.5.5.143:5005/api/child-contact/${userId}`);
      const data = await response.json();
      if (data.success && data.contact) {
        setChildContact(data.contact);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading contact:", error);
      setLoading(false);
    }
  };

  const saveDisabled =
    !newLabel.trim() || (repeatMode === "customDays" && repeatDays.length === 0);

  useEffect(() => {
    if (!showAdd) return;

    if (hourScrollRef.current) {
      hourScrollRef.current.scrollTop =
        (HOUR_VALUES.length * 2 + (hour - 1)) * PICKER_ITEM_HEIGHT + PICKER_PADDING;
    }

    if (minuteScrollRef.current) {
      minuteScrollRef.current.scrollTop =
        (MINUTE_VALUES.length * 2 + minute) * PICKER_ITEM_HEIGHT + PICKER_PADDING;
    }
  }, [showAdd]);

  const handleHourScroll = (event) => {
    const container = event.currentTarget;
    const centerOffset = container.clientHeight / 2 - PICKER_ITEM_HEIGHT / 2;
    const rawIndex = Math.round(
      (container.scrollTop + centerOffset - PICKER_PADDING) / PICKER_ITEM_HEIGHT
    );
    const normalizedIndex =
      ((rawIndex % HOUR_VALUES.length) + HOUR_VALUES.length) % HOUR_VALUES.length;

    setHour(HOUR_VALUES[normalizedIndex]);

    if (rawIndex < HOUR_VALUES.length) {
      container.scrollTop += HOUR_VALUES.length * 2 * PICKER_ITEM_HEIGHT;
    } else if (rawIndex >= HOUR_VALUES.length * (HOUR_LOOP_MULTIPLIER - 1)) {
      container.scrollTop -= HOUR_VALUES.length * 2 * PICKER_ITEM_HEIGHT;
    }
  };

  const handleMinuteScroll = (event) => {
    const container = event.currentTarget;
    const centerOffset = container.clientHeight / 2 - PICKER_ITEM_HEIGHT / 2;
    const rawIndex = Math.round(
      (container.scrollTop + centerOffset - PICKER_PADDING) / PICKER_ITEM_HEIGHT
    );
    const normalizedIndex =
      ((rawIndex % MINUTE_VALUES.length) + MINUTE_VALUES.length) % MINUTE_VALUES.length;

    setMinute(MINUTE_VALUES[normalizedIndex]);

    if (rawIndex < MINUTE_VALUES.length) {
      container.scrollTop += MINUTE_VALUES.length * 2 * PICKER_ITEM_HEIGHT;
    } else if (rawIndex >= MINUTE_VALUES.length * (MINUTE_LOOP_MULTIPLIER - 1)) {
      container.scrollTop -= MINUTE_VALUES.length * 2 * PICKER_ITEM_HEIGHT;
    }
  };

  if (showAdd) {
    return (
      <div className="min-h-screen bg-[#0b1220] text-white px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl rounded-lg sm:rounded-xl md:rounded-2xl bg-[#111a2e] border border-[#1e2a45] p-4 sm:p-5 md:p-6 space-y-5 sm:space-y-6">
          
          {/* Emergency Contact Card */}
          {childContact && (
            <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6">
              <p className="text-xs text-orange-400 font-semibold uppercase mb-3 sm:mb-4">Emergency Contact Info</p>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-orange-300">
                  <User size={16} />
                  <span>{childContact.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-orange-300">
                  <Phone size={16} />
                  <span>{childContact.contact_number}</span>
                </div>
                <div className="flex items-center gap-2 text-orange-300">
                  <MapPin size={16} />
                  <span className="text-xs">{childContact.address}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 pb-1">
            <div className="flex items-center justify-center gap-5 select-none">
              <div className="relative h-36 w-20 overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-11 bg-gradient-to-b from-[#111a2e] to-transparent z-10" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-11 bg-gradient-to-t from-[#111a2e] to-transparent z-10" />
                <div
                  ref={hourScrollRef}
                  onScroll={handleHourScroll}
                  className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar [&::-webkit-scrollbar]:hidden"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    paddingTop: `${PICKER_PADDING}px`,
                    paddingBottom: `${PICKER_PADDING}px`,
                  }}
                >
                  {hourScrollValues.map((hourValue, index) => (
                    <div
                      key={`hour-${hourValue}-${index}`}
                      className={`h-12 snap-center flex items-center justify-center text-4xl font-semibold transition-colors ${
                        hourValue === hour ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {hourValue}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-4xl font-semibold">:</div>

              <div className="relative h-36 w-24 overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-11 bg-gradient-to-b from-[#111a2e] to-transparent z-10" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-11 bg-gradient-to-t from-[#111a2e] to-transparent z-10" />
                <div
                  ref={minuteScrollRef}
                  onScroll={handleMinuteScroll}
                  className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar [&::-webkit-scrollbar]:hidden"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    paddingTop: `${PICKER_PADDING}px`,
                    paddingBottom: `${PICKER_PADDING}px`,
                  }}
                >
                  {minuteScrollValues.map((minuteValue, index) => (
                    <div
                      key={`minute-${minuteValue}-${index}`}
                      className={`h-12 snap-center flex items-center justify-center text-4xl font-semibold transition-colors ${
                        minuteValue === minute ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {minuteValue.toString().padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setPeriod((prev) => (prev === "AM" ? "PM" : "AM"))}
                className="text-2xl text-gray-300 hover:text-orange-400"
              >
                {period.toLowerCase()}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleEveryday}
                className="text-gray-300 text-base hover:text-orange-400"
              >
                Every day
              </button>
              <label className="flex items-center gap-2 text-xs text-gray-400">
                <CalendarDays size={14} />
                <input
                  type="date"
                  value={alarmDate}
                  onChange={(e) => setAlarmDate(e.target.value)}
                  className="rounded bg-[#1c2439] text-white px-2 py-1 border border-[#2a3552]"
                />
              </label>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {WEEK_DAYS.map((day, index) => {
                const selected =
                  repeatMode === "everyday" ? true : repeatDays.includes(index);

                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (repeatMode === "everyday") {
                        setRepeatMode("customDays");
                        setRepeatDays([index]);
                        return;
                      }
                      toggleRepeatDay(index);
                    }}
                    className={`h-8 w-8 rounded-full text-xs border transition justify-self-center ${
                      selected
                        ? "border-orange-500 text-orange-300 bg-orange-500/10"
                        : "border-gray-600 text-gray-400"
                    }`}
                  >
                    {day[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Alarm name"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full bg-transparent border-b border-gray-600 focus:border-orange-500 outline-none py-2 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-1 border-b border-[#1e2a45] pb-3">
              <div className="flex items-center justify-between">
                <p className="text-xl text-gray-200">Alarm sound</p>
                <button
                  onClick={() => setAlarmSoundOn((prev) => !prev)}
                  className={`w-12 h-7 rounded-full p-1 transition ${
                    alarmSoundOn ? "bg-orange-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition ${
                      alarmSoundOn ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-400">Homecoming</p>
            </div>

            <div className="space-y-1 border-b border-[#1e2a45] pb-3">
              <div className="flex items-center justify-between">
                <p className="text-xl text-gray-200">Vibration</p>
                <button
                  onClick={() => setVibrationOn((prev) => !prev)}
                  className={`w-12 h-7 rounded-full p-1 transition ${
                    vibrationOn ? "bg-orange-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition ${
                      vibrationOn ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-400">Basic call</p>
            </div>

            <div className="space-y-1 border-b border-[#1e2a45] pb-3">
              <div className="flex items-center justify-between">
                <p className="text-xl text-gray-200">Snooze</p>
                <button
                  onClick={() => setSnoozeOn((prev) => !prev)}
                  className={`w-12 h-7 rounded-full p-1 transition ${
                    snoozeOn ? "bg-orange-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition ${
                      snoozeOn ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-400">5 minutes, 3 times</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 sm:pt-4">
            <button
              onClick={() => setShowAdd(false)}
              className="text-base sm:text-lg text-gray-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={addAlarm}
              disabled={saveDisabled}
              className={`text-base sm:text-lg font-medium ${
                saveDisabled
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-orange-400 hover:text-orange-300"
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white flex flex-col justify-between">
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6 mx-auto w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl">


        {/* Title */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">Parent Alarms</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
              Schedule reminders that appear for आमा-बुवा.
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="bg-orange-500 p-2 sm:p-3 rounded-full hover:bg-orange-600 transition active:scale-95"
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
              className="w-full rounded-lg sm:rounded-lg md:rounded-lg bg-[#1c2439] text-white p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm text-gray-300 flex items-center gap-2">
                <CalendarDays size={14} />
                Start date
              </label>
              <input
                type="date"
                value={alarmDate}
                onChange={(e) => setAlarmDate(e.target.value)}
                className="w-full rounded-lg sm:rounded-lg md:rounded-lg bg-[#1c2439] text-white p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-gray-300 font-medium">Repeat</p>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={() => setRepeatMode("everyday")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm border transition active:scale-95 ${
                    repeatMode === "everyday"
                      ? "bg-orange-500 text-black border-orange-500 font-medium"
                      : "border-gray-600 text-gray-300 hover:border-gray-400"
                  }`}
                >
                  Everyday
                </button>
                <button
                  onClick={() => setRepeatMode("customDays")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm border transition active:scale-95 ${
                    repeatMode === "customDays"
                      ? "bg-orange-500 text-black border-orange-500 font-medium"
                      : "border-gray-600 text-gray-300 hover:border-gray-400"
                  }`}
                >
                  Different days
                </button>
              </div>

              {repeatMode === "customDays" && (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {WEEK_DAYS.map((day, index) => {
                    const selected = repeatDays.includes(index);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleRepeatDay(index)}
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs border transition active:scale-95 ${
                          selected
                            ? "bg-orange-500 text-black border-orange-500 font-medium"
                            : "border-gray-600 text-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-lg bg-slate-800 border border-slate-700 text-sm sm:text-base hover:bg-slate-700 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={addAlarm}
                disabled={saveDisabled}
                className="px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-lg text-sm sm:text-base font-medium bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition active:scale-95"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Alarm List */}
        <ul className="mt-6 space-y-3 sm:space-y-4">
          {alarms.length === 0 && (
            <p className="text-gray-500 text-center text-sm sm:text-base mt-6">
              No alarms yet. Click + to add one.
            </p>
          )}

          {alarms.map(({ id, time, label, enabled = true, date, repeatMode, repeatDays }) => (
            <li
              key={id}
              className="flex items-center justify-between bg-[#111a2e] rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 hover:bg-[#151e35] transition"
            >
              <div className="flex items-center gap-3 sm:gap-4">
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
                    className={`font-semibold text-base sm:text-lg md:text-xl ${
                      enabled ? "text-white" : "text-orange-500 line-through"
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm">{time}</p>
                  <p className="text-gray-500 text-xs sm:text-xs">
                    {formatSchedule({ date, repeatMode, repeatDays })}
                  </p>
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
        <div className="bg-[#111a2e] border border-[#1e2a45] rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 flex gap-3 sm:gap-4 mt-6">
          <Bell className="text-blue-400 mt-1 flex-shrink-0" size={18} />
          <p className="text-xs sm:text-sm text-gray-400">
            Scheduled alarms will automatically trigger a full-screen alert on
            the parent's device at the exact time.
          </p>
        </div>
      </div>

     
    </div>
  );
}