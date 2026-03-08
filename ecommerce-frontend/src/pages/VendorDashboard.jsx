import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiBox,
  FiShoppingCart,
  FiPieChart,
  FiX,
  FiUser,
  FiMail,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiLogOut,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import API from "../api";

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: null,
  });
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [approved, setApproved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: "products", label: "My Products", icon: FiBox },
    { id: "orders", label: "Customer Orders", icon: FiShoppingCart },
    { id: "analytics", label: "Sales Analytics", icon: FiPieChart },
  ];

  // Guard: only allow logged-in vendors
  useEffect(() => {
    const checkRoleAndLoad = async () => {
      try {
        const meRes = await API.get("me/");
        if (meRes.data.role !== "vendor") {
          toast.error(
            "You must be logged in as a vendor to access the Vendor Dashboard.",
          );
          navigate("/login");
          return;
        }
        setApproved(!!meRes.data.is_approved);
        setMe(meRes.data);
        setProfile(meRes.data);
        setProfileForm({
          email: meRes.data.email || "",
          first_name: meRes.data.first_name || "",
          last_name: meRes.data.last_name || "",
        });
        const res = await API.get("products/");
        setProducts(res.data);
      } catch {
        toast.error("Please log in as a vendor to access this page.");
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
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock);
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }
      await API.post("products/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product added successfully!");
      setNewProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: null,
      });
      const res = await API.get("products/");
      setProducts(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to add product.");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await API.delete(`products/${id}/`);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted.");
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await API.patch(`orders/${id}/`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      toast.success(`Order status updated to ${status}`);
    } catch {
      toast.error("Failed to update order status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const saveProfile = async () => {
    try {
      setProfileSaving(true);
      const res = await API.patch("profile/", profileForm);
      setProfile(res.data);
      setProfileForm({
        email: res.data.email || "",
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
      });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const initials =
    `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`.toUpperCase() ||
    profile?.username?.[0]?.toUpperCase() ||
    "?";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eff0f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#f85606] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">
            Loading vendor dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eff0f5]">
      <Sidebar
        title="Vendor Dashboard"
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={me?.username}
        role={me?.role}
        onProfileClick={() => setActiveTab("profile")}
      />

      {/* Main Content */}
      <main className="lg:ml-72 p-6 lg:p-10">
        {activeTab === "products" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manage Products</h2>
            {!approved && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded">
                Your vendor account is pending approval. You can view the
                dashboard, but you can’t add/update products until approved by
                admin.
              </div>
            )}

            {/* Add Product Form */}
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full p-2 border rounded mb-2"
              />
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#f85606] transition-all mb-4"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.files[0] })
                }
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#f85606] transition-all mb-6 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#f85606]/10 file:text-[#f85606] hover:file:bg-[#f85606]/20 cursor-pointer"
              />
              <button
                onClick={handleAddProduct}
                disabled={!approved}
                className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 uppercase tracking-wider text-sm disabled:opacity-50"
              >
                Create Product
              </button>
            </div>

            {/* Product List */}
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <FiBox className="text-[#f85606]" /> My Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-40 bg-gray-100 relative overflow-hidden">
                    <img
                      src={
                        p.image_display ||
                        `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop`
                      }
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-gray-900 group-hover:text-[#f85606] transition-colors truncate">
                      {p.name}
                    </h4>
                    <p className="text-gray-500 text-xs line-clamp-2 h-8">
                      {p.description}
                    </p>
                    <div className="flex justify-between items-end pt-2">
                      <div>
                        <p className="text-[#0a4692] font-black">
                          Rs. {p.price}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          Stock: {p.stock}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  </div>
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
                            ),
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
                            Number(r.revenue || 0),
                          ),
                          1,
                        );
                        const pct = Math.round((revenue / max) * 100);
                        return (
                          <div key={row.order__product__id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-800">
                                {row.order__product__name}
                              </span>
                              <span className="font-semibold">
                                Rs. {row.revenue}
                              </span>
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

        {activeTab === "profile" && profile && (
          <div className="w-full max-w-2xl space-y-6 mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-[#f85606] to-[#0a4692] relative" />
              <div className="px-8 pb-8">
                <div className="flex items-end justify-between -mt-10 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center text-2xl font-black text-[#f85606]">
                    {initials}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    <FiLogOut size={14} /> Log Out
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-xl font-black text-gray-900">
                      {profile.first_name || profile.last_name
                        ? `${profile.first_name} ${profile.last_name}`.trim()
                        : profile.username}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">
                        @{profile.username}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                          profile.role === "vendor"
                            ? "bg-purple-100 text-purple-700"
                            : profile.role === "admin"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {profile.role}
                      </span>
                      {profile.role === "vendor" && (
                        <span
                          className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                            profile.is_approved
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {profile.is_approved ? (
                            <>
                              <FiCheckCircle size={10} /> Approved
                            </>
                          ) : (
                            <>
                              <FiClock size={10} /> Pending
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiShield className="text-[#f85606]" /> Edit Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <FiUser
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={profileForm.first_name}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          first_name: e.target.value,
                        }))
                      }
                      placeholder="First name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:border-[#f85606] focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <FiUser
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={profileForm.last_name}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          last_name: e.target.value,
                        }))
                      }
                      placeholder="Last name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:border-[#f85606] focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="Email address"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:border-[#f85606] focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={saveProfile}
                disabled={profileSaving}
                className="mt-6 w-full bg-gradient-to-r from-[#f85606] to-[#e04d05] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#f85606]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {profileSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiShield size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
