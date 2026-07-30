import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Phone, FileText, Car, CheckCircle } from 'lucide-react';
import { testDriveService } from '../services/testDriveService';
import { toast } from 'react-toastify';

const TIME_SLOTS = [
  'Morning (9AM–12PM)',
  'Afternoon (12PM–4PM)',
  'Evening (4PM–7PM)',
];

const TestDriveModal = ({ isOpen, onClose, car }) => {
  const [step, setStep] = useState(1); // 1=form, 2=success
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    preferredDate: '',
    preferredTime: '',
    phone: '',
    notes: '',
  });

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.preferredDate || !form.preferredTime || !form.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await testDriveService.book({ carId: car._id, ...form });
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setForm({ preferredDate: '', preferredTime: '', phone: '', notes: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-dark-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                <span className="font-bold text-lg">Book Test Drive</span>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white/70 text-sm">{car?.name}</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1.5" />Preferred Date *
                </label>
                <input
                  type="date"
                  min={today}
                  max={maxDateStr}
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Clock className="w-4 h-4 inline mr-1.5" />Preferred Time *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm({ ...form, preferredTime: slot })}
                      className={`p-2 rounded-xl text-xs font-medium border-2 transition-all ${
                        form.preferredTime === slot
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                      }`}
                    >
                      {slot.split(' ')[0]}
                      <br />
                      <span className="text-gray-400 dark:text-gray-500">{slot.match(/\(.*\)/)?.[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Phone className="w-4 h-4 inline mr-1.5" />Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <FileText className="w-4 h-4 inline mr-1.5" />Notes (optional)
                </label>
                <textarea
                  placeholder="Any specific requirements..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking...</>
                ) : (
                  <><Calendar className="w-4 h-4" /> Confirm Booking</>
                )}
              </button>
            </form>
          ) : (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Your test drive for <strong>{car?.name}</strong> is booked for
              </p>
              <p className="text-primary-600 dark:text-primary-400 font-semibold mb-1">
                {new Date(form.preferredDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{form.preferredTime}</p>
              <p className="text-xs text-gray-400 mb-6">Our team will call you at {form.phone} to confirm.</p>
              <button onClick={handleClose} className="btn-primary w-full">Done</button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TestDriveModal;
