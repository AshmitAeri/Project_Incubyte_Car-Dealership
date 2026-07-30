import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Upload, X, Car } from 'lucide-react';

const CATEGORIES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup Truck', 'Van', 'Wagon', 'Sports', 'Luxury', 'Electric'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];

const FormField = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);

/**
 * Shared Car Add/Edit Form
 * @param {Object} defaultValues - existing car data for edit mode
 * @param {Function} onSubmit - called with FormData
 * @param {boolean} loading
 * @param {string} submitLabel
 */
const CarForm = ({ defaultValues = {}, onSubmit, loading, submitLabel = 'Save Car' }) => {
  const [imagePreview, setImagePreview] = useState(
    defaultValues.image ? `/uploads/${defaultValues.image}` : null
  );
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
    if (defaultValues.image) {
      setImagePreview(`/uploads/${defaultValues.image}`);
    }
  }, [defaultValues, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    const allowedFields = [
      'name', 'brand', 'model', 'year', 'category', 'color', 'fuelType',
      'transmission', 'mileage', 'engine', 'horsepower', 'price',
      'stockQuantity', 'status', 'description', 'interestRate'
    ];
    
    allowedFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    
    if (imageFile) formData.append('image', imageFile);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Car Image</label>
        <div className="relative">
          {imagePreview ? (
            <div className="relative h-56 rounded-2xl overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImagePreview(null); setImageFile(null); }}
                className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all">
              <Upload className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Click to upload car image</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</p>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Grid fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Car Name *" error={errors.name}>
          <input {...register('name', { required: 'Name is required' })} className="input-field" placeholder="e.g., BMW 3 Series" />
        </FormField>

        <FormField label="Brand *" error={errors.brand}>
          <input {...register('brand', { required: 'Brand is required' })} className="input-field" placeholder="e.g., BMW" />
        </FormField>

        <FormField label="Model *" error={errors.model}>
          <input {...register('model', { required: 'Model is required' })} className="input-field" placeholder="e.g., 330i" />
        </FormField>

        <FormField label="Year *" error={errors.year}>
          <input
            {...register('year', {
              required: 'Year is required',
              min: { value: 1886, message: 'Invalid year' },
              max: { value: new Date().getFullYear() + 2, message: 'Year too far in future' },
            })}
            type="number"
            className="input-field"
            placeholder="2024"
          />
        </FormField>

        <FormField label="Category *" error={errors.category}>
          <select {...register('category', { required: 'Category is required' })} className="input-field">
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>

        <FormField label="Color *" error={errors.color}>
          <input {...register('color', { required: 'Color is required' })} className="input-field" placeholder="e.g., Midnight Black" />
        </FormField>

        <FormField label="Fuel Type *" error={errors.fuelType}>
          <select {...register('fuelType', { required: 'Fuel type is required' })} className="input-field">
            <option value="">Select fuel type</option>
            {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </FormField>

        <FormField label="Transmission *" error={errors.transmission}>
          <select {...register('transmission', { required: 'Transmission is required' })} className="input-field">
            <option value="">Select transmission</option>
            {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>

        <FormField label="Mileage (km/l) *" error={errors.mileage}>
          <input {...register('mileage', { required: 'Mileage is required', min: { value: 0, message: 'Must be positive' } })} type="number" step="0.1" className="input-field" placeholder="15.5" />
        </FormField>

        <FormField label="Engine *" error={errors.engine}>
          <input {...register('engine', { required: 'Engine is required' })} className="input-field" placeholder="e.g., 2.0L TwinPower Turbo" />
        </FormField>

        <FormField label="Horsepower (HP) *" error={errors.horsepower}>
          <input {...register('horsepower', { required: 'Horsepower is required', min: { value: 1, message: 'Must be at least 1' } })} type="number" className="input-field" placeholder="255" />
        </FormField>

        <FormField label="Price ($) *" error={errors.price}>
          <input {...register('price', { required: 'Price is required', min: { value: 0.01, message: 'Price must be > 0' } })} type="number" step="0.01" className="input-field" placeholder="45000" />
        </FormField>

        <FormField label="Interest Rate (%) *" error={errors.interestRate}>
          <input {...register('interestRate', { required: 'Interest rate is required', min: { value: 0, message: 'Must be >= 0' }, max: { value: 100, message: 'Must be <= 100' } })} type="number" step="0.1" className="input-field" placeholder="10.5" />
        </FormField>

        <FormField label="Stock Quantity *" error={errors.stockQuantity}>
          <input {...register('stockQuantity', { required: 'Stock is required', min: { value: 0, message: 'Cannot be negative' } })} type="number" className="input-field" placeholder="10" />
        </FormField>

        <FormField label="Status" error={errors.status}>
          <select {...register('status')} className="input-field">
            <option value="available">Available</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </FormField>
      </div>

      {/* Description */}
      <FormField label="Description" error={errors.description}>
        <textarea
          {...register('description', { maxLength: { value: 2000, message: 'Max 2000 characters' } })}
          rows={4}
          className="input-field resize-none"
          placeholder="Describe the car's features, condition, and highlights..."
        />
      </FormField>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base">
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Car className="w-5 h-5" /> {submitLabel}
          </>
        )}
      </button>
    </form>
  );
};

export default CarForm;
