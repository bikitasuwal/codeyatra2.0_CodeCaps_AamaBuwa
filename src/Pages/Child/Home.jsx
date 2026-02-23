import { useAlarms } from "../../context/AlarmContext";

const TIMEOUT_MINUTES = 1;
import { CheckCircle, Clock, Phone, Pill, ShoppingCart, User, LogOut, ChevronDown, Users, Link2, X, Mail, AlertCircle, AlertTriangle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const { alarms } = useAlarms();
  const [overdueAlerts, setOverdueAlerts] = useState([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState([]);
  const [dismissedAlarmIds, setDismissedAlarmIds] = useState(new Set());

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

  const handleDismissAlert = () => {
    const newDismissed = new Set(dismissedAlarmIds);
    overdueAlerts.forEach(alarm => newDismissed.add(alarm.id));
    setDismissedAlarmIds(newDismissed);
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
    <div className="min-h-screen bg-slate-950 flex justify-center py-4 sm:py-6 md:py-8 lg:py-10 px-3 sm:px-4 md:px-6">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl space-y-4 sm:space-y-5 md:space-y-6">

        {/* Header with Profile Dropdown */}
        <div className="flex justify-between items-center relative sticky top-0 z-50 bg-slate-950 py-2 sm:py-3">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-400">आमा-बुवा</h1>

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
          <div className="bg-green-900 border-2 border-green-600 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-400 flex-shrink-0" size={28} />
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-green-200">
                  Medication Taken! ✓
                </h3>
                <p className="text-xs sm:text-sm text-green-300">
                  आमा has confirmed taking the medication
                </p>
              </div>
            </div>

            {acknowledgedAlerts.map((alarm) => (
              <div
                key={alarm.id}
                className="bg-green-950 border border-green-700 rounded-lg sm:rounded-xl p-3 sm:p-4"
              >
                <p className="font-semibold text-sm sm:text-base text-green-200">{alarm.label}</p>
                <p className="text-xs sm:text-sm text-green-400">Scheduled: {alarm.time} • Taken ✓</p>
              </div>
            ))}
          </div>
        )}

        {/* Overdue Medication Alert */}
        {overdueAlerts.filter(a => !dismissedAlarmIds.has(a.id)).length > 0 && (
          <div className="bg-red-900 border-2 border-red-600 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl animate-pulse">
            <div className="flex items-center gap-3 mb-4 justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-400 flex-shrink-0" size={28} />
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-red-200">
                    Medication Not Taken!
                  </h3>
                  <p className="text-xs sm:text-sm text-red-300">
                    आमा has not confirmed medication for 10+ minutes
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismissAlert}
                className="p-2 hover:bg-red-800 rounded-lg transition flex-shrink-0"
                title="Dismiss alert"
              >
                <X size={20} className="text-red-400" />
              </button>
            </div>

            {overdueAlerts.filter(a => !dismissedAlarmIds.has(a.id)).map((alarm) => (
              <div
                key={alarm.id}
                className="bg-red-950 border border-red-700 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3"
              >
                <p className="font-semibold text-sm sm:text-base text-red-200">{alarm.label}</p>
                <p className="text-xs sm:text-sm text-red-400">Scheduled: {alarm.time}</p>
              </div>
            ))}

            <button
              onClick={handleCallParent}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 font-bold mt-4 text-sm sm:text-base transition-all active:scale-95"
            >
              Call Now
            </button>
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
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-800">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                    {parent.relationship || "Parent"}'s Status
                  </p>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-3 text-slate-100">
                    {parent.full_name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2">
                    {parent.relationship || "Parent"} ·
                    <span className="text-green-400 ml-1">● Live monitoring</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowUnlinkConfirm(true)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition flex-shrink-0"
                  title="Unlink parent"
                >
                  <X size={18} />
                </button>
              </div>

              

              {/* Health Stats */}
              {parentHealth?.blood_pressure && parentHealth.blood_pressure !== "Not recorded" && (
                <div className="mt-4 sm:mt-5 md:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-slate-900 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400 font-semibold">Blood Pressure</p>
                    <p className="text-sm sm:text-base font-medium text-white mt-1">{parentHealth.blood_pressure}</p>
                  </div>
                  <div className="bg-slate-900 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400 font-semibold">Blood Sugar</p>
                    <p className="text-sm sm:text-base font-medium text-white mt-1">{parentHealth.blood_sugar}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tasks - Show only first 2 active tasks with See More button */}
            <div className="bg-slate-900 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
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

              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                {displayedTasks.length > 0 ? (
                  displayedTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex-shrink-0 ${
                          task.completed
                            ? "bg-orange-400 border-orange-400"
                            : "border-orange-400"
                        }`}
                      ></div>
                      <p className="text-xs sm:text-sm text-white">{task.title}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400 text-center py-4">No active tasks</p>
                )}
              </div>

              {activeTasks.length > 0 && (
                <button
                  onClick={() => navigate('/child/task')}
                  className="w-full mt-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-lg text-xs sm:text-sm transition flex items-center justify-center gap-2 font-medium"
                >
                  <Eye size={16} />
                  View All Tasks
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">
                Quick Actions
              </p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
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
      className="bg-slate-900 border border-slate-800 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl flex flex-col items-center justify-center hover:border-orange-400 hover:bg-slate-800 transition active:scale-95"
    >
      <div className="text-orange-400">{icon}</div>
      <p className="text-xs sm:text-sm md:text-base mt-2 sm:mt-3 text-slate-300 font-medium">{label}</p>
    </button>
  );
} 