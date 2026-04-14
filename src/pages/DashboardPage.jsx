import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, delay, loading }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="card rounded-2xl p-6 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-neutral/40 flex items-center justify-center text-primary">
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-dark/60 text-sm font-medium mb-1">{title}</h3>
      {loading ? (
        <div className="h-9 w-24 bg-neutral/40 rounded animate-pulse"></div>
      ) : (
        <p className="text-3xl font-bold text-dark tracking-tight">{value}</p>
      )}
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [donorCount, setDonorCount] = useState(0);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [totalRes, donorsRes, donationsRes] = await Promise.all([
          api.get('/analytics/total'),
          api.get('/donors'),
          api.get('/donations?page=0&size=5&sort=date,desc'),
        ]);
        
        setTotalAmount(totalRes.data?.totalAmount || 0);
        setDonorCount(Array.isArray(donorsRes.data) ? donorsRes.data.length : 0);
        setRecentDonations(donationsRes.data?.content || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load dashboard data.');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <header className="mb-10">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-dark"
        >
          Dashboard Overview
        </motion.h1>
        <p className="text-dark/60 mt-2">Welcome back! Here's what's happening today.</p>
      </header>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Donations" value={formatCurrency(totalAmount)} icon={DollarSign} delay={0.1} loading={loading} />
        <StatCard title="Total Donors" value={donorCount.toLocaleString()} icon={Users} delay={0.2} loading={loading} />
        <StatCard title="Avg. Donation" value={donorCount > 0 && totalAmount > 0 ? formatCurrency(totalAmount / donorCount) : '$0.00'} icon={TrendingUp} delay={0.3} loading={loading} />
      </div>

      {/* Recent Donations List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card rounded-2xl overflow-hidden mt-8"
      >
        <div className="p-6 border-b border-neutral/60 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-dark">Recent Donations</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-dark/50 animate-pulse font-medium">Loading recent transactions...</div>
          ) : recentDonations.length === 0 ? (
            <div className="p-12 text-center text-dark/50">
              <p className="text-lg font-medium">No donations yet</p>
              <p className="text-sm mt-1">Add your first donation to see it here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/20 text-dark/60">
                  <th className="px-6 py-4 font-medium text-sm">Donor</th>
                  <th className="p x-6 py-4 font-medium text-sm">Amount</th>
                  <th className="px-6 py-4 font-medium text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((item) => (
                  <tr key={item.id} className="border-b border-neutral/40 hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 text-dark font-medium">{item.donorName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-accent font-semibold">{formatCurrency(item.amount)}</td>
                    <td className="px-6 py-4 text-dark/50 text-sm">{formatDate(item.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
