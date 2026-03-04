import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";
import API from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const endpoint =
        role === "customer"
          ? "auth/register/customer/"
          : "auth/register/vendor/";
      await API.post(endpoint, { username, email, password });
      toast.success(
        role === "customer"
          ? "Account created! Please login."
          : "Vendor request sent! Please wait for admin approval.",
      );
      navigate(role === "customer" ? "/login" : "/vendor-login");
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        Object.keys(errorData).forEach((key) => {
          toast.error(`${key}: ${errorData[key]}`);
        });
      } else {
        toast.error("Registration failed. Try a different username/email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6 mt-16 lg:mt-0">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-2xl space-y-8 border border-gray-100">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#f85606] hover:underline font-bold"
            >
              Login here
            </Link>
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "customer"
                  ? "border-[#f85606] bg-[#f85606]/5 text-[#f85606]"
                  : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
              }`}
            >
              <FiShoppingBag size={24} />
              <span className="text-sm font-bold">Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("vendor")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "vendor"
                  ? "border-[#0a4692] bg-[#0a4692]/5 text-[#0a4692]"
                  : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
              }`}
            >
              <FiTruck size={24} />
              <span className="text-sm font-bold">Vendor</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                Username*
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f85606] transition-colors">
                  <FiUser size={18} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-[#f85606] focus:bg-white transition-all"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                Email*
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f85606] transition-colors">
                  <FiMail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-[#f85606] focus:bg-white transition-all"
                  placeholder="Email address"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
              Password*
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f85606] transition-colors">
                <FiLock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-[#f85606] focus:bg-white transition-all"
                placeholder="Choose a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-black py-4 rounded-xl active:scale-[0.98] transition-all shadow-lg uppercase tracking-widest text-sm ${
              role === "customer"
                ? "bg-[#f85606] hover:bg-[#d04a05] shadow-[#f85606]/20"
                : "bg-[#0a4692] hover:bg-[#083a78] shadow-[#0a4692]/20"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              `Register as ${role}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
