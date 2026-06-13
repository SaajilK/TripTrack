import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useTripContext } from '../context/TripContext';

export default function AddExpenseModal({ isOpen, onClose, onSave, tripId, defaultDate, expenseToEdit }) {
  const { categories, trips } = useTripContext();
  const trip = trips.find((t) => t.id === tripId);
  const members = trip?.members || ['You'];

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    paidBy: 'You',
  });

  // Sync state when modal is opened for editing
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        amount: expenseToEdit.amount.toString(),
        category: expenseToEdit.category,
        description: expenseToEdit.description,
        date: expenseToEdit.date,
        paidBy: expenseToEdit.paidBy || 'You',
      });
    } else {
      setFormData({
        amount: '',
        category: categories.length > 0 ? categories[0].name : 'Food',
        description: '',
        date: defaultDate || new Date().toISOString().split('T')[0],
        paidBy: members[0] || 'You',
      });
    }
  }, [expenseToEdit, isOpen, defaultDate, categories, members]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.description || !formData.date) return;

    onSave({
      id: expenseToEdit ? expenseToEdit.id : uuidv4(),
      tripId,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      paidBy: formData.paidBy || 'You',
    });

    setFormData({
      amount: '',
      category: categories.length > 0 ? categories[0].name : 'Food',
      description: '',
      date: defaultDate || new Date().toISOString().split('T')[0],
      paidBy: members[0] || 'You',
    });
    onClose();
  };

  const isEditMode = !!expenseToEdit;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Expense" : "Add New Expense"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">₹</span>
            <input
              type="number"
              required
              min="0.01"
              step="any"
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
          {/* Scrollable grid to handle many dynamic custom categories beautifully */}
          <div className="max-h-48 overflow-y-auto pr-1 grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                  formData.category === cat.name
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm scale-[1.02]'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}
                onClick={() => setFormData({ ...formData, category: cat.name })}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Taxi to Eiffel Tower"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Paid By</label>
            <select
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-800"
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
            >
              {members.map((member) => (
                <option key={member} value={member}>
                  👤 {member}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full py-2.5">
            {isEditMode ? "Save Changes" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
