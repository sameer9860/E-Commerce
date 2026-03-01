import { useState } from "react";
import API from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await API.post("token/", { username, password });
    localStorage.setItem("token", res.data.access);
    alert("Login successful!");
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input 
        type="text" 
        placeholder="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        className="w-full p-2 border rounded mb-2"
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="w-full p-2 border rounded mb-2"
      />
      <button 
        onClick={handleLogin} 
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
      >
        Login
      </button>
    </div>
  );
}
