import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
          />
          
          {/* Premium Bottom Sheet on Mobile / Centered Modal on Desktop */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed bottom-0 sm:bottom-auto sm:inset-0 sm:m-auto w-full sm:w-[90%] sm:max-w-md sm:h-fit bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] sm:max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-slate-800">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Form Content - Scrollable on mobile to avoid keyboard cover bugs */}
            <div className="p-5 overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
