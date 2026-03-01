import { Link } from "react-router-dom";

export default function Cart() {
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
