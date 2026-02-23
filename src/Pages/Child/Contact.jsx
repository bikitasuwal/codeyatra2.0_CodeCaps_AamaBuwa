import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, MapPin, ChevronLeft, Save, AlertCircle } from "lucide-react";

export default function Contact() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    contact_number: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const API_URL = "http://10.5.5.143:5005";

  // Load user data and existing contact info
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadContactInfo(parsedUser.id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const loadContactInfo = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/child-contact/${userId}`);
      const data = await response.json();

      if (data.success && data.contact) {
        setFormData({
          full_name: data.contact.full_name || "",
          contact_number: data.contact.contact_number || "",
          address: data.contact.address || "",
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading contact info:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setMessage({ text: "Full name is required", type: "error" });
      return false;
    }
    if (!formData.contact_number.trim()) {
      setMessage({ text: "Contact number is required", type: "error" });
      return false;
    }
    if (!/^\d{10}$/.test(formData.contact_number.replace(/[^\d]/g, ""))) {
      setMessage({ text: "Contact number must be 10 digits", type: "error" });
      return false;
    }
    if (!formData.address.trim()) {
      setMessage({ text: "Address is required", type: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/save-child-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          full_name: formData.full_name,
          contact_number: formData.contact_number,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: "✅ Contact information saved successfully!", type: "success" });
        setTimeout(() => {
          navigate("/child");
        }, 2000);
      } else {
        setMessage({ text: data.message || "Failed to save contact info", type: "error" });
      }
    } catch (error) {
      setMessage({
        text: "Network error. Make sure backend is running.",
        type: "error",
      });
      console.error("Error saving contact:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-orange-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center py-10 px-4">
      <div className="w-full max-w-md">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/child")}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronLeft size={24} className="text-orange-400" />
          </button>
          <h1 className="text-2xl font-bold text-orange-400">Emergency Contact</h1>
        </div>

        {/* Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="text-sm font-semibold text-gray-300">
                This information will be used for emergency SOS alerts
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Parents will see your contact details when they activate SOS
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <User size={18} className="text-orange-400" />
                Full Name
              </div>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            <p className="text-xs text-slate-400 mt-2">Your full name for identification</p>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-orange-400" />
                Contact Number
              </div>
            </label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              placeholder="e.g., 9876543210"
              maxLength="15"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            <p className="text-xs text-slate-400 mt-2">10-digit phone number for emergencies</p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-orange-400" />
                Address
              </div>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main St, Apt 4B, City, Country"
              rows="3"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
            />
            <p className="text-xs text-slate-400 mt-2">Your address for emergency responders</p>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-red-500/20 text-red-400 border border-red-500/50"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Contact Information"}
          </button>

          <p className="text-xs text-slate-500 text-center">
            This information is securely stored and used only for emergency situations
          </p>
        </form>
      </div>
    </div>
  );
}
