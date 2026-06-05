import { useState, useMemo } from 'react';
import { Plus, Calendar, Globe } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import CreateTripModal from '../components/CreateTripModal';
import { formatCurrency } from '../utils/format';
import { differenceInDays, format } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const { trips, expenses, addTrip } = useTripContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGlobalStats, setShowGlobalStats] = useState(true);

  // Global Analytics calculations
  const globalStats = useMemo(() => {
    if (trips.length === 0) return null;

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalTransactions = expenses.length;
    
    // Calculate total days across all trips
    const totalDays = trips.reduce((sum, trip) => {
      const tripDays = trip.endDate
        ? differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1
        : Math.max(1, differenceInDays(new Date(), new Date(trip.startDate)) + 1);
      return sum + tripDays;
    }, 0);

    const averageDaily = totalDays > 0 ? totalSpent / totalDays : 0;

    // Calculate most expensive category overall
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    let topCategory = 'None';
    let maxSpent = 0;
    Object.keys(categoryTotals).forEach((cat) => {
      if (categoryTotals[cat] > maxSpent) {
        maxSpent = categoryTotals[cat];
        topCategory = cat;
      }
    });

    const categoryEmojis = {
      Food: '🍔',
      Transport: '🚕',
      Hotel: '🏨',
      Shopping: '🛍️',
      Activities: '🎡',
      Miscellaneous: '📦',
      None: '✈️'
    };

    return {
      totalSpent,
      totalTransactions,
      averageDaily,
      topCategory: `${categoryEmojis[topCategory] || '✈️'} ${topCategory}`,
      totalDays
    };
  }, [trips, expenses]);

  const getTripStats = (trip) => {
    const tripExpenses = expenses.filter((e) => e.tripId === trip.id);
    const totalSpent = tripExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Check if end date exists, otherwise calculate duration up to today
    const days = trip.endDate
      ? differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1
      : Math.max(1, differenceInDays(new Date(), new Date(trip.startDate)) + 1);

    return { totalSpent, days };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Adventure Awaits
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Create, manage, and track your global travel expenses in one place.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus size={20} />
          Create Trip
        </button>
      </div>

      {/* Global Analytics Section */}
      {globalStats && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-800 text-base">Nomad Overview (Global Analytics)</h2>
            </div>
            <button 
              onClick={() => setShowGlobalStats(!showGlobalStats)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showGlobalStats ? 'Hide Panel' : 'Show Panel'}
            </button>
          </div>

          {showGlobalStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Travel Spent</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(globalStats.totalSpent)}</span>
              </div>
              
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Daily Avg (Global)</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(globalStats.averageDaily)}</span>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Top Spend Category</span>
                <span className="text-base font-bold text-slate-800 line-clamp-1 mt-0.5">{globalStats.topCategory}</span>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Logs Count</span>
                <span className="text-xl font-black text-slate-900">{globalStats.totalTransactions} charges</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
            <Plus size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No journeys tracked yet</h3>
          <p className="text-slate-500 mt-2 max-w-sm text-sm">
            Ready for your next adventure? Add a trip and start logging your travel expenses in real time.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/15"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, idx) => {
            const { totalSpent, days } = getTripStats(trip);
            const isOverBudget = trip.budget > 0 && totalSpent > trip.budget;
            const progress = trip.budget > 0 ? (totalSpent / trip.budget) * 100 : 0;
            const formattedStart = format(new Date(trip.startDate), 'MMM dd');
            const formattedEnd = trip.endDate 
              ? format(new Date(trip.endDate), 'MMM dd, yyyy')
              : 'Ongoing';

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={trip.id}
                className="group relative bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-slate-200/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                      <Calendar size={12} />
                      {trip.endDate ? `${days} Days` : `Ongoing (${days}d)`}
                    </span>
                  </div>

                  <Link to={`/trip/${trip.id}`} className="block">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                      {trip.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-6 font-medium">
                      {formattedStart} – {formattedEnd}
                    </p>
                  </Link>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">
                        Total Spent
                      </span>
                      <span className="text-2xl font-extrabold text-slate-900">
                        {formatCurrency(totalSpent)}
                      </span>
                    </div>

                    {trip.budget > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">
                          Budget
                        </span>
                        <span className="text-sm font-semibold text-slate-600">
                          {formatCurrency(trip.budget)}
                        </span>
                      </div>
                    )}
                  </div>

                  {trip.budget > 0 && (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget ? 'bg-red-500' : progress > 85 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-slate-400">
                        <span>{Math.round(progress)}% Used</span>
                        {isOverBudget && (
                          <span className="text-red-500 font-semibold">Over Budget!</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Floating Plus Button for Mobile/Comfort */}
      {trips.length > 0 && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30 z-30 md:hidden"
        >
          <Plus size={24} />
        </button>
      )}

      <CreateTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={addTrip} 
      />
    </div>
  );
}
