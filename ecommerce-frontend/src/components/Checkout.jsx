import API from "../api";

export default function Checkout({ orderId }) {
  const handlePayment = async () => {
    const res = await API.get(`payment/${orderId}/`);
    // Redirect to eSewa payment page
    window.location.href = res.request.responseURL;
  };

  return (
    <div>
      <h2>Checkout</h2>
      <button onClick={handlePayment}>Pay with eSewa</button>
    </div>
  );
}
