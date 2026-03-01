import { useState } from "react";
import API from "../api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&display=swap');

  .checkout-page {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    font-family: 'DM Mono', monospace;
  }

  .checkout-card {
    width: 100%;
    max-width: 420px;
    background: #0f0f0f;
    border: 1px solid #1e1e1e;
    border-radius: 16px;
    overflow: hidden;
  }

  .checkout-header {
    padding: 2rem 2rem 1.5rem;
    border-bottom: 1px solid #1a1a1a;
  }

  .checkout-eyebrow {
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #444;
    margin-bottom: 0.5rem;
  }

  .checkout-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: #f5f0e8;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .checkout-order {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #1a1a1a;
  }

  .order-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #555;
    padding: 0.4rem 0;
  }

  .order-row.total {
    color: #f5f0e8;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid #1a1a1a;
  }

  .order-row.total span:last-child {
    color: #e8c547;
    font-weight: 500;
  }

  .checkout-footer {
    padding: 1.5rem 2rem;
  }

  .esewa-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.9rem 1.5rem;
    border-radius: 10px;
    border: none;
    background: #60bb46;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
    box-shadow: 0 0 0 0 rgba(96, 187, 70, 0);
  }

  .esewa-btn:hover:not(:disabled) {
    background: #52a83b;
    box-shadow: 0 4px 20px rgba(96, 187, 70, 0.3);
    transform: translateY(-1px);
  }

  .esewa-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .esewa-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .esewa-logo {
    font-size: 1.1rem;
    font-weight: 900;
    background: rgba(255,255,255,0.2);
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    letter-spacing: -0.02em;
  }

  .secure-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 1rem;
    font-size: 0.7rem;
    color: #333;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-msg {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: #e85547;
    text-align: center;
    letter-spacing: 0.03em;
  }
`;

export default function Checkout({ orderId, orderItems = [], total = "0.00" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`payment/${orderId}/`);
      window.location.href = res.request.responseURL;
    } catch (err) {
      setError("Payment initiation failed. Please try again.");
      setLoading(false);
    }
  };

  const displayItems = orderItems.length > 0
    ? orderItems
    : [{ label: `Order #${orderId || "—"}`, value: `$${total}` }];

  return (
    <>
      <style>{styles}</style>
      <div className="checkout-page">
        <div className="checkout-card">
          <div className="checkout-header">
            <p className="checkout-eyebrow">Secure Checkout</p>
            <h2 className="checkout-title">Review &amp; Pay</h2>
          </div>

          <div className="checkout-order">
            {displayItems.map((item, i) => (
              <div className="order-row" key={i}>
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
            <div className="order-row total">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>

          <div className="checkout-footer">
            <button
              className="esewa-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Redirecting...
                </>
              ) : (
                <>
                  <span className="esewa-logo">e</span>
                  Pay with eSewa
                </>
              )}
            </button>
            {error && <p className="error-msg">{error}</p>}
            <p className="secure-note">
              <span>🔒</span> SSL encrypted · Powered by eSewa
            </p>
          </div>
        </div>
      </div>
    </>
  );
}