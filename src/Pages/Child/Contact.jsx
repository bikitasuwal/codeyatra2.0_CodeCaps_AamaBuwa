import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Phone, MapPin, ChevronLeft, AlertCircle, 
  Plus, Trash2, Users, Save 
} from "lucide-react";

export default function Contact() { 
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Form states for new contact
  const [formData, setFormData] = useState({
    full_name: "",
    contact_number: "",
    address: "",
    relationship: "",
  });

  const API_URL = "http://10.5.5.143:5005";

  // Load user data from sessionStorage
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadContacts(parsedUser.id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const loadContacts = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/child-contacts/${userId}`);
      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading contacts:", error);
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

  const resetForm = () => {
    setFormData({
      full_name: "",
      contact_number: "",
      address: "",
      relationship: "",
    });
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/add-child-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: "✅ Contact added successfully!", type: "success" });
        
        // Reload contacts to show the new one
        await loadContacts(user.id);
        
        // Clear the form
        resetForm();
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({ text: data.message || "Failed to add contact", type: "error" });
      }
    } catch (error) {
      setMessage({
        text: "Network error. Make sure backend is running.",
        type: "error",
      });
      console.error("Error adding contact:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      const response = await fetch(`${API_URL}/api/delete-child-contact/${contactId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: "✅ Contact deleted successfully!", type: "success" });
        await loadContacts(user.id);
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
        <div className="text-orange-400 text-sm sm:text-base md:text-lg">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl">
        {/* Header with Back Button */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/child/home")}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronLeft size={24} className="text-orange-400" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-400">Emergency Contacts</h1>
        </div>

        {/* Info Card */}
        <div className="bg-[#111a2e] border border-[#1e2a45] rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 mb-5 sm:mb-6 md:mb-8">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="text-orange-400 flex-shrink-0 mt-1" size={18} />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-300">
                Add multiple emergency contacts
              </p>
              <p className="text-xs text-slate-400 mt-1 sm:mt-2">
                All contacts will be notified when SOS is activated
              </p>
            </div>
          </div>
        </div>

        {/* Add Contact Form */}
        <div className="bg-[#111a2e] border border-[#1e2a45] rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 mb-5 sm:mb-6 md:mb-8">
          <h2 className="text-lg font-semibold text-orange-400 mb-4">Add New Contact</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">Contact Number *</label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                placeholder="e.g., 9876543210"
                maxLength="10"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                required
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">Relationship (Optional)</label>
              <input
                type="text"
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                placeholder="e.g., Brother, Sister, Friend"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main St, City"
                rows="2"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
                required
              />
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
              className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Adding..." : "Add Contact"}
            </button>
          </form>
        </div>

        {/* Contacts List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
            <Users size={20} />
            Saved Contacts ({contacts.length})
          </h2>

          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-orange-500/50 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <User size={20} className="text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{contact.full_name}</h3>
                      {contact.relationship && (
                        <p className="text-xs text-orange-400">{contact.relationship}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>
                </div>

                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-slate-400" />
                    <span className="text-white">{contact.contact_number}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={16} className="text-slate-400 mt-1" />
                    <span className="text-white">{contact.address}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Added: {new Date(contact.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-2xl p-8 text-center">
              <Users className="mx-auto text-slate-500 mb-3" size={40} />
              <p className="text-slate-400">No contacts added yet</p>
              <p className="text-xs text-slate-500 mt-2">
                Add your first emergency contact above
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}