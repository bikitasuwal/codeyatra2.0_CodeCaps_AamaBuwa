import {
  Clock,
  Sun,
  Moon,
  CheckCircle,
  Check,
  Bell,
  AlertCircle,
  RefreshCw,
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
  const REMINDER_INTERVAL_MS = 1 * 1000;
  const MAX_REMINDERS = 3;

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
              retryCount: 1,
              isReminder: false,
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
                reminderCount: 1,
                lastReminderTime: now.getTime(),
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

  useEffect(() => {
    const checkForReminderRetry = () => {
      const now = Date.now();

      updateAlarms((prevAlarms) =>
        prevAlarms.map((alarm) => {
          if (!alarm.triggeredAt || alarm.acknowledgedAt) {
            return alarm;
          }

          const reminderCount = alarm.reminderCount || 1;
          const lastReminderTime = alarm.lastReminderTime || alarm.triggeredAt;
          const timeSinceLastReminder = now - lastReminderTime;

          if (reminderCount < MAX_REMINDERS && timeSinceLastReminder >= REMINDER_INTERVAL_MS) {
            // Update the existing notification with new reminderCount and mark as reminder
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === alarm.id
                  ? { ...notif, retryCount: reminderCount + 1, isReminder: true }
                  : notif
              )
            );

            return {
              ...alarm,
              reminderCount: reminderCount + 1,
              lastReminderTime: now,
            };
          }

          // Escalate immediately when 3rd reminder is reached (if not already escalated)
          if (reminderCount >= MAX_REMINDERS && !alarm.hasEscalated) {
            // Update notification to show escalation status
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === alarm.id
                  ? { ...notif, isEscalated: true }
                  : notif
              )
            );

            const escalatedAlarm = {
              id: alarm.id,
              label: alarm.label,
              time: alarm.time,
              escalatedAt: now,
              originalAlarmId: alarm.id,
            };
            
            localStorage.setItem(
              `escalated_alarm_${alarm.id}`,
              JSON.stringify(escalatedAlarm)
            );

            return {
              ...alarm,
              hasEscalated: true,
            };
          }

          return alarm;
        })
      );
    };

    const retryIntervalId = setInterval(checkForReminderRetry, 30000);

    return () => clearInterval(retryIntervalId);
  }, [alarms, updateAlarms]);

  const acknowledgeNotification = (id) => {
    const now = new Date();
    
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    
    // Clear escalated alarm from localStorage
    localStorage.removeItem(`escalated_alarm_${id}`);
    
    updateAlarms((prevAlarms) =>
      prevAlarms.map((alarm) =>
        alarm.id === id
          ? { 
              ...alarm, 
              acknowledgedAt: now.getTime(),
              triggeredAt: null,
              reminderCount: 0,
              lastReminderTime: null,
              hasEscalated: false,
            }
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
            {/* Initial Notification */}
            {notifications.some(n => !n.isReminder) && (
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <Bell size={18} />
                <span>नयाँ अलार्म सूचना (New Alarm Notification)</span>
              </div>
            )}

            {/* Reminder Notification Header */}
            {notifications.some(n => n.isReminder) && (
              <div className="flex items-center gap-2 text-orange-600 font-semibold">
                <RefreshCw size={18} className="animate-spin" />
                <span>⏰ अनुस्मारक - पुनः सूचना (REMINDER - Follow-up Alert)</span>
              </div>
            )}

            {notifications.map((alarm) => {
              const getEmojiForReminder = () => {
                if (!alarm.isReminder) return null;
                switch (alarm.retryCount) {
                  case 1:
                    return "😊";
                  case 2:
                    return "😐";
                  case 3:
                    return "😢";
                  default:
                    return "😊";
                }
              };

              return (
                <div
                  key={alarm.id}
                  className={`rounded-xl border p-3 ${
                    alarm.isReminder
                      ? "border-orange-300 bg-orange-50"
                      : "border-green-100 bg-green-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{alarm.label}</p>
                        {alarm.isReminder && (
                          <AlertCircle size={16} className="text-orange-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{alarm.time}</p>
                    </div>
                    {alarm.isReminder && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-3xl">
                          {getEmojiForReminder()}
                        </span>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-orange-500 text-white">
                          #{alarm.retryCount}/{MAX_REMINDERS}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => acknowledgeNotification(alarm.id)}
                    className={`mt-3 w-full py-2 rounded-xl flex items-center justify-center gap-2 font-medium ${
                      alarm.isReminder
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    <Check size={16} />
                    {alarm.isReminder
                      ? alarm.retryCount === 3
                        ? "Last Chance - Acknowledge!"
                        : "Acknowledged"
                      : "ठिक छ (Acknowledged)"}
                  </button>
                </div>
              );
            })}
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