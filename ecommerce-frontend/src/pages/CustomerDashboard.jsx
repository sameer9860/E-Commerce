import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const me = await API.get("me/");
        if (me.data.role !== "customer") {
          alert("You must be logged in as a customer to view your dashboard.");
          navigate("/login");
          return;
        }
        const res = await API.get("orders/");
        setOrders(res.data);
      } catch {
        alert("Please log in as a customer to view your dashboard.");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded ${
                activeTab === "orders"
                  ? "bg-[#f85606] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 rounded ${
                activeTab === "payments"
                  ? "bg-[#f85606] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Payment History
            </button>
          </div>
        </div>

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
                        <td className="px-4 py-2">
                          {o.payment_status ?? "—"}
                        </td>
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
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
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
                        <td className="px-4 py-2">${p.amount}</td>
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
      </div>
    </div>
  );
}


