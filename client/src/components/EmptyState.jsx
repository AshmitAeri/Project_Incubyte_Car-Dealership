import React from 'react';
import { motion } from 'framer-motion';
import { Car, Search, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const icons = { car: Car, search: Search, shopping: ShoppingBag };

const EmptyState = ({
  title = 'Nothing here yet',
  description = 'Get started by adding your first item.',
  icon = 'car',
  action,
  actionLabel,
  actionTo,
}) => {
  const Icon = icons[icon] || Car;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-primary-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">{description}</p>
      {actionTo ? (
        <Link to={actionTo} className="btn-primary">
          <Plus className="w-4 h-4 inline mr-2" />
          {actionLabel || 'Get Started'}
        </Link>
      ) : action ? (
        <button onClick={action} className="btn-primary">
          <Plus className="w-4 h-4 inline mr-2" />
          {actionLabel || 'Get Started'}
        </button>
      ) : null}
    </motion.div>
  );
};

export default EmptyState;
