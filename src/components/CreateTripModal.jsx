import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function CreateTripModal({ isOpen, onClose, onSave, tripToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budget: ''
  });

  // Sync state when editing a trip
  useEffect(() => {
    if (tripToEdit) {
      setFormData({
        name: tripToEdit.name,
        startDate: tripToEdit.startDate,
        endDate: tripToEdit.endDate || '',
        budget: tripToEdit.budget ? tripToEdit.budget.toString() : '',
      });
    } else {
      setFormData({ name: '', startDate: '', endDate: '', budget: '' });
    }
  }, [tripToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // End Date is now optional!
    if (!formData.name || !formData.startDate) return;

    onSave({
      id: tripToEdit ? tripToEdit.id : uuidv4(),
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate || '', // Safe fallback
      budget: formData.budget ? parseFloat(formData.budget) : 0,
    });
    
    setFormData({ name: '', startDate: '', endDate: '', budget: '' });
    onClose();
  };

  const isEditMode = !!tripToEdit;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Trip Details" : "Create New Trip"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Trip Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Summer in Paris"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.endDate}
              min={formData.startDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Budget (Optional)</label>
          <input
            type="number"
            min="0"
            placeholder="0.00"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full">
            {isEditMode ? "Save Changes" : "Create Trip"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
