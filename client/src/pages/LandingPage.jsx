import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Shield, Zap, Star, Users, Car, TrendingUp,
  ChevronRight, Play, CheckCircle
} from 'lucide-react';
import { carService } from '../services/carService';
import CarCard from '../components/CarCard';
import Footer from '../components/Footer';

const stats = [
  { label: 'Cars Listed', value: '500+', icon: Car },
  { label: 'Happy Customers', value: '12K+', icon: Users },
  { label: 'Brands Available', value: '50+', icon: Star },
  { label: 'Years of Trust', value: '10+', icon: TrendingUp },
];

const features = [
  {
    icon: Shield,
    title: 'Secure Transactions',
    description: 'All purchases are protected with enterprise-grade security and JWT authentication.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: Zap,
    title: 'Real-time Inventory',
    description: 'Live stock tracking with instant updates when cars are purchased or restocked.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: Star,
    title: 'Premium Selection',
    description: 'Curated collection of luxury, sports, and everyday vehicles from top brands.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Car Enthusiast',
    review: 'CarHub made finding my dream BMW effortless. The interface is gorgeous and the inventory is always up to date!',
    rating: 5,
    avatar: 'SJ',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Michael Chen',
    role: 'Fleet Manager',
    review: 'As a fleet manager, the dashboard analytics and inventory management tools save me hours every week.',
    rating: 5,
    avatar: 'MC',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Emily Rodriguez',
    role: 'First-time Buyer',
    review: 'The search and filter features helped me find the perfect electric car within my budget. Highly recommend!',
    rating: 5,
    avatar: 'ER',
    color: 'from-violet-500 to-purple-500',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const LandingPage = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carService.getCars({ limit: 6, sort: 'newest' })
      .then((res) => setFeaturedCars(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-950 to-purple-950" />
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-8"
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Now live — 500+ premium vehicles
              </motion.div>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-white leading-tight mb-6"
              >
                Drive Your{' '}
                <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  Dream Car
                </span>{' '}
                Today
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={1}
                initial="hidden"
                animate="visible"
                className="text-lg text-gray-300 leading-relaxed mb-10 max-w-lg"
              >
                Explore our curated collection of premium vehicles. From luxury sedans to electric SUVs —
                find, manage, and purchase your perfect car with confidence.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={2}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/cars"
                  className="group inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-7 py-3.5 rounded-2xl hover:bg-primary-50 transition-all duration-200 shadow-2xl hover:-translate-y-0.5"
                >
                  Explore Cars
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-white/20 transition-all duration-200"
                >
                  Get Started Free
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                variants={fadeUp}
                custom={3}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-6 mt-10"
              >
                {['No hidden fees', 'Real-time stock', 'Secure payments'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right column — floating car cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                {/* Main card */}
                <div className="glass-card p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Featured</p>
                      <h3 className="text-2xl font-bold">Porsche 911</h3>
                    </div>
                    <span className="badge-green">In Stock</span>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&q=80"
                    alt="Porsche 911"
                    className="w-full h-44 object-cover rounded-xl mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-primary-400">$115,000</span>
                    <Link to="/cars" className="btn-primary text-sm py-2">
                      View All
                    </Link>
                  </div>
                </div>

                {/* Floating stat badge */}
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 glass-card p-4 text-white text-center"
                >
                  <p className="text-3xl font-black text-primary-400">500+</p>
                  <p className="text-xs text-gray-400">Cars Listed</p>
                </motion.div>

                <motion.div
                  animate={{ y: [8, -8, 8] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-6 glass-card p-4 text-white"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Sales Today</p>
                      <p className="text-lg font-bold">+24 Cars</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ── Stats Section ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-4xl font-black text-gray-900 dark:text-white mb-1">{value}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Cars ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="badge-blue mb-3">Featured Collection</span>
            <h2 className="section-title mb-4">
              Discover Our <span className="text-gradient">Top Picks</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Hand-selected vehicles combining luxury, performance, and value for the discerning buyer.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card overflow-hidden h-80 animate-pulse bg-gray-200 dark:bg-white/10 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car, i) => (
                <CarCard key={car._id} car={car} index={i} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/cars" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">
              View All Cars <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title mb-4">
              Why Choose <span className="text-gradient">CarHub?</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Built with the latest technology to give you the best car shopping experience possible.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description, color, bg }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="card p-8 text-center"
              >
                <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <Icon className={`w-8 h-8 ${color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title mb-4">
              What Our <span className="text-gradient">Customers Say</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(({ name, role, review, rating, avatar, color }, i) => (
              <motion.div
                key={name}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 italic">
                  "{review}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-purple-700 p-12 text-center"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <h2 className="text-4xl font-display font-black text-white mb-4 relative">
              Ready to Find Your Perfect Car?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto relative">
              Join thousands of satisfied customers. Sign up for free and start browsing today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center relative">
              <Link to="/register" className="bg-white text-primary-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-primary-50 transition-all hover:-translate-y-0.5 shadow-xl">
                Create Free Account
              </Link>
              <Link to="/cars" className="border-2 border-white/40 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-all">
                Browse Cars
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
