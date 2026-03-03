import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [approved, setApproved] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Guard: only allow logged-in vendors
  useEffect(() => {
    const checkRoleAndLoad = async () => {
      try {
        const me = await API.get("me/");
        if (me.data.role !== "vendor") {
          alert("You must be logged in as a vendor to access the Vendor Dashboard.");
          navigate("/login");
          return;
        }
        setApproved(!!me.data.is_approved);
        const res = await API.get("products/");
        setProducts(res.data);
      } catch {
        alert("Please log in as a vendor to access this page.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    checkRoleAndLoad();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "orders") {
      API.get("orders/").then((res) => setOrders(res.data));
    }
    if (activeTab === "analytics") {
      API.get("vendor/analytics/")
        .then((res) => setAnalytics(res.data))
        .catch(() => setAnalytics(null));
    }
  }, [activeTab]);

  const handleAddProduct = async () => {
    try {
      await API.post("products/", newProduct);
      alert("Product added successfully!");
      setNewProduct({ name: "", description: "", price: "", stock: "" });
      const res = await API.get("products/");
      setProducts(res.data);
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to add product.");
    }
  };

  const handleDeleteProduct = async (id) => {
    await API.delete(`products/${id}/`);
    setProducts(products.filter((p) => p.id !== id));
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await API.patch(`orders/${id}/`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    } catch {
      alert("Failed to update order status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading vendor dashboard...</p>
      </div>
    );
  }

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
            {!approved && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded">
                Your vendor account is pending approval. You can view the dashboard, but you can’t add/update products until approved by admin.
              </div>
            )}

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
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="w-full p-2 border rounded mb-2"
              />
              <button
                onClick={handleAddProduct}
                disabled={!approved}
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
                  <p className="text-blue-600 font-semibold">Rs. {p.price}</p>
                  <p className="text-sm text-gray-500">Stock: {p.stock}</p>
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
            {orders.length === 0 ? (
              <p className="text-gray-600">No orders yet.</p>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">Qty</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="px-4 py-2">{o.id}</td>
                        <td className="px-4 py-2">
                          {o.customer_username ?? o.customer}
                        </td>
                        <td className="px-4 py-2">
                          {o.product_name ?? o.product}
                        </td>
                        <td className="px-4 py-2">{o.quantity}</td>
                        <td className="px-4 py-2">{o.status}</td>
                        <td className="px-4 py-2 space-x-2">
                          {["Pending", "Confirmed", "Shipped", "Delivered"].map(
                            (status) => (
                              <button
                                key={status}
                                onClick={() => updateOrderStatus(o.id, status)}
                                className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                              >
                                {status}
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Analytics</h2>
            {!analytics ? (
              <p className="text-gray-600">No analytics data yet.</p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">Total revenue</div>
                    <div className="text-2xl font-bold">
                      Rs. {analytics.total_revenue}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">Paid orders</div>
                    <div className="text-2xl font-bold">
                      {analytics.total_paid_orders}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold mb-3">Revenue by product</h3>
                  {analytics.revenue_by_product?.length ? (
                    <div className="space-y-3">
                      {analytics.revenue_by_product.map((row) => {
                        const revenue = Number(row.revenue || 0);
                        const max = Math.max(
                          ...analytics.revenue_by_product.map((r) =>
                            Number(r.revenue || 0)
                          ),
                          1
                        );
                        const pct = Math.round((revenue / max) * 100);
                        return (
                          <div key={row.order__product__id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-800">
                                {row.order__product__name}
                              </span>
                              <span className="font-semibold">Rs. {row.revenue}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded">
                              <div
                                className="h-2 bg-blue-600 rounded"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">No paid sales yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
