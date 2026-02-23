import { useAlarms } from "../../context/AlarmContext";

const TIMEOUT_MINUTES = 10;
import { CheckCircle, Clock, Phone, Pill, ShoppingCart, User, LogOut, ChevronDown, Users, Link2, X, Mail, AlertCircle, AlertTriangle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const { alarms } = useAlarms();
  const [overdueAlerts, setOverdueAlerts] = useState([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState([]);
  const [escalatedAlerts, setEscalatedAlerts] = useState([]);

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

  useEffect(() => {
    const checkForEscalatedAlarms = () => {
      const now = Date.now();
      const escalatedAlarmKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('escalated_alarm_')
      );

      const escalated = escalatedAlarmKeys.map(key => {
        const data = JSON.parse(localStorage.getItem(key));
        return {
          ...data,
          id: data.id || key.replace('escalated_alarm_', ''),
          storageKey: key
        };
      });

      setEscalatedAlerts(escalated);
    };

    checkForEscalatedAlarms();
    const intervalId = setInterval(checkForEscalatedAlarms, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleCallParent = () => {
    window.location.href = "tel:+977-9876543210";
  };

  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [user, setUser] = useState(null);
  const [parent, setParent] = useState(null);
  const [parentHealth, setParentHealth] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasParent, setHasParent] = useState(false);

  // Link form states
  const [parentEmail, setParentEmail] = useState("");
  const [relationship, setRelationship] = useState("Mother");
  const [linkMessage, setLinkMessage] = useState({ text: "", type: "" });
  const [linking, setLinking] = useState(false);

  // Your backend URL
  const API_URL = "http://10.5.5.143:5005";

  // Get user data from sessionStorage when component mounts
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      checkChildStatus(parsedUser.id);
    } else {
      // If no user data, redirect to login
      navigate("/");
    }
  }, []);

  // Check if child already has a parent
  const checkChildStatus = async (childId) => {
    try {
      const response = await fetch(`${API_URL}/api/my-parents?user_id=${childId}`);
      const data = await response.json();

      if (data.success) {
        if (data.parents && data.parents.length > 0) {
          setHasParent(true);
          setParent(data.parents[0]);
          fetchParentHealth(data.parents[0].id);
          fetchParentTasks(data.parents[0].id, childId);
        } else {
          setHasParent(false);
          setParent(null);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error checking status:", error);
      setLoading(false);
    }
  };

  // Fetch parent's health status
  const fetchParentHealth = async (parentId) => {
    try {
      const response = await fetch(`${API_URL}/api/parent-health/${parentId}`);
      const data = await response.json();
      if (data.success) {
        setParentHealth(data.health);
      }
    } catch (error) {
      console.error("Error fetching health:", error);
    }
  };

  // Fetch tasks for this parent
  const fetchParentTasks = async (parentId, caregiverId) => {
    try {
      const response = await fetch(`${API_URL}/api/parent-tasks/${parentId}?caregiver_id=${caregiverId}`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Handle linking to a parent
  const handleLinkParent = async (e) => {
    e.preventDefault();
    setLinking(true);
    setLinkMessage({ text: "", type: "" });

    try {
      // First, get the parent ID from email
      const usersResponse = await fetch(`${API_URL}/api/users`);
      const usersData = await usersResponse.json();

      if (!usersData.success) {
        throw new Error("Could not fetch users");
      }

      // Find the parent by email
      const foundParent = usersData.users.find(
        u => u.email === parentEmail && u.role === 'elderly'
      );

      if (!foundParent) {
        setLinkMessage({
          text: "Parent not found with this email",
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
          caregiver_id: user.id,
          parent_id: foundParent.id,
          relationship: relationship
        })
      });

      const data = await response.json();

      if (data.success) {
        setLinkMessage({
          text: "✅ Parent linked successfully!",
          type: "success"
        });
        // Refresh status
        setTimeout(() => {
          setShowLinkForm(false);
          checkChildStatus(user.id);
          setParentEmail("");
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

  // Handle unlinking from parent
  const handleUnlinkParent = async () => {
    setLinking(true);

    try {
      const response = await fetch(`${API_URL}/api/remove-family-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiver_id: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowUnlinkConfirm(false);
        setParent(null);
        setParentHealth(null);
        setTasks([]);
        setHasParent(false);
        setLinkMessage({
          text: "Parent unlinked successfully",
          type: "success"
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error unlinking. Please try again.");
    } finally {
      setLinking(false);
    }
  };

  const handleLogout = () => {
    // Clear user data from sessionStorage
    sessionStorage.removeItem("user");
    navigate("/");
  };

  // Get initials from full name
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Calculate task completion
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Get only active (incomplete) tasks
  const activeTasks = tasks.filter(task => !task.completed);
  // Show only first 2 active tasks
  const displayedTasks = activeTasks.slice(0, 2);
  const hasMoreTasks = activeTasks.length > 2;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-orange-400 text-xl">Loading your family data...</div>
      </div>
    );
  }

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
                {user ? getInitials(user.full_name) : "U"}
              </div>
              <ChevronDown size={16} className="text-orange-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="py-3 px-4 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">{user?.full_name || "User"}</p>
                  <p className="text-xs text-slate-400 mt-1">{user?.email || "user@example.com"}</p>
                  <p className="text-xs text-orange-400 mt-1 capitalize">{user?.role_display || "Child / Caregiver"}</p>
                </div>

                {!hasParent && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowLinkForm(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-slate-800 transition"
                  >
                    <Link2 size={18} />
                    <span>Link to Parent</span>
                  </button>
                )}

                {hasParent && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowUnlinkConfirm(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition"
                  >
                    <X size={18} />
                    <span>Unlink from Parent</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition border-t border-slate-700"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
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

        {/* Escalated Medication Alert - CRITICAL */}
        {escalatedAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-red-950 to-purple-950 border-2 border-red-500 p-5 rounded-2xl animate-pulse shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="text-red-300 animate-bounce" size={32} />
              <div>
                <h3 className="text-lg font-bold text-red-100">
                  🚨 CRITICAL - Parent Ignored Reminders!
                </h3>
                <p className="text-sm text-red-300">
                  आमा has ignored 3 reminders. Immediate action needed!
                </p>
              </div>
            </div>

            {escalatedAlerts.map((alarm) => (
              <div
                key={alarm.id}
                className="bg-red-950/80 border-2 border-red-600 rounded-xl p-4 mb-3"
              >
                <p className="font-bold text-red-100 text-base">{alarm.label}</p>
                <p className="text-sm text-red-300 mt-1">Was scheduled at: {alarm.time}</p>
                <p className="text-xs text-red-400 mt-2">❌ Ignored all 3 reminders (😊 → 😐 → 😢)</p>
              </div>
            ))}

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCallParent}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition"
              >
                <Phone size={18} />
                CALL NOW
              </button>
              <button
                onClick={() => {
                  // Clear escalated alerts from localStorage
                  escalatedAlerts.forEach(alarm => {
                    localStorage.removeItem(`escalated_alarm_${alarm.id}`);
                  });
                  setEscalatedAlerts([]);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}

        {/* Unlink Confirmation Modal */}
        {showUnlinkConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-sm w-full">
              <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white text-center mb-2">Unlink from Parent?</h3>
              <p className="text-sm text-slate-400 text-center mb-6">
                Are you sure you want to unlink from {parent?.full_name}?
                This will remove all tasks and health data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnlinkConfirm(false)}
                  className="flex-1 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlinkParent}
                  disabled={linking}
                  className="flex-1 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
                >
                  {linking ? "Unlinking..." : "Unlink"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Link Parent Form - Shows inline when showLinkForm is true */}
        {showLinkForm && !hasParent && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-orange-500/50 relative">
            <button
              onClick={() => {
                setShowLinkForm(false);
                setLinkMessage({ text: "", type: "" });
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Mail className="text-orange-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Link to Your Parent</h3>
            </div>

            {linkMessage.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${linkMessage.type === "success"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-red-500/20 text-red-400 border border-red-500/50"
                }`}>
                {linkMessage.text}
              </div>
            )}

            <form onSubmit={handleLinkParent} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  PARENT'S EMAIL
                </label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter the email your parent used to register
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  RELATIONSHIP
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Grandfather">Grandfather</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={linking || !parentEmail}
                className="w-full py-3 rounded-lg font-medium bg-orange-500 hover:bg-orange-600 transition disabled:opacity-50"
              >
                {linking ? "Linking..." : "Link to Parent"}
              </button>
            </form>
          </div>
        )}

        {/* If no parents linked */}
        {!hasParent && !showLinkForm ? (
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
            <Users className="mx-auto text-slate-400 mb-3" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">No Parent Linked</h3>
            <p className="text-sm text-slate-400 mb-6">
              You haven't linked to any parent yet.
            </p>
            <button
              onClick={() => setShowLinkForm(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
            >
              Link to Your Parent
            </button>
          </div>
        ) : hasParent && parent ? (
          <>
            {/* Parent Status Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">
                    {parent.relationship || "Parent"}'s Status
                  </p>
                  <h2 className="text-lg font-semibold mt-3">
                    {parent.full_name}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {parent.relationship || "Parent"} ·
                    <span className="text-green-400 ml-1">● Live monitoring</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowUnlinkConfirm(true)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                  title="Unlink parent"
                >
                  <X size={18} />
                </button>
              </div>

  
            
            </div>

            {/* Tasks - Show only first 2 active tasks with See More button */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-slate-400 uppercase tracking-widest">
                  Active Tasks
                </p>
                {hasMoreTasks && (
                  <button
                    onClick={() => navigate('/child/task')}
                    className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <Eye size={14} />
                    See More ({activeTasks.length - 2} more)
                  </button>
                )}
              </div>

              <div className="mt-2 space-y-4">
                {displayedTasks.length > 0 ? (
                  displayedTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border ${
                          task.completed
                            ? "bg-orange-400 border-orange-400"
                            : "border-orange-400"
                        }`}
                      ></div>
                      <p className="text-sm text-white">{task.title}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No active tasks</p>
                )}
              </div>

              {activeTasks.length > 0 && (
                <button
                  onClick={() => navigate('/child/task')}
                  className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-lg text-sm transition flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View All Tasks
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">
                Quick Actions
              </p>

              <div className="grid grid-cols-2 gap-4">
                <QuickButton icon={<Phone size={18} />} label="Call आमा now" onClick={handleCallParent} />
                <QuickButton
                  icon={<Pill size={18} />}
                  label="Log Medicine"
                  onClick={() => navigate('/child/log')}
                />
                
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function QuickButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center hover:border-orange-400 transition"
    >
      <div className="text-orange-400">{icon}</div>
      <p className="text-sm mt-2 text-slate-300">{label}</p>
    </button>
  );
}