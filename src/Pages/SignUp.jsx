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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-orange-600 tracking-wide">
            Create Account
          </h1>
          <p className="mt-2 text-xs sm:text-sm tracking-widest text-gray-600 font-semibold">
            AAMABUWA CARE NETWORK
          </p>
          <div className="w-12 sm:w-16 h-1 bg-orange-500 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-4 p-3 sm:p-4 rounded-lg text-xs sm:text-sm font-medium ${
            message.type === "success" 
              ? "bg-green-100 text-green-700 border border-green-300" 
              : "bg-red-100 text-red-700 border border-red-300"
          }`}>
            {message.text}
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-5 sm:mb-6 md:mb-8">
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 font-semibold tracking-wide">JOINING AS A...</p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {/* Caregiver */}
            <button
              type="button"
              onClick={() => setSelectedRole("caregiver")}
              className={`p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-300 bg-white
                ${
                  selectedRole === "caregiver"
                    ? "border-orange-500 shadow-lg scale-105"
                    : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                }`}
            >
              <User className="mx-auto mb-2 sm:mb-3 text-orange-500" size={32} />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg">Children</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Remote support
              </p>
            </button>

            {/* Parent */}
            <button
              type="button"
              onClick={() => setSelectedRole("parent")}
              className={`p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-300 bg-white
                ${
                  selectedRole === "parent"
                    ? "border-orange-500 shadow-lg scale-105"
                    : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                }`}
            >
              <Users className="mx-auto mb-2 sm:mb-3 text-orange-500" size={32} />
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg">Parent</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Live monitoring
              </p>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl shadow-md md:shadow-lg border border-gray-200">
          {/* Full Name */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-semibold">
              FULL NAME
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Your Name"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 text-sm sm:text-base"
            />
          </div>

          {/* Email */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-semibold">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@gmail.com"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 text-sm sm:text-base"
            />
          </div>

          {/* Password */}
          <div className="mb-5 sm:mb-6">
            <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-semibold">
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 text-sm sm:text-base"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedRole || loading}
            className={`w-full py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 text-white
              ${
                selectedRole && !loading
                  ? "bg-orange-500 hover:bg-orange-600 active:scale-95 shadow-md hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-gray-600 mt-5 sm:mt-6 md:mt-8">
          Already have an account?{" "}
          <Link to="/" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
} 