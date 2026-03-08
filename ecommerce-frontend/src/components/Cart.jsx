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
            return { ...item, productDetail: productRes.data, included: true };
          }),
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

  const handleQuantityChange = async (id, delta) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) {
      await handleRemove(id);
      return;
    }

    // optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)),
    );

    try {
      await API.patch(`cart-items/${id}/`, { quantity: newQty });
    } catch {
      // revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: item.quantity } : i)),
      );
      alert("Could not update quantity. Please try again.");
    }
  };

  const total = items.reduce(
    (sum, item) =>
      item.included === false
        ? sum
        : sum + Number(item.productDetail.price) * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (items.length === 0) return;
    const includedItems = items.filter((i) => i.included !== false);
    if (includedItems.length === 0) {
      alert("Please include at least one item to proceed to checkout.");
      return;
    }
    setCheckingOut(true);
    const first = includedItems[0];
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
                {items.length > 1 && (
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#f85606]"
                    checked={item.included !== false}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === item.id
                            ? { ...i, included: e.target.checked }
                            : i,
                        ),
                      )
                    }
                  />
                )}
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
                  <img
                    src={
                      item.productDetail.image_display ||
                      `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop`
                    }
                    alt={item.productDetail.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {item.productDetail.name}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      Rs. {item.productDetail.price} each
                    </span>
                  </div>
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

