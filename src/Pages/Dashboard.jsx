import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  // Your backend URL
  const API_URL = "http://10.5.5.143:5005";

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setMessage({ text: "Please select a role", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Check if role matches
        const userRole = data.user.role;
        const selectedRoleType = selectedRole === "child" ? "caregiver" : "elderly";
        
        if (userRole !== selectedRoleType) {
          setMessage({ 
            text: `This account is registered as ${data.user.role_display}. Please select the correct role.`, 
            type: "error" 
          });
        } else {
          setMessage({ text: "Login successful! Redirecting...", type: "success" });
          
          // Store user data in sessionStorage (tab-specific)
          sessionStorage.setItem("user", JSON.stringify(data.user));
          
          // Redirect based on role
          setTimeout(() => {
            if (userRole === "caregiver") {
              navigate("/child/home");
            } else {
              navigate("/parent");
            }
          }, 1500);
        }
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ 
        text: "Connection error. Make sure backend is running at " + API_URL, 
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

        {/* Logo / Title */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-orange-600 tracking-wide">
            आमा-बुबा
          </h1>
          <p className="mt-2 text-xs sm:text-sm tracking-widest text-gray-600 font-semibold uppercase">
            AAMABUWA
          </p>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-gray-700 italic font-medium">
            Care for your parents. Every day. From anywhere.
          </p>
          <div className="w-12 sm:w-16 h-1 bg-orange-500 mx-auto mt-4 rounded-full"></div>
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
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 font-semibold uppercase tracking-wide">I AM A...</p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 mb-5 sm:mb-6 md:mb-8">
          {/* Child */}
          <div
            onClick={() => setSelectedRole("child")}
            className={`p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-300 bg-white
              ${
                selectedRole === "child"
                  ? "border-orange-500 shadow-lg scale-105"
                  : "border-gray-200 hover:border-orange-300 hover:shadow-md"
              }`}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">👨👩</div>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg">Guardian</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              I care remotely
            </p>
          </div>

          {/* Parent */}
          <div
            onClick={() => setSelectedRole("parent")}
            className={`p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-300 bg-white
              ${
                selectedRole === "parent"
                  ? "border-orange-500 shadow-lg scale-105"
                  : "border-gray-200 hover:border-orange-300 hover:shadow-md"
              }`}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">👵🧓</div>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg">Parent</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Family takes care of me
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl shadow-md md:shadow-lg border border-gray-200">
          {/* Email */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-semibold uppercase">
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
            <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-semibold uppercase">
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 text-sm sm:text-base"
            />
          </div>

          {/* Button */}
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
            {loading ? "Logging in..." : "Continue"}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-xs sm:text-sm text-gray-600 mt-5 sm:mt-6 md:mt-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}