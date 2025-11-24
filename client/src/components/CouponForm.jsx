import { useState } from 'react';
import axios from 'axios';

function CouponForm() {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'FLAT',
    discountValue: '',
    maxDiscountAmount: '',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    usageLimitPerUser: '',
    // Eligibility
    allowedUserTiers: [],
    minLifetimeSpend: '',
    minOrdersPlaced: '',
    firstOrderOnly: false,
    allowedCountries: [],
    minCartValue: '',
    applicableCategories: [],
    excludedCategories: [],
    minItemsCount: ''
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayInput = (name, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [name]: array }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Prepare coupon data
      const eligibility = {};
      if (formData.allowedUserTiers.length > 0) eligibility.allowedUserTiers = formData.allowedUserTiers;
      if (formData.minLifetimeSpend) eligibility.minLifetimeSpend = Number(formData.minLifetimeSpend);
      if (formData.minOrdersPlaced) eligibility.minOrdersPlaced = Number(formData.minOrdersPlaced);
      if (formData.firstOrderOnly) eligibility.firstOrderOnly = true;
      if (formData.allowedCountries.length > 0) eligibility.allowedCountries = formData.allowedCountries;
      if (formData.minCartValue) eligibility.minCartValue = Number(formData.minCartValue);
      if (formData.applicableCategories.length > 0) eligibility.applicableCategories = formData.applicableCategories;
      if (formData.excludedCategories.length > 0) eligibility.excludedCategories = formData.excludedCategories;
      if (formData.minItemsCount) eligibility.minItemsCount = Number(formData.minItemsCount);

      const couponData = {
        code: formData.code,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        startDate: formData.startDate,
        endDate: formData.endDate,
        eligibility
      };

      if (formData.maxDiscountAmount) couponData.maxDiscountAmount = Number(formData.maxDiscountAmount);
      if (formData.usageLimitPerUser) couponData.usageLimitPerUser = Number(formData.usageLimitPerUser);

      const response = await axios.post('/api/coupons', couponData);
      
      setMessage({ type: 'success', text: `Coupon "${formData.code}" created successfully!` });
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          code: '',
          description: '',
          discountType: 'FLAT',
          discountValue: '',
          maxDiscountAmount: '',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          usageLimitPerUser: '',
          allowedUserTiers: [],
          minLifetimeSpend: '',
          minOrdersPlaced: '',
          firstOrderOnly: false,
          allowedCountries: [],
          minCartValue: '',
          applicableCategories: [],
          excludedCategories: [],
          minItemsCount: ''
        });
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.response?.data?.error || 'Failed to create coupon'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <h2 className="card-header">Create New Coupon</h2>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
        }`}>
          <p className="text-white font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label-text">Coupon Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., WELCOME100"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-text">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Welcome offer for new users"
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Discount Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label-text">Discount Type *</label>
            <select name="discountType" value={formData.discountType} onChange={handleChange} className="input-field">
              <option value="FLAT">FLAT (₹)</option>
              <option value="PERCENT">PERCENT (%)</option>
            </select>
          </div>

          <div>
            <label className="label-text">Discount Value *</label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              placeholder={formData.discountType === 'FLAT' ? '100' : '10'}
              className="input-field"
              required
            />
          </div>

          {formData.discountType === 'PERCENT' && (
            <div>
              <label className="label-text">Max Discount Amount</label>
              <input
                type="number"
                name="maxDiscountAmount"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
                placeholder="500"
                className="input-field"
              />
            </div>
          )}
        </div>

        {/* Validity Period */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label-text">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-text">End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-text">Usage Limit Per User</label>
            <input
              type="number"
              name="usageLimitPerUser"
              value={formData.usageLimitPerUser}
              onChange={handleChange}
              placeholder="1"
              className="input-field"
            />
          </div>
        </div>

        {/* User-based Eligibility */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-xl font-semibold text-black mb-4">User-based Eligibility</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">Allowed User Tiers (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g., NEW, REGULAR, GOLD"
                onChange={(e) => handleArrayInput('allowedUserTiers', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Allowed Countries (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g., IN, US, UK"
                onChange={(e) => handleArrayInput('allowedCountries', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Min Lifetime Spend</label>
              <input
                type="number"
                name="minLifetimeSpend"
                value={formData.minLifetimeSpend}
                onChange={handleChange}
                placeholder="5000"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Min Orders Placed</label>
              <input
                type="number"
                name="minOrdersPlaced"
                value={formData.minOrdersPlaced}
                onChange={handleChange}
                placeholder="3"
                className="input-field"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="firstOrderOnly"
                checked={formData.firstOrderOnly}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 bg-slate-800 border-slate-700 rounded focus:ring-purple-500"
              />
              <label className="text-slate-300 font-medium">First Order Only</label>
            </div>
          </div>
        </div>

        {/* Cart-based Eligibility */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-xl font-semibold text-black mb-4">Cart-based Eligibility</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">Min Cart Value</label>
              <input
                type="number"
                name="minCartValue"
                value={formData.minCartValue}
                onChange={handleChange}
                placeholder="500"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Min Items Count</label>
              <input
                type="number"
                name="minItemsCount"
                value={formData.minItemsCount}
                onChange={handleChange}
                placeholder="2"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Applicable Categories (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g., electronics, fashion"
                onChange={(e) => handleArrayInput('applicableCategories', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">Excluded Categories (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g., books, groceries"
                onChange={(e) => handleArrayInput('excludedCategories', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CouponForm;
