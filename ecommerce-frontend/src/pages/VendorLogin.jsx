import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import API from "../api";

export default function VendorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("token/", { username, password });
      localStorage.setItem("token", res.data.access);
      const me = await API.get("me/");
      if (me.data.role !== "vendor") {
        localStorage.removeItem("token");
        toast.error("This account is not a vendor.");
        return;
      }
      toast.success("Welcome back!");
      if (!me.data.is_approved) {
        toast.error("Your account is pending approval.", { duration: 5000 });
      }
      navigate("/vendor");
    } catch {
      toast.error("Vendor login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-md space-y-8 border border-gray-100 border-t-8 border-t-[#0a4692]">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Vendor Portal
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Manage your shop, orders, and products.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
              Username
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0a4692] transition-colors">
                <FiUser size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-[#0a4692] focus:bg-white transition-all shadow-sm"
                placeholder="Enter vendor username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0a4692] transition-colors">
                <FiLock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-[#0a4692] focus:bg-white transition-all shadow-sm"
                placeholder="Enter vendor password"
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
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#0a4692] text-white font-black py-4 rounded-xl hover:bg-[#083a78] active:scale-[0.98] transition-all shadow-lg shadow-[#0a4692]/20 uppercase tracking-widest text-sm"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Checking...</span>
            </div>
          ) : (
            "Login to Panel"
          )}
        </button>

        <div className="text-center pt-4 border-t border-gray-50">
          <Link
            to="/login"
            className="text-xs font-bold text-gray-400 hover:text-[#0a4692] transition-colors"
          >
            Not a vendor? Switch to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
