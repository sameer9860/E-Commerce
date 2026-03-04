import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLogOut,
  FiSave,
  FiShield,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import API from "../api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });
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
        toast.error("Please login to view your profile.");
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
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#f85606] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials =
    `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() ||
    profile.username?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-[#f85606] to-[#0a4692] relative" />
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-10 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center text-2xl font-black text-[#f85606]">
                {initials}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
              >
                <FiLogOut size={14} /> Log Out
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-black text-gray-900">
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`.trim()
                    : profile.username}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    @{profile.username}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                      profile.role === "vendor"
                        ? "bg-purple-100 text-purple-700"
                        : profile.role === "admin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {profile.role}
                  </span>
                  {profile.role === "vendor" && (
                    <span
                      className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        profile.is_approved
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {profile.is_approved ? (
                        <>
                          <FiCheckCircle size={10} /> Approved
                        </>
                      ) : (
                        <>
                          <FiClock size={10} /> Pending
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiShield className="text-[#f85606]" /> Edit Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                First Name
              </label>
              <div className="relative">
                <FiUser
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={form.first_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, first_name: e.target.value }))
                  }
                  placeholder="First name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:border-[#f85606] focus:bg-white transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Last Name
              </label>
              <div className="relative">
                <FiUser
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={form.last_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, last_name: e.target.value }))
                  }
                  placeholder="Last name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:border-[#f85606] focus:bg-white transition-all text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="Email address"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:border-[#f85606] focus:bg-white transition-all text-sm"
                />
              </div>
            </div>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="mt-6 w-full bg-gradient-to-r from-[#f85606] to-[#e04d05] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#f85606]/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiSave size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
