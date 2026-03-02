import { useState, useEffect } from "react";
import API from "../api";

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "" });

  useEffect(() => {
    API.get("products/").then((res) => setProducts(res.data));
  }, []);

  const handleAddProduct = async () => {
    try {
      await API.post("products/", newProduct);
      alert("Product added successfully!");
      setNewProduct({ name: "", description: "", price: "" });
      const res = await API.get("products/");
      setProducts(res.data);
    } catch (err) {
      alert("Only vendors can add products!");
    }
  };

  const handleDeleteProduct = async (id) => {
    await API.delete(`products/${id}/`);
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white fixed top-16 left-0 h-full shadow-lg">
        <div className="p-6 font-bold text-xl border-b border-blue-500">Vendor Panel</div>
        <ul className="space-y-4 p-6">
          <li>
            <button onClick={() => setActiveTab("products")} className="w-full text-left hover:underline">
              Products
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab("orders")} className="w-full text-left hover:underline">
              Orders
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab("analytics")} className="w-full text-left hover:underline">
              Analytics
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {activeTab === "products" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manage Products</h2>

            {/* Add Product Form */}
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <button
                onClick={handleAddProduct}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                Add Product
              </button>
            </div>

            {/* Product List */}
            <h3 className="text-xl font-semibold mb-4">My Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.id} className="bg-white shadow-md rounded-lg p-4">
                  <h4 className="text-lg font-bold">{p.name}</h4>
                  <p className="text-gray-600">{p.description}</p>
                  <p className="text-blue-600 font-semibold">${p.price}</p>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manage Orders</h2>
            <p className="text-gray-600">Orders list will appear here...</p>
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Analytics</h2>
            <p className="text-gray-600">Charts and insights will appear here...</p>
          </div>
        )}
      </main>
    </div>
  );
}
