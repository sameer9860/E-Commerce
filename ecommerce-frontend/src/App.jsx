import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Register from "./components/Register";
import VendorDashboard from "./pages/VendorDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

function App() {
  return (
    <Router>
      <Navbar />
      {/* Updated main container with dark background and padding for fixed navbar */}
      <div className="pt-24 min-h-screen bg-[#eff0f5] text-gray-900">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout/:orderId" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/customer" element={<CustomerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
