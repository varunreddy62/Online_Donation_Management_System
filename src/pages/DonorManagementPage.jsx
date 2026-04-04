import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import api from '../services/api';

const PAYMENT_TYPES = ['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Online'];

export default function DonorManagementPage() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', amount: '', paymentType: '' });
  const [formError, setFormError] = useState('');

  // Fetch donors from backend
  const fetchDonors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/donors');
      setDonors(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load donors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const filteredDonors = useMemo(() => {
    if (!searchQuery.trim()) return donors;
    const q = searchQuery.toLowerCase();
    return donors.filter(d =>
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.phone?.toLowerCase().includes(q)
    );
  }, [donors, searchQuery]);

  const handleOpenModal = (donor = null) => {
    setFormError('');
    if (donor) {
      setEditingDonor(donor);
      // Strip +91 prefix for editing
      const phoneNum = donor.phone?.startsWith('+91 ') ? donor.phone.slice(4) : (donor.phone || '');
      setFormData({ name: donor.name, email: donor.email, phone: phoneNum, amount: '', paymentType: '' });
    } else {
      setEditingDonor(null);
      setFormData({ name: '', email: '', phone: '', amount: '', paymentType: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFormError('Name and Email are required.');
      return;
    }
    // Validate amount and paymentType when creating new donor with donation
    if (!editingDonor && formData.amount && !formData.paymentType) {
      setFormError('Please select a payment type for the donation.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      // Prepend +91 to phone number
      const phoneWithCode = formData.phone ? `+91 ${formData.phone}` : '';
      const donorPayload = { name: formData.name, email: formData.email, phone: phoneWithCode };

      let savedDonor;
      if (editingDonor) {
        savedDonor = await api.put(`/donors/${editingDonor.id}`, donorPayload);
      } else {
        savedDonor = await api.post('/donors', donorPayload);
      }

      // If amount is provided and this is a new donor, also create a donation
      if (!editingDonor && formData.amount && parseFloat(formData.amount) > 0) {
        const donorId = savedDonor.data?.id;
        if (donorId) {
          await api.post('/donations', {
            donorId: donorId,
            amount: parseFloat(formData.amount),
            paymentType: formData.paymentType || null,
            date: null,
          });
        }
      }

      setIsModalOpen(false);
      fetchDonors();
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || 'Failed to save donor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donor? This will also delete all their donations.")) return;
    try {
      await api.delete(`/donors/${id}`);
      fetchDonors();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete donor.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-dark"
          >
            Donor Management
          </motion.h1>
          <p className="text-dark/60 mt-1">Manage all your donors in one place.</p>
        </div>
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Donor
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
        <div className="p-6 border-b border-neutral/60 flex justify-between items-center">
          <div className="flex items-center bg-white border border-neutral rounded-lg px-3 py-2 w-72 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
            <Search className="w-4 h-4 text-dark/40 mr-2" />
            <input 
              type="text" 
              placeholder="Search donor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-dark w-full placeholder-dark/40"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-dark/50 animate-pulse text-lg">Loading donors...</div>
          ) : filteredDonors.length === 0 ? (
            <div className="p-16 text-center text-dark/50">
              <p className="text-lg font-medium">{searchQuery ? 'No donors match your search.' : 'No donors yet.'}</p>
              <p className="text-sm mt-1">{!searchQuery && 'Click "Add New Donor" to get started.'}</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/20 text-dark/60 border-b border-neutral/40">
                  <th className="px-6 py-4 font-semibold text-sm">Name</th>
                  <th className="px-6 py-4 font-semibold text-sm">Email</th>
                  <th className="px-6 py-4 font-semibold text-sm">Phone</th>
                  <th className="px-6 py-4 font-semibold text-sm">Total Donated</th>
                  <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((donor, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={donor.id} 
                    className="border-b border-neutral/30 hover:bg-background/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-dark">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-neutral/40">
                          {donor.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span>{donor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark/60">{donor.email}</td>
                    <td className="px-6 py-4 text-dark/60">{donor.phone || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-accent">{formatCurrency(donor.totalDonated)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(donor)} className="p-2 text-dark/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(donor.id)} className="p-2 text-dark/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingDonor ? "Edit Donor" : "Add New Donor"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{formError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-dark/60 mb-2">Full Name</label>
            <input 
              type="text" required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input-base"
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/60 mb-2">Email Address</label>
            <input 
              type="email" required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input-base"
              placeholder="e.g. rahul@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark/60 mb-2">Phone Number</label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-2.5 bg-secondary/20 border border-r-0 border-neutral rounded-l-lg text-dark/70 text-sm font-medium">
                🇮🇳 +91
              </span>
              <input 
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  // Only allow digits, max 10
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({...formData, phone: val});
                }}
                className="input-base rounded-l-none"
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
          </div>

          {/* Donation fields — only show when adding a new donor */}
          {!editingDonor && (
            <>
              <div className="pt-2 border-t border-neutral/40">
                <p className="text-sm font-semibold text-dark/70 mb-4">Initial Donation (Optional)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/60 mb-2">Donation Amount (₹)</label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-2.5 bg-secondary/20 border border-r-0 border-neutral rounded-l-lg text-dark/70 text-sm font-medium">
                    ₹
                  </span>
                  <input 
                    type="number" min="0" step="0.01"
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
            </>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingDonor ? "Save Changes" : "Create Donor"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
