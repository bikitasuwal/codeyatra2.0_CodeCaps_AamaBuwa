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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
      <div className="w-full max-w-xl text-white">

        {/* Logo / Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-semibold text-orange-400 tracking-wide">
            आमा-बुबा
          </h1>
          <p className="mt-2 text-sm tracking-widest text-slate-400">
            AAMABUWA
          </p>
          <p className="mt-4 text-slate-300 italic">
            Care for your parents. Every day. From anywhere.
          </p>
          <div className="w-16 h-1 bg-orange-400 mx-auto mt-3 rounded-full"></div>
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
        <p className="text-sm text-slate-400 mb-4">I AM A...</p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Child / Caregiver */}
          <div
            onClick={() => setSelectedRole("child")}
            className={`p-6 rounded-xl border cursor-pointer transition-all duration-300
              ${
                selectedRole === "child"
                  ? "border-orange-400 bg-slate-800"
                  : "border-slate-700 hover:border-slate-500"
              }`}
          >
            <div className="text-4xl mb-4">👨</div>
            <h3 className="font-semibold">Child / Caregiver</h3>
            <p className="text-sm text-slate-400 mt-1">
              I care remotely
            </p>
          </div>

          {/* Parent / Elderly */}
          <div
            onClick={() => setSelectedRole("parent")}
            className={`p-6 rounded-xl border cursor-pointer transition-all duration-300
              ${
                selectedRole === "parent"
                  ? "border-orange-400 bg-slate-800"
                  : "border-slate-700 hover:border-slate-500"
              }`}
          >
            <div className="text-4xl mb-4">👵</div>
            <h3 className="font-semibold">Parent / Elderly</h3>
            <p className="text-sm text-slate-400 mt-1">
              Family takes care of me
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm text-slate-400 mb-2">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="bishal@aamabuwa.app"
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={!selectedRole || loading}
            className={`w-full py-3 rounded-lg font-medium transition
              ${
                selectedRole && !loading
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-slate-700 cursor-not-allowed"
              }`}
          >
            {loading ? "Logging in..." : "Continue"}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-400 hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}