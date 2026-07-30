import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, ShoppingCart, Calculator, TrendingUp } from 'lucide-react';
import { carService } from '../services/carService';
import { toast } from 'react-toastify';

const TENURES = [12, 24, 36, 48, 60];

const EMIModal = ({ isOpen, onClose, car, quantity, onSuccess }) => {
  const [tab, setTab] = useState('full'); // 'full' | 'emi'
  const [tenure, setTenure] = useState(36);
  const [loading, setLoading] = useState(false);
  const interestRate = car?.interestRate ?? 10;

  const totalPrice = car ? car.price * quantity : 0;

  const emi = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = tenure;
    if (r === 0) return totalPrice / n;
    return (totalPrice * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [totalPrice, interestRate, tenure]);

  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - totalPrice;

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const paymentData = tab === 'emi' 
        ? { paymentMethod: 'emi', emiDetails: { tenure, interestRate, monthlyEMI: Math.round(emi) } }
        : { paymentMethod: 'full' };
        
      await carService.purchaseCar(car._id, quantity, paymentData);
      toast.success(`🚗 Purchased ${quantity} × ${car.name}!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !car) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-dark-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span className="font-bold text-lg">Purchase Options</span>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white/70 text-sm">{quantity} × {car.name} — <strong className="text-white">${totalPrice.toLocaleString()}</strong></p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-white/10">
            {[
              { id: 'full', label: 'Full Payment', icon: ShoppingCart },
              { id: 'emi', label: 'EMI / Finance', icon: Calculator },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                  tab === id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'full' ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Unit Price</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${car.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quantity</span>
                    <span className="font-semibold text-gray-900 dark:text-white">× {quantity}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-white/10 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-2xl font-black text-emerald-600">${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  One-time payment. No interest. Instant ownership transfer.
                </div>
                <button onClick={handlePurchase} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <><ShoppingCart className="w-4 h-4" /> Pay ${totalPrice.toLocaleString()}</>}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Interest Rate */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex items-center justify-between border border-emerald-100 dark:border-emerald-800/30">
                  <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Fixed Interest Rate (p.a.)</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{interestRate}%</span>
                </div>

                {/* Tenure */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Loan Tenure</label>
                  <div className="grid grid-cols-5 gap-2">
                    {TENURES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTenure(t)}
                        className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          tenure === t
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-emerald-300'
                        }`}
                      >
                        {t}<br /><span className="font-normal">mo</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* EMI Summary */}
                <motion.div
                  key={`${interestRate}-${tenure}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800"
                >
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-3">EMI Breakdown</p>
                  <div className="text-center mb-4">
                    <p className="text-xs text-gray-500">Monthly EMI</p>
                    <p className="text-4xl font-black text-emerald-600">${Math.round(emi).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">for {tenure} months</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/60 dark:bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Total Payable</p>
                      <p className="font-bold text-gray-900 dark:text-white">${Math.round(totalPayable).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Total Interest</p>
                      <p className="font-bold text-orange-500">${Math.round(totalInterest).toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>

                <button onClick={handlePurchase} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4" /> Proceed with EMI @ ${Math.round(emi).toLocaleString()}/mo</>}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EMIModal;
