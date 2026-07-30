import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import CarForm from '../components/CarForm';
import { carService } from '../services/carService';
import { toast } from 'react-toastify';

const EditCarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    carService.getCarById(id)
      .then((res) => setCar(res.data.data))
      .catch(() => { toast.error('Car not found'); navigate('/cars'); })
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await carService.updateCar(id, formData);
      toast.success('✅ Car updated successfully!');
      navigate(`/cars/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-6 py-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="card p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                Edit Car
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Update details for <strong>{car?.name}</strong>
              </p>
            </div>
            <CarForm defaultValues={car} onSubmit={handleSubmit} loading={loading} submitLabel="Update Car" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditCarPage;
