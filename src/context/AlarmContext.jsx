import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ALARM_STORAGE_KEY = "aamabuwa_parent_alarms";

const AlarmContext = createContext(null);

const readAlarmsFromStorage = () => {
  const stored = localStorage.getItem(ALARM_STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(ALARM_STORAGE_KEY);
    return [];
  }
};

export function AlarmProvider({ children }) {
  const [alarms, setAlarms] = useState(() => readAlarmsFromStorage());

  useEffect(() => {
    localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === ALARM_STORAGE_KEY) {
        setAlarms(readAlarmsFromStorage());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addAlarm = ({ time, label }) => {
    const cleanLabel = label.trim();
    if (!cleanLabel) return;

    setAlarms((prev) => [
      ...prev,
      {
        id: Date.now(),
        time,
        label: cleanLabel,
        enabled: true,
        lastTriggeredDate: null,
        triggeredAt: null,
        acknowledgedAt: null,
      },
    ]);
  };

  const deleteAlarm = (id) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
  };

  const toggleAlarm = (id) => {
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );
  };

  const updateAlarms = (updater) => {
    setAlarms((prev) => (typeof updater === "function" ? updater(prev) : prev));
  };

  const value = useMemo(
    () => ({
      alarms,
      addAlarm,
      deleteAlarm,
      toggleAlarm,
      updateAlarms,
    }),
    [alarms]
  );

  return <AlarmContext.Provider value={value}>{children}</AlarmContext.Provider>;
}

export function useAlarms() {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error("useAlarms must be used inside AlarmProvider");
  }

  return context;
}
