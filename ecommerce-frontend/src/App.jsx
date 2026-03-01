import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import VendorDashboard from "./pages/VendorDashboard";

function App() {
  return (
    <Router>
      <Navbar />
      {/* Updated main container with dark background and padding for fixed navbar */}
      <div className="pt-24 min-h-screen bg-[#eff0f5] text-gray-900">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vendor" element={<VendorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
