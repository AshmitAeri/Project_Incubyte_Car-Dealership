import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 px-6 text-center"
  >
    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mb-6">
      <AlertTriangle className="w-10 h-10 text-red-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops! An error occurred</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary flex items-center gap-2">
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    )}
  </motion.div>
);

export default ErrorState;
