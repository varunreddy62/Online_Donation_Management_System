import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Trophy, DollarSign, CalendarDays, AlertCircle, Users } from 'lucide-react';
import api from '../services/api';

export default function AnalyticsPage() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [donorCount, setDonorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const [totalRes, monthlyRes, topDonorsRes, donorsRes] = await Promise.all([
          api.get('/analytics/total'),
          api.get('/analytics/monthly'),
          api.get('/analytics/top-donors?limit=5'),
          api.get('/donors'),
        ]);

        setTotalAmount(totalRes.data?.totalAmount || 0);
        setMonthlyData(monthlyRes.data || []);
        setTopDonors(topDonorsRes.data || []);
        setDonorCount(Array.isArray(donorsRes.data) ? donorsRes.data.length : 0);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load analytics.');
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  // Calculate max for bar chart scaling
  const maxMonthlyAmount = Math.max(...monthlyData.map(d => d.total || 0), 1);

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-dark"
        >
          Analytics & Insights
        </motion.h1>
        <p className="text-dark/60 mt-1">Deep dive into donation trends and donor activity.</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Monthly Chart */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card rounded-2xl p-6 relative overflow-hidden h-96 flex flex-col"
          >
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-dark flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-primary" /> Monthly Donations Overview
                </h3>
                <p className="text-sm text-dark/50 mt-1 tracking-wide">
                  {monthlyData.length > 0 ? `${monthlyData.length} months of data` : 'No data yet'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-dark/50 font-medium uppercase tracking-wider">Total Raised</p>
                {loading ? (
                  <div className="h-9 w-32 bg-neutral/40 rounded animate-pulse mt-1"></div>
                ) : (
                  <p className="text-3xl font-bold tracking-tight text-accent">{formatCurrency(totalAmount)}</p>
                )}
              </div>
            </div>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center animate-pulse text-dark/50">Loading chart data...</div>
            ) : monthlyData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-dark/50">
                <div className="text-center">
                  <p className="text-lg font-medium">No monthly data yet</p>
                  <p className="text-sm mt-1">Add some donations to see trends here.</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-end space-x-2 md:space-x-4 justify-between mt-auto border-b border-neutral/40 pb-2 relative z-10">
                {monthlyData.map((data, i) => {
                  const heightPercent = ((data.total || 0) / maxMonthlyAmount) * 80 + 5; // min 5% height
                  return (
                    <div key={data.month || i} className="flex flex-col items-center flex-1 group">
                      <div className="relative w-full flex justify-center h-[250px] items-end pb-2">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-dark text-white text-xs font-bold py-1 px-2 rounded-lg shadow-elevated transition-all z-20 whitespace-nowrap">
                          {formatCurrency(data.total)}
                        </div>
                        
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 1, delay: i * 0.1, type: 'spring' }}
                          className="w-full max-w-sm bg-gradient-to-t from-primary/60 to-primary rounded-t-lg group-hover:from-primary/80 group-hover:to-secondary transition-all duration-300 relative overflow-hidden"
                        >
                          <div className="absolute inset-x-0 top-0 h-1 bg-white/50"></div>
                        </motion.div>
                      </div>
                      <span className="text-xs font-semibold text-dark/50 mt-4">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card rounded-2xl p-6 border-l-4 border-l-accent">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark/60">Total Donations</p>
                  {loading ? (
                    <div className="h-7 w-24 bg-neutral/40 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-dark">{formatCurrency(totalAmount)}</p>
                  )}
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card rounded-2xl p-6 border-l-4 border-l-primary">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark/60">Total Donors</p>
                  {loading ? (
                    <div className="h-7 w-16 bg-neutral/40 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-dark">{donorCount}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column - Top Donors */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-neutral/60 bg-secondary/10">
            <h3 className="text-xl font-bold text-dark flex items-center">
              <Trophy className="w-5 h-5 mr-3 text-yellow-500" /> Top Donors
            </h3>
            <p className="text-sm text-dark/50 mt-1">Highest impact supporters.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
               <div className="flex-1 flex items-center justify-center p-12 text-dark/50 animate-pulse">Loading list...</div>
            ) : topDonors.length === 0 ? (
              <div className="flex items-center justify-center p-12 text-dark/50 text-center">
                <div>
                  <p className="font-medium">No donors yet</p>
                  <p className="text-xs mt-1">Add donors and donations to see the leaderboard.</p>
                </div>
              </div>
            ) : (
               <ul className="space-y-1">
                {topDonors.map((donor, idx) => (
                  <motion.li 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    key={idx} 
                    className="p-4 rounded-xl hover:bg-background/60 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                         idx === 0 ? 'bg-yellow-100 text-yellow-600 ring-1 ring-yellow-300' :
                         idx === 1 ? 'bg-slate-100 text-slate-500 ring-1 ring-slate-300' :
                         idx === 2 ? 'bg-orange-100 text-orange-500 ring-1 ring-orange-300' :
                         'bg-neutral/30 border border-neutral text-dark/50'
                       }`}>
                         #{idx + 1}
                       </div>
                       <div>
                         <p className="font-semibold text-dark text-sm">{donor.donorName}</p>
                         <p className="text-xs text-dark/50">{donor.donationCount} donation{donor.donationCount !== 1 ? 's' : ''}</p>
                       </div>
                    </div>
                    <div className="font-bold text-accent text-sm group-hover:scale-105 transition-transform">
                      {formatCurrency(donor.totalAmount)}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
