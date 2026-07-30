import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, X, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const STORAGE_KEY = 'compareCarId';

const CompareButton = ({ car }) => {
  const navigate = useNavigate();
  const [firstCar, setFirstCar] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handler = () => {
      try {
        setFirstCar(JSON.parse(localStorage.getItem(STORAGE_KEY)));
      } catch {
        setFirstCar(null);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isSelected = firstCar?._id === car._id;
  const hasFirst = !!firstCar && !isSelected;

  const handleClick = () => {
    if (isSelected) {
      // Deselect
      localStorage.removeItem(STORAGE_KEY);
      setFirstCar(null);
      window.dispatchEvent(new Event('storage'));
      toast.info('Car removed from compare');
      return;
    }

    if (hasFirst) {
      // Compare with already selected car
      const id1 = firstCar._id;
      const id2 = car._id;
      localStorage.removeItem(STORAGE_KEY);
      setFirstCar(null);
      window.dispatchEvent(new Event('storage'));
      navigate(`/compare?car1=${id1}&car2=${id2}`);
      return;
    }

    // Select as first car
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ _id: car._id, name: car.name }));
    setFirstCar({ _id: car._id, name: car.name });
    window.dispatchEvent(new Event('storage'));
    toast.success(`"${car.name}" selected — now pick a second car to compare!`, { autoClose: 4000 });
  };

  return (
    <button
      onClick={handleClick}
      title={
        isSelected ? 'Remove from compare'
          : hasFirst ? `Compare with "${firstCar.name}"`
          : 'Select to compare'
      }
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        isSelected
          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400'
          : hasFirst
          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
          : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-300'
      }`}
    >
      {isSelected ? (
        <><X className="w-3.5 h-3.5" /> Deselect</>
      ) : hasFirst ? (
        <><Check className="w-3.5 h-3.5" /> Compare Now</>
      ) : (
        <><GitCompare className="w-3.5 h-3.5" /> Compare</>
      )}
    </button>
  );
};

export default CompareButton;
