import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiShoppingCart,
  FiPieChart,
  FiUser,
  FiMail,
  FiShield,
  FiLogOut,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import API from "../api";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: "orders", label: "My Orders", icon: FiShoppingCart },
    { id: "payments", label: "Payment History", icon: FiPieChart },
    { id: "profile", label: "Profile", icon: FiUser },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      toast.success("Payment successful! Your order has been confirmed.");
    } else if (params.get("payment") === "failed") {
      toast.error("Payment failed. Please try again.");
    }

    const load = async () => {
      try {
        const user = await API.get("me/");
        if (user.data.role !== "customer") {
          toast.error(
            "You must be logged in as a customer to view your dashboard.",
          );
          navigate("/login");
          return;
        }
        setMe(user.data);
        setProfile(user.data);
        setProfileForm({
          email: user.data.email || "",
          first_name: user.data.first_name || "",
          last_name: user.data.last_name || "",
        });
        const res = await API.get("orders/");
        setOrders(res.data);
      } catch {
        toast.error("Please log in as a customer to view your dashboard.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "payments") {
      API.get("payments/")
        .then((res) => setPayments(res.data))
        .catch(() => setPayments([]));
    }
  }, [activeTab]);

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
      <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#f85606] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eff0f5]">
      <Sidebar
        title="My Dashboard"
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={me?.username}
        role={me?.role}
        onProfileClick={() => setActiveTab("profile")}
      />

      <main className="lg:ml-72 p-6 lg:p-10">
        {activeTab === "orders" && (
          <>
            <h2 className="text-lg font-semibold text-gray-900">My Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-600">You have no orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">Qty</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Payment</th>
                      <th className="px-4 py-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="px-4 py-2">{o.id}</td>
                        <td className="px-4 py-2">
                          {o.product_name ?? o.product}
                        </td>
                        <td className="px-4 py-2">{o.quantity}</td>
                        <td className="px-4 py-2">{o.status}</td>
                        <td className="px-4 py-2">{o.payment_status ?? "—"}</td>
                        <td className="px-4 py-2">
                          {o.created_at
                            ? new Date(o.created_at).toLocaleString()
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "payments" && (
          <>
            <h2 className="text-lg font-semibold text-gray-900">
              Payment History
            </h2>
            {payments.length === 0 ? (
              <p className="text-gray-600">No payments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Order</th>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-4 py-2">{p.order_id ?? p.order}</td>
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
          </>
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
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Customer
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
