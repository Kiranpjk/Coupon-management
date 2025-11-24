import { useState } from 'react';
import axios from 'axios';

function BestCouponTester() {
  const [userData, setUserData] = useState({
    userId: 'u123',
    userTier: 'NEW',
    country: 'IN',
    lifetimeSpend: '0',
    ordersPlaced: '0'
  });

  const [cartItems, setCartItems] = useState([
    { productId: 'p1', category: 'electronics', unitPrice: 1500, quantity: 1 }
  ]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleCartItemChange = (index, field, value) => {
    const newItems = [...cartItems];
    newItems[index][field] = field === 'unitPrice' || field === 'quantity' ? Number(value) : value;
    setCartItems(newItems);
  };

  const addCartItem = () => {
    setCartItems([...cartItems, { productId: `p${cartItems.length + 1}`, category: '', unitPrice: 0, quantity: 1 }]);
  };

  const removeCartItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const loadSampleData = () => {
    setUserData({
      userId: 'u123',
      userTier: 'GOLD',
      country: 'IN',
      lifetimeSpend: '6000',
      ordersPlaced: '8'
    });
    setCartItems([
      { productId: 'p1', category: 'electronics', unitPrice: 2500, quantity: 1 },
      { productId: 'p2', category: 'fashion', unitPrice: 800, quantity: 2 }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const requestData = {
        user: {
          userId: userData.userId,
          userTier: userData.userTier,
          country: userData.country,
          lifetimeSpend: Number(userData.lifetimeSpend),
          ordersPlaced: Number(userData.ordersPlaced)
        },
        cart: {
          items: cartItems
        }
      };

      const response = await axios.post('/api/coupons/best', requestData);
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find best coupon');
    } finally {
      setLoading(false);
    }
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="card">
          <h2 className="card-header">Test Best Coupon API</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Context */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">User Context</h3>

              <div className="space-y-4">
                <div>
                  <label className="label-text">User ID</label>
                  <input
                    type="text"
                    name="userId"
                    value={userData.userId}
                    onChange={handleUserChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">User Tier</label>
                    <select name="userTier" value={userData.userTier} onChange={handleUserChange} className="input-field">
                      <option value="NEW">NEW</option>
                      <option value="REGULAR">REGULAR</option>
                      <option value="GOLD">GOLD</option>
                    </select>
                  </div>

                  <div>
                    <label className="label-text">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={userData.country}
                      onChange={handleUserChange}
                      placeholder="IN"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Lifetime Spend (₹)</label>
                    <input
                      type="number"
                      name="lifetimeSpend"
                      value={userData.lifetimeSpend}
                      onChange={handleUserChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label-text">Orders Placed</label>
                    <input
                      type="number"
                      name="ordersPlaced"
                      value={userData.ordersPlaced}
                      onChange={handleUserChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Cart Items</h3>

              {cartItems.map((item, index) => (
                <div key={index} className="bg-gray-100 rounded-lg p-4 mb-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-black font-medium">Item {index + 1}</span>
                    {cartItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCartItem(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-text text-xs">Category</label>
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => handleCartItemChange(index, 'category', e.target.value)}
                        placeholder="electronics"
                        className="input-field text-sm py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="label-text text-xs">Product ID</label>
                      <input
                        type="text"
                        value={item.productId}
                        onChange={(e) => handleCartItemChange(index, 'productId', e.target.value)}
                        className="input-field text-sm py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="label-text text-xs">Unit Price (₹)</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleCartItemChange(index, 'unitPrice', e.target.value)}
                        className="input-field text-sm py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="label-text text-xs">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => handleCartItemChange(index, 'quantity', e.target.value)}
                        className="input-field text-sm py-2"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addCartItem}
                className="btn-secondary w-full text-sm py-2"
              >
                Add Item
              </button>

              <div className="mt-4 p-3 bg-purple-500/20 rounded-lg">
                <p className="text-black font-semibold">
                  Cart Total: ₹{calculateCartTotal()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Finding...' : 'Find Best Coupon'}
              </button>

              <button
                type="button"
                onClick={loadSampleData}
                className="btn-secondary w-full text-sm"
              >
                Load Sample Data
              </button>
            </div>
          </form>
        </div>

        {/* Result Display */}
        <div className="card">
          <h2 className="card-header">Result</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-600">Error: {error}</p>
              <div className="animate-spin text-6xl mb-4"></div>
              <p className="text-black">Finding best coupon...</p>
            </div>
          )}

          {result && !error && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2"></div>
                  <h3 className="text-2xl font-bold text-black mb-2">{result.coupon.code}</h3>
                  <p className="text-gray-600">{result.coupon.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">Original Price</p>
                    <p className="text-black text-xl font-bold">₹{result.originalPrice}</p>
                  </div>

                  <div className="bg-green-500/20 rounded-lg p-4">
                    <p className="text-green-700 text-sm">Discount</p>
                    <p className="text-green-700 text-xl font-bold">-₹{result.discountAmount}</p>
                  </div>

                  <div className="bg-purple-500/20 rounded-lg p-4 col-span-2">
                    <p className="text-purple-700 text-sm">Final Price</p>
                    <p className="text-purple-700 text-2xl font-bold">₹{result.finalPrice}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-sm text-gray-600 mb-2">Discount Details:</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Type:</span>
                    <span className="text-black font-semibold">{result.coupon.discountType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-700">Value:</span>
                    <span className="text-black font-semibold">
                      {result.coupon.discountType === 'FLAT' ? `₹${result.coupon.discountValue}` : `${result.coupon.discountValue}%`}
                    </span>
                  </div>
                  {result.coupon.maxDiscountAmount && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-700">Max Discount:</span>
                      <span className="text-black font-semibold">₹{result.coupon.maxDiscountAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center text-sm text-slate-400">
                <p>This is the best coupon based on highest discount, earliest end date, and code order</p>
              </div>
            </div>
          )}

          {result === null && !loading && !error && error === null && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-4"></p>
              <p className="text-black">No eligible coupon found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BestCouponTester;
