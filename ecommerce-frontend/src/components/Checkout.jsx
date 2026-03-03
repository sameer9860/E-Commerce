import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

export default function Checkout() {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`orders/${orderId}/`);
        setOrder(res.data);
      } catch (err) {
        setError("Could not load order details.");
      } finally {
        setFetching(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`payment/initiate/${orderId}/`);
      if (res.data && res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error(err);
      setError("Payment initiation failed. Please try again.");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const amount = order ? order.product_price * order.quantity : "0.00";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-700 text-center">
          <p className="text-sm text-gray-400 uppercase mb-1">
            Secure Checkout
          </p>
          <h2 className="text-2xl font-bold text-white">Review & Pay</h2>
        </div>

        <div className="p-6 space-y-2">
          {order && (
            <div className="flex justify-between text-gray-300 text-sm">
              <span>
                {order.product_name} x {order.quantity}
              </span>
              <span>Rs. {amount}</span>
            </div>
          )}
          <div className="flex justify-between text-yellow-400 font-semibold text-lg border-t border-gray-700 pt-2">
            <span>Total</span>
            <span>Rs. {amount}</span>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-3">
          <button
            onClick={handlePayment}
            disabled={loading || !order}
            className="bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <span className="loader border-t-white border-gray-300" />
            ) : (
              "Pay with eSewa"
            )}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <p className="text-gray-400 text-xs text-center uppercase">
            🔒 SSL encrypted · Powered by eSewa
          </p>
        </div>
      </div>
    </div>
  );
}
