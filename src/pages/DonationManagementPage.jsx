import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Calendar, AlertCircle, Loader2, Trash2, Edit2, CreditCard } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import api from '../services/api';

const PAYMENT_TYPES = ['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Online'];

const paymentBadgeColors = {
  'Cash': 'bg-green-100 text-green-700',
  'UPI': 'bg-purple-100 text-purple-700',
  'Bank Transfer': 'bg-blue-100 text-blue-700',
  'Credit Card': 'bg-orange-100 text-orange-700',
  'Debit Card': 'bg-amber-100 text-amber-700',
  'Cheque': 'bg-slate-100 text-slate-700',
  'Online': 'bg-cyan-100 text-cyan-700',
};

export default function DonationManagementPage() {
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [formData, setFormData] = useState({ donorId: '', amount: '', date: '', paymentType: '' });
  const [formError, setFormError] = useState('');

  // Filtering and Pagination State
  const [filterDonor, setFilterDonor] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;

  // Fetch donations from backend with server-side pagination & filtering
  const fetchDonations = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page - 1); // Spring uses 0-indexed pages
      params.append('size', itemsPerPage);
      params.append('sort', 'date,desc');

      if (filterMinAmount) {
        params.append('minAmount', filterMinAmount);
        params.append('maxAmount', '999999999'); // large upper bound
      }

      const res = await api.get(`/donations?${params.toString()}`);
      setDonations(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load donations.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch donors list for the dropdown
  const fetchDonors = async () => {
    try {
      const res = await api.get('/donors');
      setDonors(res.data || []);
    } catch (err) {
      console.error('Failed to fetch donors for dropdown:', err);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    fetchDonations(currentPage);
  }, [currentPage, filterMinAmount]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (donation = null) => {
    setFormError('');
    if (donation) {
      setEditingDonation(donation);
      setFormData({
        donorId: String(donation.donorId || ''),
        amount: String(donation.amount || ''),
        date: donation.date || '',
        paymentType: donation.paymentType || '',
      });
    } else {
      setEditingDonation(null);
      setFormData({ donorId: '', amount: '', date: '', paymentType: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.donorId || !formData.amount) {
      setFormError('Donor and Amount are required.');
      return;
    }
    if (!formData.paymentType) {
      setFormError('Please select a payment type.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        donorId: parseInt(formData.donorId),
        amount: parseFloat(formData.amount),
        date: formData.date || null,
        paymentType: formData.paymentType || null,
      };

      if (editingDonation) {
        await api.put(`/donations/${editingDonation.id}`, payload);
      } else {
        await api.post('/donations', payload);
      }

      setIsModalOpen(false);
      setFormData({ donorId: '', amount: '', date: '', paymentType: '' });
      setEditingDonation(null);
      if (!editingDonation) {
        setCurrentPage(1);
        fetchDonations(1);
      } else {
        fetchDonations(currentPage);
      }
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to save donation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;
    try {
      await api.delete(`/donations/${id}`);
      fetchDonations(currentPage);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete donation.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Client-side donor name filter (applied on top of server data)
  const displayedDonations = filterDonor
    ? donations.filter(d => d.donorName?.toLowerCase().includes(filterDonor.toLowerCase()))
    : donations;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-dark"
          >
            Donations
          </motion.h1>
          <p className="text-dark/60 mt-1">Track and filter incoming donations. {totalElements > 0 && <span className="text-primary font-medium">({totalElements} total)</span>}</p>
        </div>
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Donation
        </motion.button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-neutral/60 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 bg-white border border-neutral rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
            <Filter className="w-4 h-4 text-dark/40 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Filter by Donor Name..." 
              value={filterDonor}
              onChange={(e) => setFilterDonor(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-dark w-full placeholder-dark/40"
            />
          </div>
          <div className="flex items-center space-x-2 bg-white border border-neutral rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
            <span className="text-dark/50 text-sm font-medium pl-1 mr-2 px-2 border-r border-neutral">Min ₹</span>
            <input 
              type="number" 
              placeholder="e.g. 500" 
              value={filterMinAmount}
              onChange={(e) => { setFilterMinAmount(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none outline-none text-sm text-dark w-full placeholder-dark/40"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center p-24 text-dark/50 animate-pulse text-lg font-medium">
              Loading donation records...
            </div>
          ) : displayedDonations.length === 0 ? (
            <div className="flex items-center justify-center p-24 text-dark/50">
              <div className="text-center">
                <p className="text-lg font-medium">No donations found</p>
                <p className="text-sm mt-1">Add a donation or adjust your filters.</p>
              </div>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/20 text-dark/60 border-b border-neutral/40">
                    <th className="px-6 py-4 font-semibold text-sm">ID</th>
                    <th className="px-6 py-4 font-semibold text-sm">Donor Name</th>
                    <th className="px-6 py-4 font-semibold text-sm">Date</th>
                    <th className="px-6 py-4 font-semibold text-sm">Payment Type</th>
                    <th className="px-6 py-4 font-semibold text-sm text-right">Amount</th>
                    <th className="px-6 py-4 font-semibold text-sm text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {displayedDonations.map((d, index) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        key={d.id} 
                        className="border-b border-neutral/30 hover:bg-background/50 transition-colors group"
                      >
                        <td className="px-6 py-4 text-dark/50 font-mono text-sm">#{d.id}</td>
                        <td className="px-6 py-4 font-medium text-dark">{d.donorName || 'Unknown'}</td>
                        <td className="px-6 py-4 text-dark/50 text-sm">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-2 text-dark/30" /> {formatDate(d.date)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {d.paymentType ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${paymentBadgeColors[d.paymentType] || 'bg-neutral/30 text-dark/60'}`}>
                              <CreditCard className="w-3 h-3 mr-1" />
                              {d.paymentType}
                            </span>
                          ) : (
                            <span className="text-dark/30 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-accent text-right">
                          {formatCurrency(d.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenModal(d)} 
                              className="p-2 text-dark/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="Edit donation"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(d.id)} 
                              className="p-2 text-dark/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete donation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </>
          )}
        </div>
        
        {!loading && totalPages > 1 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        )}
      </motion.div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingDonation(null); }} title={editingDonation ? "Edit Donation" : "Add New Donation"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{formError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-dark/60 mb-2">Select Donor</label>
            {donors.length === 0 ? (
              <p className="text-sm text-amber-600 p-3 bg-amber-50 rounded-lg border border-amber-200">
                No donors available. Please add a donor first.
              </p>
            ) : (
              <select
                required
                value={formData.donorId}
                onChange={(e) => setFormData({...formData, donorId: e.target.value})}
                className="input-base"
              >
                <option value="">-- Select a Donor --</option>
                {donors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/60 mb-2">Donation Amount (₹)</label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-2.5 bg-secondary/20 border border-r-0 border-neutral rounded-l-lg text-dark/70 text-sm font-medium">
                ₹
              </span>
              <input 
                type="number" required min="1" step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="input-base rounded-l-none"
                placeholder="e.g. 5000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/60 mb-2">Payment Type</label>
            <select
              required
              value={formData.paymentType}
              onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
              className="input-base"
            >
              <option value="">-- Select Payment Type --</option>
              {PAYMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/60 mb-2">Date {editingDonation ? '' : '(Optional — defaults to today)'}</label>
            <input 
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="input-base"
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-neutral/60 mt-6">
            <button type="button" onClick={() => { setIsModalOpen(false); setEditingDonation(null); }} className="btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary flex items-center" disabled={submitting || donors.length === 0}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingDonation ? "Save Changes" : "Confirm Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
