import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserHomePage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalAmount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/total');
        setStats({ totalAmount: res.data.totalAmount });
      } catch (err) {
        console.error("Failed to fetch public stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* User Navbar */}
      <nav className="bg-primary shadow-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary fill-current" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CharityCore</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                Supporter
              </span>
            </div>
            <div className="flex items-center gap-4 text-white">
              <span className="hidden sm:inline-block">Hello, {user?.name}</span>
              <button 
                onClick={logout}
                className="text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/10"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-dark tracking-tight mb-4"
          >
            Thank you for being part of our mission.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-dark/70 max-w-3xl mx-auto"
          >
            Your contributions help us reach communities in need. Every single donation makes an impact.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Global Impact Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 border border-neutral/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10" />
            <h3 className="text-lg font-semibold text-dark/70 mb-2">Total Community Impact</h3>
            <div className="flex items-center gap-4">
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : (
                <p className="text-5xl font-black text-primary tracking-tight">
                  {formatCurrency(stats.totalAmount)}
                </p>
              )}
            </div>
            <p className="mt-4 text-sm text-dark/60 leading-relaxed">
              This represents the collective power of all our donors. Together, we've raised this much to support ongoing projects and provide critical relief.
            </p>
          </motion.div>

          {/* Action Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-primary rounded-3xl p-8 shadow-xl text-white relative overflow-hidden"
          >
            <div className="absolute -bottom-8 -right-8 opacity-20">
              <Heart className="w-48 h-48" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Want to do more?</h3>
            <p className="text-white/80 leading-relaxed mb-8 relative z-10">
              Your continued support means the world to us. Reach out to coordinate recurring donations or volunteer for our upcoming charity drives.
            </p>
            <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-secondary hover:text-white transition-colors flex items-center gap-2 group relative z-10">
              Contact Support <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
