import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    API.get("products/").then((res) => setProducts(res.data));
  }, []);

  const ensureCartExists = async () => {
    try {
      await API.post("carts/", {});
    } catch {
      // cart may already exist; ignore errors here
    }
  };

  const handleAddToCart = async (productId) => {
    setAddingId(productId);
    await ensureCartExists();
    try {
      await API.post("cart-items/", { product: productId, quantity: 1 });
      alert("Added to cart");
    } catch {
      alert("Could not add to cart. Make sure you are logged in as a customer.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#eff0f5] p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4 px-2 border-l-4 border-[#f85606]">
          FLASH SALE
        </h2>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="bg-white text-gray-900 overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <Link to={`/products/${p.id}`}>
                <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
                  <span className="text-4xl group-hover:scale-110 transition-transform">
                    📦
                  </span>
                </div>
              </Link>

              <div className="p-3 flex flex-col h-40 justify-between">
                <div>
                  <Link to={`/products/${p.id}`}>
                    <h3 className="text-sm line-clamp-2 leading-tight hover:text-[#f85606] transition-colors">
                      {p.name}
                    </h3>
                  </Link>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs text-yellow-500">★★★★★</span>
                    <span className="text-[10px] text-gray-400">(0)</span>
                  </div>
                </div>

                <div className="mt-auto space-y-1">
                  <div className="text-lg font-bold text-[#f85606]">
                    Rs. {p.price}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] line-through text-gray-400">
                      Rs. {(parseFloat(p.price) * 1.2).toFixed(0)}
                    </span>
                    <span className="text-[10px] text-gray-700">-20%</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(p.id)}
                    disabled={addingId === p.id}
                    className="mt-1 w-full bg-[#f85606] text-white text-xs font-semibold py-1.5 rounded hover:bg-[#d04a05] transition-colors"
                  >
                    {addingId === p.id ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

