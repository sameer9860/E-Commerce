import { useState } from "react";
import API from "../api";

export default function Checkout({ orderId, orderItems = [], total = "0.00" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`payment/${orderId}/`);
      window.location.href = res.request.responseURL;
    } catch {
      setError("Payment initiation failed. Please try again.");
      setLoading(false);
    }
  };

  const displayItems = orderItems.length > 0
    ? orderItems
    : [{ label: `Order #${orderId || "—"}`, value: `$${total}` }];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-700 text-center">
          <p className="text-sm text-gray-400 uppercase mb-1">Secure Checkout</p>
          <h2 className="text-2xl font-bold text-white">Review & Pay</h2>
        </div>

        <div className="p-6 space-y-2">
          {displayItems.map((item, idx) => (
            <div key={idx} className="flex justify-between text-gray-300 text-sm">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
          <div className="flex justify-between text-yellow-400 font-semibold text-lg border-t border-gray-700 pt-2">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-3"
          >
            {loading ? <span className="loader border-t-white border-gray-300" /> : "Pay with eSewa"}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <p className="text-gray-400 text-xs text-center uppercase">🔒 SSL encrypted · Powered by eSewa</p>
        </div>
      </div>
    </div>
  );
}