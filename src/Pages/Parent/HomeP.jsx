import {
  Clock,
  Sun,
  Moon,
  CheckCircle,
  Check,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAlarms } from "../../context/AlarmContext";

const toMinutes = (hour, minute, period) => {
  let normalizedHour = hour % 12;
  if (period === "PM") {
    normalizedHour += 12;
  }

  return normalizedHour * 60 + minute;
};

const parseAlarmTimeToMinutes = (timeText) => {
  const match = timeText.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;

  return toMinutes(hour, minute, period);
};

const todayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const shouldRunBySchedule = (alarm, now) => {
  const today = todayKey();

  if (alarm.date && alarm.date > today) {
    return false;
  }

  if (alarm.repeatMode === "customDays") {
    const validDays = Array.isArray(alarm.repeatDays)
      ? alarm.repeatDays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      : [];

    if (validDays.length === 0) return false;
    return validDays.includes(now.getDay());
  }

  return true;
};

export default function HomeP() {
  const { alarms, updateAlarms } = useAlarms();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkForDueAlarms = () => {
      const now = new Date();
      const nowInMinutes = now.getHours() * 60 + now.getMinutes();
      const today = todayKey();

      const dueAlarms = alarms.filter(
        (alarm) => {
          const alarmMinutes = parseAlarmTimeToMinutes(alarm.time || "");
          if (alarmMinutes === null) return false;
          if (!shouldRunBySchedule(alarm, now)) return false;

          return (
            alarm.enabled !== false &&
            nowInMinutes >= alarmMinutes &&
            alarm.lastTriggeredDate !== today
          );
        }
      );

      if (dueAlarms.length > 0) {
        const now = new Date();
        
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const incoming = dueAlarms
            .filter((item) => !existingIds.has(item.id))
            .map((item) => ({
              id: item.id,
              label: item.label,
              time: item.time,
              triggeredAt: now.getTime(),
            }));

          return [...incoming, ...prev];
        });

        updateAlarms((prevAlarms) =>
          prevAlarms.map((alarm) => {
            if (dueAlarms.some((dueAlarm) => dueAlarm.id === alarm.id)) {
              return { 
                ...alarm, 
                lastTriggeredDate: today,
                triggeredAt: now.getTime(),
              };
            }

            return alarm;
          })
        );
      }
    };

    checkForDueAlarms();
    const intervalId = setInterval(checkForDueAlarms, 1000);

    return () => clearInterval(intervalId);
  }, [alarms, updateAlarms]);

  const acknowledgeNotification = (id) => {
    const now = new Date();
    
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    
    updateAlarms((prevAlarms) =>
      prevAlarms.map((alarm) =>
        alarm.id === id
          ? { ...alarm, acknowledgedAt: now.getTime() }
          : alarm
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f5efe8] flex justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div>

          <h1 className="text-3xl font-bold text-orange-600">
            आमा-बुवा
          </h1>

          <p className="text-lg mt-2">
            नमस्ते, आमा 🙏
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="bg-white border border-green-200 rounded-2xl shadow-md p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <Bell size={18} />
              <span>नयाँ अलार्म सूचना (New Alarm Notification)</span>
            </div>

            {notifications.map((alarm) => (
              <div
                key={alarm.id}
                className="rounded-xl border border-green-100 bg-green-50 p-3"
              >
                <p className="font-semibold text-gray-800">{alarm.label}</p>
                <p className="text-sm text-gray-600">{alarm.time}</p>

                <button
                  onClick={() => acknowledgeNotification(alarm.id)}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl flex items-center justify-center gap-2 font-medium"
                >
                  <Check size={16} />
                  ठिक छ (Acknowledged)
                </button>
              </div>
            ))}
          </div>
        )}

        

        {/* Emergency Section */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
          <h2 className="text-xl font-bold text-red-600">
            आपकाल – EMERGENCY
          </h2>

          <p className="text-sm text-red-400">
            यदि तपाईलाई तुरुन्त मदत चाहिन्छ भने थिच्नुहोस्
          </p>

          <div className="flex justify-center">
            <button className="w-32 h-32 rounded-full bg-red-600 text-white text-xl font-bold shadow-lg flex items-center justify-center hover:bg-red-700 transition">
              SOS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}