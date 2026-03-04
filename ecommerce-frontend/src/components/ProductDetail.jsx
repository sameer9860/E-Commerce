import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`products/${id}/`);
        setProduct(res.data);
      } catch {
        setError("Unable to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center">
        <p className="text-red-500">{error || "Product not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eff0f5] p-6 flex justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full grid md:grid-cols-2 gap-8">
        <div className="h-96 bg-gray-100 flex items-center justify-center rounded-2xl overflow-hidden shadow-inner relative">
          <img
            src={
              product.image_display ||
              `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop`
            }
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {!product.image_display && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
              <span className="text-6xl text-white/50 drop-shadow-lg">📦</span>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>
          <div className="text-3xl font-bold text-[#f85606]">
            Rs. {product.price}
          </div>
          <p className="text-sm text-gray-500">Stock: {product.stock}</p>
        </div>
      </div>
    </div>
  );
}
