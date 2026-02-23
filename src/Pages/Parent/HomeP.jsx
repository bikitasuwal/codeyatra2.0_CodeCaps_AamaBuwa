import {
  Clock,
  Sun,
  Moon,
  CheckCircle,
  Check,
  Bell,
  AlertCircle,
  RefreshCw,
  Phone,
  PhoneCall,
  Link2,
  X,
  Mail,
  Users,
  LogOut,
  ChevronDown,
  User,
  Unlink
} from "lucide-react";
import { useAlarms } from "../../context/AlarmContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callingSOS, setCallingSOS] = useState(false);
  
  // Link form states
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [childEmail, setChildEmail] = useState("");
  const [linkMessage, setLinkMessage] = useState({ text: "", type: "" });
  const [linking, setLinking] = useState(false);
  const [hasChild, setHasChild] = useState(false);
  const [child, setChild] = useState(null);

  // Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const REMINDER_INTERVAL_MS = 1 * 1000;
  const MAX_REMINDERS = 3;
  const API_URL = "http://10.5.5.143:5005";

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

          if (reminderCount >= MAX_REMINDERS && !alarm.hasEscalated) {
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

    const retryIntervalId = setInterval(checkForReminderRetry, 5000);
    return () => clearInterval(retryIntervalId);
  }, [alarms, updateAlarms]);

  const acknowledgeNotification = (id) => {
    const now = new Date();
    
    setNotifications((prev) => prev.filter((item) => item.id !== id));
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

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Get user data from sessionStorage when component mounts
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      checkChildStatus(parsedUser.id);
      fetchEmergencyContacts(parsedUser.id);
    } else {
      navigate("/");
    }
  }, []);

  // Check if parent already has a child
  const checkChildStatus = async (parentId) => {
    try {
      const response = await fetch(`${API_URL}/api/my-children?user_id=${parentId}`);
      const data = await response.json();

      if (data.success) {
        if (data.children && data.children.length > 0) {
          setHasChild(true);
          setChild(data.children[0]);
        } else {
          setHasChild(false);
          setChild(null);
        }
      }
    } catch (error) {
      console.error("Error checking child status:", error);
    }
  };

  // Fetch emergency contacts from the child's added contacts
  const fetchEmergencyContacts = async (parentId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/parent-emergency-contacts/${parentId}`);
      const data = await response.json();
      
      if (data.success) {
        setEmergencyContacts(data.contacts);
        console.log("Found contacts:", data.contacts);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      setLoading(false);
    }
  };

  // Handle linking to a child
  const handleLinkChild = async (e) => {
    e.preventDefault();
    setLinking(true);
    setLinkMessage({ text: "", type: "" });

    try {
      // First, get the child ID from email
      const usersResponse = await fetch(`${API_URL}/api/users`);
      const usersData = await usersResponse.json();

      if (!usersData.success) {
        throw new Error("Could not fetch users");
      }

      // Find the child by email (role = 'caregiver')
      const foundChild = usersData.users.find(
        u => u.email === childEmail && u.role === 'caregiver'
      );

      if (!foundChild) {
        setLinkMessage({
          text: "Child not found with this email",
          type: "error"
        });
        setLinking(false);
        return;
      }

      // Now link using IDs
      const response = await fetch(`${API_URL}/api/add-family-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiver_id: foundChild.id,  // Child's ID
          parent_id: user.id,            // Parent's ID
          relationship: "parent"
        })
      });

      const data = await response.json();

      if (data.success) {
        setLinkMessage({
          text: "✅ Child linked successfully!",
          type: "success"
        });
        // Refresh status
        setTimeout(() => {
          setShowLinkForm(false);
          checkChildStatus(user.id);
          fetchEmergencyContacts(user.id);
          setChildEmail("");
          setLinkMessage({ text: "", type: "" });
        }, 2000);
      } else {
        setLinkMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setLinkMessage({
        text: "Network error. Make sure backend is running.",
        type: "error"
      });
    } finally {
      setLinking(false);
    }
  };

  // Handle unlinking from child
  const handleUnlinkChild = async () => {
    setLinking(true);
    
    try {
      // First find the child's ID from the child state
      if (!child) {
        alert("No child to unlink");
        setLinking(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/remove-family-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiver_id: child.id  // Child's ID
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowUnlinkConfirm(false);
        setHasChild(false);
        setChild(null);
        setEmergencyContacts([]); // Clear emergency contacts
        setLinkMessage({
          text: "✅ Child unlinked successfully!",
          type: "success"
        });
        
        setTimeout(() => {
          setLinkMessage({ text: "", type: "" });
        }, 3000);
      } else {
        setLinkMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setLinkMessage({
        text: "Error unlinking. Please try again.",
        type: "error"
      });
    } finally {
      setLinking(false);
    }
  };

  // DIRECT PHONE CALL SOS FUNCTION
  const handleEmergencyCall = (phoneNumber, contactName) => {
    const confirmCall = window.confirm(
      `🚨 आपतकालिन! 🚨\n\n` +
      `के तपाईं ${contactName} लाई फोन गर्न चाहनुहुन्छ?\n` +
      `Do you want to call ${contactName}?\n\n` +
      `नम्बर: ${phoneNumber}`
    );
    
    if (confirmCall) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  // SOS Handler - Calls the first emergency contact
  const handleSOS = () => {
    if (emergencyContacts.length === 0) {
      alert(
        "⚠️ कुनै सम्पर्क नम्बर छैन!\n\n" +
        "No emergency contacts found!\n" +
        "कृपया आफ्नो छोरा/छोरीलाई सम्पर्क नम्बर थप्न भन्नुहोस्।\n" +
        "Please ask your child to add contact numbers."
      );
      return;
    }

    setCallingSOS(true);

    if (emergencyContacts.length === 1) {
      handleEmergencyCall(emergencyContacts[0].contact_number, emergencyContacts[0].full_name);
    } else {
      const contactOptions = emergencyContacts.map((contact, index) => {
        return `${index + 1}. ${contact.full_name} (${contact.relationship || 'सम्पर्क'}) - ${contact.contact_number}`;
      }).join('\n');
      
      const choice = prompt(
        `🚨 आपतकालिन! धेरै सम्पर्कहरू छन्\n\n` +
        `Emergency! Multiple contacts found\n\n` +
        `${contactOptions}\n\n` +
        `कसलाई फोन गर्ने? (नम्बर टाइप गर्नुहोस्)\n` +
        `Who to call? (Enter number):`,
        "1"
      );
      
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < emergencyContacts.length) {
        handleEmergencyCall(emergencyContacts[index].contact_number, emergencyContacts[index].full_name);
      }
    }

    setCallingSOS(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  // Get initials from full name
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "शुभ प्रभात (Good morning)";
    if (hour < 17) return "शुभ दिउँसो (Good afternoon)";
    return "शुभ साँझ (Good evening)";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5efe8] flex items-center justify-center">
        <div className="text-orange-600 text-xl">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5efe8] flex justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header with Profile Dropdown */}
        <div className="flex justify-between items-center relative">
          <h1 className="text-3xl font-bold text-orange-600">
            आमा-बुवा
          </h1>

          {/* Profile Icon with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 border border-orange-600 rounded-full pl-2 pr-1 py-1 hover:bg-orange-100 transition"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-orange-600 font-medium">
                {user ? getInitials(user.full_name) : "P"}
              </div>
              <ChevronDown size={16} className="text-orange-600" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="py-3 px-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-800">{user?.full_name || "User"}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.email || "user@example.com"}</p>
                  <p className="text-xs text-orange-600 mt-1 capitalize">{user?.role_display || "Parent / Elderly"}</p>
                </div>

                {!hasChild && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowLinkForm(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Link2 size={18} />
                    <span>Link to Child</span>
                  </button>
                )}

                {hasChild && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowUnlinkConfirm(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition"
                  >
                    <Unlink size={18} />
                    <span>Unlink from Child</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition border-t border-gray-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Greeting */}
        <div>
          <p className="text-lg mt-2">
            नमस्ते, {user?.full_name?.split(' ')[0] || 'आमा'} 🙏
          </p>
          <p className="text-gray-500">
            {getGreeting()}
          </p>
        </div>

        {/* Child Status Display */}
        {hasChild && child && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-green-600" />
                <p className="text-sm font-semibold text-green-600">
                  Linked Child
                </p>
              </div>
              <button
                onClick={() => setShowUnlinkConfirm(true)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                title="Unlink child"
              >
                <Unlink size={14} />
                Unlink
              </button>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="font-medium text-gray-800">{child.full_name}</p>
              <p className="text-xs text-gray-500">{child.email}</p>
            </div>
          </div>
        )}

        {/* Unlink Confirmation Modal */}
        {showUnlinkConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-red-200 p-6 max-w-sm w-full shadow-xl">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Unlink from Child?</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to unlink from {child?.full_name}? 
                This will remove all emergency contacts and health data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnlinkConfirm(false)}
                  className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlinkChild}
                  disabled={linking}
                  className="flex-1 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 font-medium"
                >
                  {linking ? "Unlinking..." : "Unlink"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Link Child Form */}
        {showLinkForm && !hasChild && (
          <div className="bg-white border border-orange-300 rounded-2xl p-6 relative shadow-lg">
            <button
              onClick={() => {
                setShowLinkForm(false);
                setLinkMessage({ text: "", type: "" });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Mail className="text-orange-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Link to Your Child</h3>
            </div>

            {linkMessage.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                linkMessage.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}>
                {linkMessage.text}
              </div>
            )}

            <form onSubmit={handleLinkChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CHILD'S EMAIL
                </label>
                <input
                  type="email"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  placeholder="child@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the email your child used to register
                </p>
              </div>

              <button
                type="submit"
                disabled={linking || !childEmail}
                className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition disabled:opacity-50"
              >
                {linking ? "Linking..." : "Link to Child"}
              </button>
            </form>
          </div>
        )}

        {/* No Child Linked Message */}
        {!hasChild && !showLinkForm && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
            <Users className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Child Linked</h3>
            <p className="text-sm text-gray-500 mb-4">
              You haven't linked to any child yet.
            </p>
            <button
              onClick={() => setShowLinkForm(true)}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
            >
              Link to Your Child
            </button>
          </div>
        )}

        {/* Emergency Contacts Display */}
        {emergencyContacts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <PhoneCall size={18} className="text-blue-600" />
              <p className="text-sm font-semibold text-blue-600">
                आपतकालिन सम्पर्कहरू (Emergency Contacts)
              </p>
            </div>
            <div className="space-y-2">
              {emergencyContacts.map((contact, index) => (
                <div 
                  key={contact.id || index} 
                  className="flex items-center justify-between text-sm bg-white p-2 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-gray-700">{contact.full_name}</span>
                    {contact.relationship && (
                      <span className="text-xs text-blue-500 ml-2">({contact.relationship})</span>
                    )}
                    <div className="text-xs text-gray-500">{contact.contact_number}</div>
                  </div>
                  <button
                    onClick={() => handleEmergencyCall(contact.contact_number, contact.full_name)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition flex items-center gap-1"
                  >
                    <Phone size={12} />
                    Call
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <div className="bg-white border border-green-200 rounded-2xl shadow-md p-4 space-y-3">
            {notifications.some(n => !n.isReminder) && (
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <Bell size={18} />
                <span>नयाँ अलार्म सूचना (New Alarm Notification)</span>
              </div>
            )}

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
                  case 1: return "😊";
                  case 2: return "😐";
                  case 3: return "😢";
                  default: return "😊";
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
                        <span className="text-3xl">{getEmojiForReminder()}</span>
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

          {emergencyContacts.length === 0 && (
            <p className="text-xs text-red-500 bg-red-100 p-2 rounded-lg">
              ⚠️ कुनै सम्पर्क नम्बर छैन | No emergency contacts found
            </p>
          )}

          <div className="flex justify-center">
            <button 
              onClick={handleSOS}
              disabled={emergencyContacts.length === 0 || callingSOS}
              className={`w-32 h-32 rounded-full text-white text-xl font-bold shadow-lg flex items-center justify-center transition ${
                emergencyContacts.length === 0 || callingSOS
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 animate-pulse'
              }`}
            >
              {callingSOS ? '...' : 'SOS'}
            </button>
          </div>

          {emergencyContacts.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {emergencyContacts.length} सम्पर्कहरू तयार छन् | {emergencyContacts.length} contacts ready
            </p>
          )}
        </div>

        {/* Click outside to close dropdown */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    </div>
  );
}