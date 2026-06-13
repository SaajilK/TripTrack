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
  const [members, setMembers] = useState(['You']);
  const [newMember, setNewMember] = useState('');

  // Sync state when editing a trip
  useEffect(() => {
    if (tripToEdit) {
      setFormData({
        name: tripToEdit.name,
        startDate: tripToEdit.startDate,
        endDate: tripToEdit.endDate || '',
        budget: tripToEdit.budget ? tripToEdit.budget.toString() : '',
      });
      setMembers(tripToEdit.members && tripToEdit.members.length > 0 ? tripToEdit.members : ['You']);
    } else {
      setFormData({ name: '', startDate: '', endDate: '', budget: '' });
      setMembers(['You']);
    }
    setNewMember('');
  }, [tripToEdit, isOpen]);

  const handleAddMember = (e) => {
    if (e) e.preventDefault();
    const cleanName = newMember.trim();
    if (!cleanName) return;
    if (members.some(m => m.toLowerCase() === cleanName.toLowerCase())) {
      alert('Member name already exists!');
      return;
    }
    setMembers([...members, cleanName]);
    setNewMember('');
  };

  const handleRemoveMember = (nameToRemove) => {
    if (nameToRemove === 'You') return;
    setMembers(members.filter(m => m !== nameToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate) return;

    onSave({
      id: tripToEdit ? tripToEdit.id : uuidv4(),
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate || '',
      budget: formData.budget ? parseFloat(formData.budget) : 0,
      members: members.length > 0 ? members : ['You'],
    });
    
    setFormData({ name: '', startDate: '', endDate: '', budget: '' });
    setMembers(['You']);
    setNewMember('');
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Trip Members</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Alice"
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors focus:outline-none"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/50 border border-slate-100 rounded-xl min-h-12 items-center">
            {members.map((member) => (
              <span
                key={member}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-xs"
              >
                👤 {member}
                {member !== 'You' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member)}
                    className="text-slate-400 hover:text-red-500 font-bold ml-0.5 focus:outline-none text-sm leading-none"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
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
