import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiShoppingCart, FiPieChart } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import API from "../api";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { id: "orders", label: "My Orders", icon: FiShoppingCart },
    { id: "payments", label: "Payment History", icon: FiPieChart },
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
      </main>
    </div>
  );
}
