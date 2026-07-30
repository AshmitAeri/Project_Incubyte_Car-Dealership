import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Heart, Camera, Edit2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { authService } from '../services/authService';
import CarCard from '../components/CarCard';
import EmptyState from '../components/EmptyState';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      const res = await authService.updateProfile(formData);
      updateUser(res.data.data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=200`;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8"
        >
          {/* Profile Card */}
          <div className="card overflow-hidden mb-8">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-primary-600 to-purple-700" />

            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-24 h-24 rounded-2xl border-4 border-white dark:border-dark-100 object-cover shadow-xl"
                  />
                  <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary-600 text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field max-w-xs"
                        autoFocus
                      />
                      <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-4 flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => { setEditing(false); setName(user?.name); }} className="btn-secondary py-2 px-4">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-display font-black text-gray-900 dark:text-white">{user?.name}</h1>
                      <button onClick={() => setEditing(true)} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
                <span className={`${isAdmin() ? 'badge-blue' : 'badge-green'} self-start sm:self-auto`}>
                  <Shield className="w-3 h-3 inline mr-1" />
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Mail, label: 'Email', value: user?.email },
                  { icon: Calendar, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A' },
                  { icon: Heart, label: 'Wishlist Items', value: wishlist.length },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-white/10 rounded-xl p-1 mb-6 w-fit">
            {['profile', 'wishlist'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-dark-100 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'wishlist' ? `❤️ Wishlist (${wishlist.length})` : '👤 Profile Info'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">{user?.name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">{user?.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</label>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white capitalize">{user?.role}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Status</label>
                  <p className="mt-1"><span className="badge-green">Active</span></p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            wishlist.length === 0 ? (
              <EmptyState
                title="Your wishlist is empty"
                description="Browse cars and click the ❤️ to save your favorites here."
                icon="car"
                actionTo="/cars"
                actionLabel="Browse Cars"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((car, i) => (
                  <CarCard key={car._id} car={car} index={i} />
                ))}
              </div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
