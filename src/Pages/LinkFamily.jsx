import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, ArrowLeft, Users, Mail, CheckCircle, XCircle } from "lucide-react";

export default function LinkFamily() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [caregiverEmail, setCaregiverEmail] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [relationship, setRelationship] = useState("Mother");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [availableParents, setAvailableParents] = useState([]);
  const [myParents, setMyParents] = useState([]);

  const API_URL = "http://10.5.5.143:5005";

  // Load user data on mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setCaregiverEmail(parsedUser.email);
      fetchAllParents();
      fetchMyLinkedParents(parsedUser.id);
    } else {
      navigate("/");
    }
  }, []);

  // Fetch all elderly users
  const fetchAllParents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      const data = await response.json();
      if (data.success) {
        // Filter only elderly users
        const elderlyUsers = data.users.filter(u => u.role === 'elderly');
        setAvailableParents(elderlyUsers);
      }
    } catch (error) {
      console.error("Error fetching parents:", error);
    }
  };

  // Fetch already linked parents
  const fetchMyLinkedParents = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/my-parents?user_id=${userId}`);
      const data = await response.json();
      if (data.success) {
        setMyParents(data.parents);
      }
    } catch (error) {
      console.error("Error fetching linked parents:", error);
    }
  };

  const handleLinkFamily = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(`${API_URL}/api/create-sample-family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiver_email: caregiverEmail,
          parent_email: parentEmail,
          relationship: relationship
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          text: data.message || "Family linked successfully!", 
          type: "success" 
        });
        // Refresh linked parents list
        if (user) {
          fetchMyLinkedParents(user.id);
          fetchAllParents(); // Refresh available parents
        }
        // Clear form
        setParentEmail("");
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ 
        text: "Network error. Make sure backend is running.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter out already linked parents from available list
  const unlinkedParents = availableParents.filter(parent => 
    !myParents.some(linked => linked.id === parent.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Link Form Section */}
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <div className="text-center mb-6">
              <Link2 className="mx-auto text-orange-400 mb-3" size={40} />
              <h1 className="text-2xl font-semibold text-orange-400">Link Family Member</h1>
              <p className="text-sm text-slate-400 mt-2">
                Connect with your parent
              </p>
            </div>

            {/* Current User Info */}
            {user && (
              <div className="bg-slate-900 p-4 rounded-xl mb-6 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">YOU ARE:</p>
                <p className="font-medium">{user.full_name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
                <p className="text-xs text-orange-400 mt-1">{user.role_display}</p>
              </div>
            )}

            {/* Message Display */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg text-sm flex items-start gap-3 ${
                message.type === "success" 
                  ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                  : "bg-red-500/20 text-red-400 border border-red-500/50"
              }`}>
                {message.type === "success" ? 
                  <CheckCircle size={20} className="flex-shrink-0" /> : 
                  <XCircle size={20} className="flex-shrink-0" />
                }
                <span>{message.text}</span>
              </div>
            )}

            {/* Link Form */}
            <form onSubmit={handleLinkFamily} className="space-y-5">
              
              {/* Caregiver Email (read-only) */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  YOUR EMAIL (CAREGIVER)
                </label>
                <input
                  type="email"
                  value={caregiverEmail}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300"
                />
              </div>

              {/* Parent Email Selection */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  SELECT PARENT
                </label>
                <select
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                >
                  <option value="">Choose a parent to link</option>
                  {unlinkedParents.map(parent => (
                    <option key={parent.id} value={parent.email}>
                      {parent.full_name} ({parent.email})
                    </option>
                  ))}
                </select>
                {unlinkedParents.length === 0 && (
                  <p className="text-xs text-amber-400 mt-2">
                    No unlinked parents available. All parents are already linked!
                  </p>
                )}
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  RELATIONSHIP
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Uncle">Uncle</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !parentEmail || unlinkedParents.length === 0}
                className="w-full py-3 rounded-lg font-medium bg-orange-500 hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? "Linking..." : "Link Family Member"}
              </button>
            </form>
          </div>

          {/* Already Linked Parents Section */}
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-orange-400" size={24} />
              <h2 className="text-xl font-semibold">Your Linked Parents</h2>
            </div>

            {myParents.length > 0 ? (
              <div className="space-y-3">
                {myParents.map(parent => (
                  <div key={parent.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-orange-400">{parent.relationship}</p>
                        <p className="text-lg">{parent.full_name}</p>
                        <p className="text-sm text-slate-400">{parent.email}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Linked
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto text-slate-600 mb-3" size={48} />
                <p className="text-slate-400">No parents linked yet</p>
                <p className="text-sm text-slate-500 mt-2">
                  Use the form to link your first parent
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}