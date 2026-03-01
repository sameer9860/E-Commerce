import { useState } from "react";
import API from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("token/", { username, password });
      localStorage.setItem("token", res.data.access);
      alert("Login successful!");
    } catch {
      alert("Login failed. Check credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome to DarazClone! Please login.
          </h2>
          <p className="text-sm text-gray-500">
            New member?{" "}
            <span className="text-blue-500 cursor-pointer">Register</span> here.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              Phone Number or Email*
            </label>
            <input
              type="text"
              placeholder="Please enter your Phone Number or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#f85606]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              Password*
            </label>
            <input
              type="password"
              placeholder="Please enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#f85606]"
            />
            <div className="text-right mt-1">
              <span className="text-xs text-blue-500 cursor-pointer">
                Forgot Password?
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-[#f85606] text-white font-bold py-4 rounded hover:bg-[#d04a05] transition-colors shadow-md uppercase tracking-wide"
        >
          LOGIN
        </button>
      </div>
    </div>
  );
}
