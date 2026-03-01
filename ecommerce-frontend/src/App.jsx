import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
// import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
// import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products" element={<ProductList />} />
        {/* <Route path="/cart" element={<Cart />} /> */}
        <Route path="/checkout" element={<Checkout />} />
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
