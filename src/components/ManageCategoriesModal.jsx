import { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useTripContext } from '../context/TripContext';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

export default function ManageCategoriesModal({ isOpen, onClose }) {
  const { categories, addCategory, deleteCategory } = useTripContext();
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🏷️');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setErrorMsg('');
    const success = addCategory(newCatName.trim(), newCatEmoji.trim());
    
    if (success) {
      setNewCatName('');
      setNewCatEmoji('🏷️');
    } else {
      setErrorMsg('A category with this name already exists.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Categories">
      <div className="space-y-6">
        
        {/* Category List */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Categories</label>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
            {categories.map((cat) => (
              <div 
                key={cat.name} 
                className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
                  {cat.isDefault && (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-55 px-1.5 py-0.5 rounded-md border border-slate-100 uppercase tracking-wider">
                      Core
                    </span>
                  )}
                </div>

                {!cat.isDefault && (
                  <button
                    onClick={() => deleteCategory(cat.name)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add New Custom Category Form */}
        <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-4 space-y-3.5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Add Custom Category</label>
          
          {errorMsg && (
            <div className="flex items-center gap-1.5 p-2.5 bg-red-50 text-red-700 text-xs font-medium rounded-xl">
              <AlertCircle size={14} />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Emoji</label>
              <input
                type="text"
                maxLength="4"
                placeholder="🏷️"
                className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Category Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Gifts"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-md transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        </form>

      </div>
    </Modal>
  );
}
