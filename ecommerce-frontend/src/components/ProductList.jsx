import { useEffect, useState } from "react";
import API from "../api";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    API.get("products/").then((res) => setProducts(res.data));
  }, []);

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
