import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Home, Search } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        className="text-9xl mb-8"
      >
        🚗
      </motion.div>
      <h1 className="text-8xl font-display font-black text-gradient mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Looks like you took a wrong turn. The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary flex items-center gap-2 justify-center">
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link to="/cars" className="btn-secondary flex items-center gap-2 justify-center">
          <Car className="w-4 h-4" /> Browse Cars
        </Link>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;
