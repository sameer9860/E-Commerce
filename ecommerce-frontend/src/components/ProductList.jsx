import { useEffect, useState } from "react";
import API from "../api";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    API.get("products/").then((res) => setProducts(res.data));
  }, []);

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
              className="bg-white text-gray-900 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
            >
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  📦
                </span>
              </div>

              <div className="p-3 flex flex-col h-32 justify-between">
                <div>
                  <h3 className="text-sm line-clamp-2 leading-tight hover:text-[#f85606] transition-colors">
                    {p.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs text-yellow-500">★★★★★</span>
                    <span className="text-[10px] text-gray-400">(0)</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="text-lg font-bold text-[#f85606]">
                    Rs. {p.price}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] line-through text-gray-400">
                      Rs. {(parseFloat(p.price) * 1.2).toFixed(0)}
                    </span>
                    <span className="text-[10px] text-gray-700">-20%</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
