import { useEffect, useState } from "react";
import API from "../api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&display=swap');

  .products-page {
    min-height: 100vh;
    background: #0a0a0a;
    padding: 3rem 2rem;
    font-family: 'DM Mono', monospace;
  }

  .products-header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 2.5rem;
    border-bottom: 1px solid #1e1e1e;
    padding-bottom: 1.5rem;
  }

  .products-title {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #f5f0e8;
    letter-spacing: -0.03em;
    margin: 0;
  }

  .products-count {
    font-size: 0.75rem;
    color: #444;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1px;
    background: #1a1a1a;
    border: 1px solid #1a1a1a;
    border-radius: 12px;
    overflow: hidden;
  }

  .product-card {
    background: #0f0f0f;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: background 0.15s;
    cursor: pointer;
    position: relative;
  }

  .product-card:hover {
    background: #141414;
  }

  .product-card:hover .product-add {
    opacity: 1;
    transform: translateY(0);
  }

  .product-tag {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #444;
  }

  .product-name {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: #f5f0e8;
    margin: 0;
    line-height: 1.3;
  }

  .product-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid #1a1a1a;
  }

  .product-price {
    font-size: 1.1rem;
    font-weight: 500;
    color: #e8c547;
  }

  .product-add {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #555;
    border: 1px solid #252525;
    background: none;
    padding: 0.35rem 0.7rem;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.15s, transform 0.15s, color 0.15s, border-color 0.15s;
  }

  .product-add:hover {
    color: #e8c547;
    border-color: #e8c547;
  }

  .skeleton {
    animation: pulse 1.4s ease-in-out infinite;
    background: #1a1a1a;
    border-radius: 4px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #333;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
  }
`;

function SkeletonCard() {
  return (
    <div style={{ background: "#0f0f0f", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div className="skeleton" style={{ height: "10px", width: "40%" }} />
      <div className="skeleton" style={{ height: "16px", width: "75%" }} />
      <div className="skeleton" style={{ height: "16px", width: "55%" }} />
      <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
        <div className="skeleton" style={{ height: "20px", width: "25%" }} />
        <div className="skeleton" style={{ height: "28px", width: "30%" }} />
      </div>
    </div>
  );
}

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    API.get("products/")
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (id) => setCart((c) => [...c, id]);

  return (
    <>
      <style>{styles}</style>
      <div className="products-page">
        <div className="products-header">
          <h2 className="products-title">Products</h2>
          {!loading && (
            <span className="products-count">{products.length} items</span>
          )}
        </div>

        <div className="products-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length === 0
            ? <div className="empty-state">No products found.</div>
            : products.map((p) => (
                <div className="product-card" key={p.id}>
                  <span className="product-tag">SKU-{String(p.id).padStart(4, "0")}</span>
                  <p className="product-name">{p.name}</p>
                  <div className="product-footer">
                    <span className="product-price">${Number(p.price).toFixed(2)}</span>
                    <button
                      className="product-add"
                      onClick={() => addToCart(p.id)}
                    >
                      {cart.includes(p.id) ? "Added ✓" : "+ Cart"}
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </>
  );
}