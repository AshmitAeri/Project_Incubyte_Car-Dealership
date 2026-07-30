import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import CarForm from '../components/CarForm';
import { carService } from '../services/carService';
import { toast } from 'react-toastify';

const AddCarPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await carService.createCar(formData);
      toast.success('🚗 Car added to inventory!');
      navigate('/cars');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add car');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-6 py-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="card p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                Add New Car
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Fill in all details to add a new car to the inventory.
              </p>
            </div>
            <CarForm onSubmit={handleSubmit} loading={loading} submitLabel="Add Car to Inventory" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddCarPage;
