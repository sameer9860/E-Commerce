import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiPieChart,
  FiUser,
  FiMail,
  FiShield,
  FiLogOut,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import API from "../api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meUser, setMeUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: "users", label: "Users", icon: FiUsers },
    { id: "transactions", label: "Transactions", icon: FiPieChart },
    { id: "profile", label: "Profile", icon: FiUser },
  ];

  const pendingVendors = useMemo(
    () => users.filter((u) => u.role === "vendor" && !u.is_approved),
    [users]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const me = await API.get("me/");
        if (!me.data.is_staff && !me.data.is_superuser) {
          alert("Admin access required.");
          navigate("/login");
          return;
        }
        setMeUser(me.data);
        setProfile(me.data);
        setProfileForm({
          email: me.data.email || "",
          first_name: me.data.first_name || "",
          last_name: me.data.last_name || "",
        });
        const res = await API.get("admin-users/");
        setUsers(res.data);
      } catch {
        alert("Please log in as an admin.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "transactions") {
      API.get("payments/")
        .then((res) => setPayments(res.data))
        .catch(() => setPayments([]));
    }
  }, [activeTab]);

  const approveVendor = async (id) => {
    try {
      await API.patch(`admin-users/${id}/`, { is_approved: true });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_approved: true } : u))
      );
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to approve vendor.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const saveProfile = async () => {
    try {
      setProfileSaving(true);
      const res = await API.patch("profile/", profileForm);
      setProfile(res.data);
      setProfileForm({
        email: res.data.email || "",
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
      });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const initials =
    `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`.toUpperCase() ||
    profile?.username?.[0]?.toUpperCase() ||
    "?";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eff0f5]">
      <Sidebar
        title="Admin Dashboard"
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={meUser?.username}
        role={meUser?.role || "admin"}
        onProfileClick={() => setActiveTab("profile")}
      />

      <main className="lg:ml-72 p-6 lg:p-10">
        {activeTab !== "profile" && (
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-6xl space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-4 py-2 rounded ${
                    activeTab === "users"
                      ? "bg-[#0a4692] text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`px-4 py-2 rounded ${
                    activeTab === "transactions"
                      ? "bg-[#0a4692] text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Transactions
                </button>
              </div>
            </div>

            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="font-semibold mb-3">
                    Pending vendor approvals ({pendingVendors.length})
                  </h2>
                  {pendingVendors.length === 0 ? (
                    <p className="text-sm text-gray-600">No pending vendors.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm bg-white rounded overflow-hidden">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Username</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingVendors.map((u) => (
                            <tr key={u.id} className="border-t">
                              <td className="px-4 py-2">{u.id}</td>
                              <td className="px-4 py-2">{u.username}</td>
                              <td className="px-4 py-2">{u.email || "—"}</td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => approveVendor(u.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                >
                                  Approve
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="font-semibold mb-3">All users</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm bg-white rounded overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">ID</th>
                          <th className="px-4 py-2 text-left">Username</th>
                          <th className="px-4 py-2 text-left">Role</th>
                          <th className="px-4 py-2 text-left">Approved</th>
                          <th className="px-4 py-2 text-left">Staff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-t">
                            <td className="px-4 py-2">{u.id}</td>
                            <td className="px-4 py-2">{u.username}</td>
                            <td className="px-4 py-2">{u.role}</td>
                            <td className="px-4 py-2">
                              {u.role === "vendor"
                                ? u.is_approved
                                  ? "Yes"
                                  : "No"
                                : "—"}
                            </td>
                            <td className="px-4 py-2">
                              {u.is_staff ? "Yes" : "No"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div>
                <h2 className="font-semibold mb-3">Transactions</h2>
                {payments.length === 0 ? (
                  <p className="text-sm text-gray-600">No payments found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm bg-white rounded overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Payment ID</th>
                          <th className="px-4 py-2 text-left">Order</th>
                          <th className="px-4 py-2 text-left">Customer</th>
                          <th className="px-4 py-2 text-left">Product</th>
                          <th className="px-4 py-2 text-left">Amount</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-t">
                            <td className="px-4 py-2">{p.id}</td>
                            <td className="px-4 py-2">
                              {p.order_id ?? p.order}
                            </td>
                            <td className="px-4 py-2">
                              {p.customer_username}
                            </td>
                            <td className="px-4 py-2">{p.product_name}</td>
                            <td className="px-4 py-2">Rs. {p.amount}</td>
                            <td className="px-4 py-2">{p.status}</td>
                            <td className="px-4 py-2">
                              {p.esewa_transaction_id || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && profile && (
          <div className="w-full max-w-2xl space-y-6 mx-auto">
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
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        Admin
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                      value={profileForm.first_name}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          first_name: e.target.value,
                        }))
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
                      value={profileForm.last_name}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          last_name: e.target.value,
                        }))
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
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="Email address"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:border-[#f85606] focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={saveProfile}
                disabled={profileSaving}
                className="mt-6 w-full bg-gradient-to-r from-[#f85606] to-[#e04d05] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#f85606]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {profileSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiShield size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

