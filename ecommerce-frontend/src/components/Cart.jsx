import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await API.get("carts/");
        const cart = res.data[0];
        if (!cart || !cart.items || cart.items.length === 0) {
          setItems([]);
          return;
        }

        const enriched = await Promise.all(
          cart.items.map(async (item) => {
            const productRes = await API.get(`products/${item.product}/`);
            return { ...item, productDetail: productRes.data };
          })
        );
        setItems(enriched);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const handleRemove = async (id) => {
    await API.delete(`cart-items/${id}/`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const total = items.reduce(
    (sum, item) => sum + Number(item.productDetail.price) * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    const first = items[0];
    try {
      const res = await API.post("orders/", {
        product: first.product,
        quantity: first.quantity,
      });
      navigate(`/checkout/${res.data.id}`);
    } catch {
      alert("Checkout failed. Make sure you are logged in as a customer.");
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#eff0f5] flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-lg text-center space-y-6">
          <div className="text-6xl text-gray-200">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800">
            There are no items in this cart
          </h2>
          <Link
            to="/products"
            className="inline-block border border-[#f85606] text-[#f85606] font-bold px-10 py-3 rounded hover:bg-[#f85606] hover:text-white transition-all uppercase tracking-wide"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eff0f5] flex justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">🛒</span> Your Cart
        </h2>
        <div className="divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              className="py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {item.productDetail.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity} · Rs. {item.productDetail.price}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#f85606]">
                  Rs. {Number(item.productDetail.price) * item.quantity}
                </p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="mt-1 text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-[#f85606]">Rs. {total}</p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="bg-[#f85606] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#d04a05] transition-colors"
          >
            {checkingOut ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

