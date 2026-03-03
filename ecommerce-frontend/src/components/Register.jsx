import { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    alert(
      "Registration UI is ready. Wire this to your customer/vendor signup API when available."
    );
  };

  return (
    <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            Create your Shopora account
          </h2>
          <p className="text-sm text-gray-500">
            Sign up to start shopping and tracking your orders.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Username*</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#f85606]"
              placeholder="Choose a username"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Email*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#f85606]"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Password*</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#f85606]"
              placeholder="Create a password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#f85606] text-white font-bold py-3 rounded hover:bg-[#d04a05] transition-colors shadow-md uppercase tracking-wide"
          >
            SIGN UP
          </button>
        </form>
      </div>
    </div>
  );
}

