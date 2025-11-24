import { useState } from 'react';
import CouponForm from './components/CouponForm';
import BestCouponTester from './components/BestCouponTester';

function App() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-black mb-4">
            Coupon Management System
          </h1>
          <p className="text-black text-lg">
            Create and test e-commerce coupons with advanced eligibility rules
          </p>
        </div>

        <div className="flex justify-center mb-8 gap-4 animate-slide-up">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'create'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl transform scale-105'
                : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
          >
            Create Coupon
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'test'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl transform scale-105'
                : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
          >
            Test Best Coupon
          </button>
        </div>

        <div className="animate-fade-in">
          {activeTab === 'create' ? <CouponForm /> : <BestCouponTester />}
        </div>
      </div>
    </div>
  );
}

export default App;
