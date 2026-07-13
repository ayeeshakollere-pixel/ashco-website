import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ShoppingCart, MapPin, Phone, CheckCircle, ArrowRight } from 'lucide-react';

const OrderSequence = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productType: '',
    quantity: '',
    deliveryAddress: '',
    contactName: '',
    phoneNumber: '',
  });

  // Simple entrance animation for the form
  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your actual form submission logic here (e.g., API call)
    setStep(4); // Move to success step
  };

  return (
    <section className="relative py-24 lg:py-32 bg-ashco-gray min-h-screen flex items-center justify-center">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-ashco-green/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-ashco-yellow/5 blur-3xl translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="w-full max-w-3xl px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-ashco-yellow" />
            <span className="font-body text-sm font-semibold text-ashco-green uppercase tracking-wider">
              Request Delivery
            </span>
            <div className="w-8 h-0.5 bg-ashco-yellow" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-ashco-black">
            PLACE YOUR <span className="text-ashco-green">ORDER</span>
          </h2>
        </div>

        {/* Form Container */}
        <div ref={formRef} className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          
          {/* Progress Indicator */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-ashco-green transition-all duration-500 -z-10"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
              
              {[
                { num: 1, icon: ShoppingCart, label: 'Product' },
                { num: 2, icon: MapPin, label: 'Delivery' },
                { num: 3, icon: CheckCircle, label: 'Review' },
              ].map((item) => (
                <div key={item.num} className="flex flex-col items-center bg-white px-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    step >= item.num ? 'bg-ashco-green text-white shadow-lg shadow-ashco-green/30' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm mt-2 font-medium ${step >= item.num ? 'text-ashco-black' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Form Steps */}
          <form onSubmit={handleSubmit}>
            
            {/* Step 1: Product Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block font-body text-sm font-semibold text-ashco-black mb-2">Product Type</label>
                  <select
                    name="productType"
                    value={formData.productType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-ashco-green focus:ring-2 focus:ring-ashco-green/20 outline-none transition-all"
                  >
                    <option value="">Select a product...</option>
                    <option value="PMS">Premium Motor Spirit (PMS)</option>
                    <option value="AGO">Automotive Gas Oil (AGO / Diesel)</option>
                    <option value="DPK">Dual Purpose Kerosene (DPK)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-body text-sm font-semibold text-ashco-black mb-2">Quantity (Litres)</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter volume in litres"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-ashco-green focus:ring-2 focus:ring-ashco-green/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Delivery & Contact Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block font-body text-sm font-semibold text-ashco-black mb-2">Contact Name</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="Full Name or Company Name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-ashco-green focus:ring-2 focus:ring-ashco-green/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-semibold text-ashco-black mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+234 XXX XXXX"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-ashco-green focus:ring-2 focus:ring-ashco-green/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-semibold text-ashco-black mb-2">Delivery Address</label>
                  <input
                    type="text"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder="Full street address and state"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-ashco-green focus:ring-2 focus:ring-ashco-green/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-ashco-green/5 p-6 rounded-xl border border-ashco-green/10 space-y-4">
                <h3 className="font-display text-xl font-bold text-ashco-black mb-4">Order Summary</h3>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Product:</span>
                  <span className="font-semibold text-ashco-black">{formData.productType || 'Not specified'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-semibold text-ashco-black">{formData.quantity ? `${formData.quantity} Litres` : 'Not specified'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Contact:</span>
                  <span className="font-semibold text-ashco-black">{formData.contactName} ({formData.phoneNumber})</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-500">Destination:</span>
                  <span className="font-semibold text-ashco-black text-right max-w-[60%]">{formData.deliveryAddress}</span>
                </div>
              </div>
            )}

            {/* Step 4: Success State */}
            {step === 4 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="font-display text-3xl font-bold text-ashco-black mb-4">Order Received!</h3>
                <p className="text-gray-600 mb-8">
                  Thank you for choosing Ashco Energy. Our dispatch team will contact you shortly to confirm your delivery schedule.
                </p>
                <button
                  type="button"
                  onClick={() => { setStep(1); setFormData({ productType: '', quantity: '', deliveryAddress: '', contactName: '', phoneNumber: '' }); }}
                  className="px-8 py-3 bg-ashco-green text-white font-semibold rounded-lg hover:bg-ashco-black transition-colors"
                >
                  Place Another Order
                </button>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 4 && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`px-6 py-2.5 font-semibold rounded-lg transition-colors ${
                    step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Back
                </button>
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-ashco-green text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-ashco-black transition-colors"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-ashco-yellow text-ashco-black px-8 py-2.5 rounded-lg font-bold hover:bg-ashco-black hover:text-white transition-colors"
                  >
                    Confirm Order
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default OrderSequence;
