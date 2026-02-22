import { useState } from "react";
import { User, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Your backend URL - accessible to all team members
  const API_URL = "http://10.5.5.143:5005";

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setMessage({ text: "Please select a role", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          role: selectedRole === "caregiver" ? "caregiver" : "elderly"
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          text: "Registration successful! Redirecting...", 
          type: "success" 
        });
        setFormData({ full_name: "", email: "", password: "" });
        setSelectedRole(null);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ 
        text: "Cannot connect to server. Make sure backend is running at " + API_URL, 
        type: "error" 
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-orange-400">
            Create Account
          </h1>
          <p className="mt-3 text-sm tracking-widest text-gray-400">
            AAMABUWA CARE NETWORK
          </p>
          <div className="w-12 h-[2px] bg-orange-400 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success" 
              ? "bg-green-500/20 text-green-400 border border-green-500/50" 
              : "bg-red-500/20 text-red-400 border border-red-500/50"
          }`}>
            {message.text}
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 mb-4 tracking-wide">
            JOINING AS A...
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Caregiver */}
            <button
              type="button"
              onClick={() => setSelectedRole("caregiver")}
              className={`rounded-xl p-6 border transition-all duration-200 ${
                selectedRole === "caregiver"
                  ? "border-orange-400 bg-white/5"
                  : "border-gray-700 hover:border-gray-500"
              }`}
            >
              <User className="mx-auto mb-3 text-orange-400" size={40} />
              <h3 className="font-semibold">Caregiver</h3>
              <p className="text-xs text-gray-400 mt-1">
                Remote support
              </p>
            </button>

            {/* Parent */}
            <button
              type="button"
              onClick={() => setSelectedRole("parent")}
              className={`rounded-xl p-6 border transition-all duration-200 ${
                selectedRole === "parent"
                  ? "border-orange-400 bg-white/5"
                  : "border-gray-700 hover:border-gray-500"
              }`}
            >
              <Users className="mx-auto mb-3 text-orange-400" size={40} />
              <h3 className="font-semibold">Parent</h3>
              <p className="text-xs text-gray-400 mt-1">
                Daily monitoring
              </p>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              FULL NAME
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Your Name"
              required
              className="w-full rounded-lg bg-transparent border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              required
              className="w-full rounded-lg bg-transparent border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password"
              required
              className="w-full rounded-lg bg-transparent border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedRole || loading}
            className={`w-full py-3 rounded-lg font-medium transition ${
              selectedRole && !loading
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-orange-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}