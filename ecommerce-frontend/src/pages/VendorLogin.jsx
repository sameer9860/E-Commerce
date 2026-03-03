import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function VendorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await API.post("token/", { username, password });
      localStorage.setItem("token", res.data.access);
      const me = await API.get("me/");
      if (me.data.role !== "vendor") {
        localStorage.removeItem("token");
        alert("This account is not a vendor.");
        return;
      }
      if (!me.data.is_approved) {
        alert("Vendor account is not approved yet. Ask admin to approve.");
      }
      navigate("/vendor");
    } catch {
      alert("Vendor login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Vendor Login</h2>
          <p className="text-sm text-gray-500">Login to manage your products and orders.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Username*</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0a4692]"
              placeholder="Vendor username"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Password*</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0a4692]"
              placeholder="Vendor password"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#0a4692] text-white font-bold py-4 rounded hover:bg-[#083a78] transition-colors shadow-md uppercase tracking-wide"
        >
          {loading ? "LOGGING IN..." : "LOGIN AS VENDOR"}
        </button>
      </div>
    </div>
  );
}

