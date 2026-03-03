import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("profile/");
        setProfile(res.data);
        setForm({
          email: res.data.email || "",
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
        });
      } catch {
        alert("Please login to view your profile.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const save = async () => {
    try {
      setSaving(true);
      const res = await API.patch("profile/", form);
      setProfile(res.data);
      alert("Profile updated.");
    } catch {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-600">
              {profile.username} · {profile.role}
              {profile.role === "vendor" && (
                <span className="ml-2">
                  ({profile.is_approved ? "approved" : "pending approval"})
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600 block mb-1">First name</label>
            <input
              value={form.first_name}
              onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
              className="w-full p-3 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#f85606]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Last name</label>
            <input
              value={form.last_name}
              onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
              className="w-full p-3 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#f85606]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600 block mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full p-3 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#f85606]"
            />
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-[#f85606] text-white font-bold py-3 rounded hover:bg-[#d04a05] transition-colors"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

