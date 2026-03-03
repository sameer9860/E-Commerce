import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
                          {u.role === "vendor" ? (u.is_approved ? "Yes" : "No") : "—"}
                        </td>
                        <td className="px-4 py-2">{u.is_staff ? "Yes" : "No"}</td>
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
                        <td className="px-4 py-2">{p.order_id ?? p.order}</td>
                        <td className="px-4 py-2">{p.customer_username}</td>
                        <td className="px-4 py-2">{p.product_name}</td>
                        <td className="px-4 py-2">Rs. {p.amount}</td>
                        <td className="px-4 py-2">{p.status}</td>
                        <td className="px-4 py-2">{p.esewa_transaction_id || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

