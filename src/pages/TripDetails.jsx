import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Search, Calendar, BarChart3, Info, Settings } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import AddExpenseModal from '../components/AddExpenseModal';
import CreateTripModal from '../components/CreateTripModal';
import ManageCategoriesModal from '../components/ManageCategoriesModal';
import { formatCurrency } from '../utils/format';
import { differenceInDays, format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { 
    trips, 
    expenses, 
    categories,
    updateTrip, 
    deleteTrip, 
    addExpense, 
    updateExpense, 
    deleteExpense 
  } = useTripContext();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = (e) => {
    e.preventDefault();
    const cleanName = newMemberName.trim();
    if (!cleanName) return;

    const currentMembers = trip.members || ['You'];
    if (currentMembers.some((m) => m.toLowerCase() === cleanName.toLowerCase())) {
      alert('Member already exists!');
      return;
    }

    updateTrip({
      ...trip,
      members: [...currentMembers, cleanName],
    });
    setNewMemberName('');
  };

  // Retrieve current trip
  const trip = useMemo(() => trips.find((t) => t.id === tripId), [trips, tripId]);

  // Dynamically build category lookup map
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.name] = { emoji: cat.emoji, bg: cat.bg, fill: cat.fill };
    });
    return map;
  }, [categories]);

  // Handle case where trip isn't found
  if (!trip) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800">Trip not found</h2>
        <p className="text-slate-500 mt-2 text-sm">The trip you are looking for does not exist or has been deleted.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
          <ArrowLeft size={16} /> Back to Trips
        </Link>
      </div>
    );
  }

  // Filter trip expenses
  const tripExpenses = useMemo(() => {
    return expenses.filter((e) => e.tripId === tripId);
  }, [expenses, tripId]);

  // Aggregate values
  const totalSpent = useMemo(() => {
    return tripExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [tripExpenses]);

  // End Date is now optional! If empty, calculate duration from start date up to today.
  const days = useMemo(() => {
    return trip.endDate
      ? differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1
      : Math.max(1, differenceInDays(new Date(), new Date(trip.startDate)) + 1);
  }, [trip]);

  const dailyAverage = useMemo(() => {
    return tripExpenses.length > 0 ? totalSpent / days : 0;
  }, [totalSpent, days, tripExpenses]);

  const remainingBudget = useMemo(() => {
    return trip.budget > 0 ? trip.budget - totalSpent : null;
  }, [trip.budget, totalSpent]);

  // Category summary values
  const categoryTotals = useMemo(() => {
    const totals = {};
    tripExpenses.forEach((exp) => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return totals;
  }, [tripExpenses]);

  // Splitting & debt calculations
  const splittingSummary = useMemo(() => {
    const tripMembers = trip.members || ['You'];
    const numMembers = tripMembers.length;
    const share = numMembers > 0 ? totalSpent / numMembers : 0;

    const memberPaid = {};
    tripMembers.forEach((m) => { memberPaid[m] = 0; });
    tripExpenses.forEach((e) => {
      const payer = e.paidBy || 'You';
      memberPaid[payer] = (memberPaid[payer] || 0) + e.amount;
    });

    return tripMembers.map((member) => {
      const paid = memberPaid[member] || 0;
      const balance = paid - share;
      const numExpenses = tripExpenses.filter((e) => (e.paidBy || 'You') === member).length;
      return {
        name: member,
        paid,
        share,
        balance,
        numExpenses
      };
    });
  }, [trip, tripExpenses, totalSpent]);

  const settlements = useMemo(() => {
    const tripMembers = trip.members || ['You'];
    const numMembers = tripMembers.length;
    if (numMembers <= 1 || tripExpenses.length === 0) return [];

    const share = totalSpent / numMembers;
    const memberPaid = {};
    tripMembers.forEach((m) => { memberPaid[m] = 0; });
    tripExpenses.forEach((e) => {
      const payer = e.paidBy || 'You';
      memberPaid[payer] = (memberPaid[payer] || 0) + e.amount;
    });

    const balances = tripMembers.map((m) => ({
      name: m,
      balance: (memberPaid[m] || 0) - share
    }));

    const debtors = balances.filter((b) => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    const creditors = balances.filter((b) => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

    const transactions = [];
    let dIdx = 0;
    let cIdx = 0;

    const localDebtors = debtors.map((d) => ({ ...d, balance: Math.abs(d.balance) }));
    const localCreditors = creditors.map((c) => ({ ...c }));

    while (dIdx < localDebtors.length && cIdx < localCreditors.length) {
      const debtor = localDebtors[dIdx];
      const creditor = localCreditors[cIdx];

      const amountToPay = Math.min(debtor.balance, creditor.balance);

      if (amountToPay > 0.01) {
        transactions.push({
          from: debtor.name,
          to: creditor.name,
          amount: amountToPay
        });
      }

      debtor.balance -= amountToPay;
      creditor.balance -= amountToPay;

      if (debtor.balance < 0.01) dIdx++;
      if (creditor.balance < 0.01) cIdx++;
    }

    return transactions;
  }, [trip, tripExpenses, totalSpent]);

  // Filter and search logic for display list
  const filteredExpenses = useMemo(() => {
    return tripExpenses.filter((exp) => {
      const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tripExpenses, searchQuery, selectedCategory]);

  // Group expenses by date for UI listing
  const groupedExpenses = useMemo(() => {
    const groups = {};
    filteredExpenses.forEach((exp) => {
      const dateStr = format(parseISO(exp.date), 'MMMM dd, yyyy');
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(exp);
    });
    return groups;
  }, [filteredExpenses]);

  // Handle Trip Deletion
  const handleDeleteTrip = () => {
    if (window.confirm('Are you sure you want to delete this entire trip and all its expenses?')) {
      deleteTrip(trip.id);
      navigate('/');
    }
  };

  // Handle Expense Deletion
  const handleDeleteExpense = (expenseId, description) => {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      deleteExpense(expenseId);
    }
  };

  // Handle opening modal for adding expense
  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  // Handle opening modal for editing expense
  const handleOpenEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  // Handle closing expense modal
  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setExpenseToEdit(null);
  };

  const formattedStart = format(new Date(trip.startDate), 'MMM dd');
  const formattedEnd = trip.endDate 
    ? format(new Date(trip.endDate), 'MMM dd, yyyy')
    : 'Ongoing';

  return (
    <div className="space-y-8 pb-20 animate-fade-in relative">
      {/* Back button & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} />
          Back to trips
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTripModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          >
            <Edit2 size={14} />
            Edit Trip
          </button>
          <button
            onClick={handleDeleteTrip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={14} />
            Delete Trip
          </button>
        </div>
      </div>

      {/* Hero Trip Info Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{trip.name}</h1>
        <p className="text-slate-500 mt-1 flex items-center gap-1.5 text-sm">
          <Calendar size={14} />
          {formattedStart} – {formattedEnd}
          <span className="text-slate-300">•</span>
          <span>{trip.endDate ? `${days} Days` : `Ongoing (${days}d)`}</span>
        </p>
      </div>

      {/* Sticky top summary section */}
      <div className="sticky top-[65px] z-20 grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-md backdrop-blur-md bg-white/95">
        <div className="text-center md:text-left md:px-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Total Spent</span>
          <span className="text-lg md:text-2xl font-black text-slate-900">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="text-center md:text-left md:px-2 border-x border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Daily Avg</span>
          <span className="text-lg md:text-2xl font-black text-slate-900">{formatCurrency(dailyAverage)}</span>
        </div>
        <div className="text-center md:text-left md:px-2">
          {remainingBudget !== null ? (
            <>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Remaining</span>
              <span className={`text-lg md:text-2xl font-black ${remainingBudget < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {formatCurrency(remainingBudget)}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Budget</span>
              <span className="text-lg md:text-2xl font-black text-slate-400">N/A</span>
            </>
          )}
        </div>
      </div>

      {/* Budget Limit Alert */}
      {remainingBudget !== null && remainingBudget < 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
          <Info className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-bold text-red-800">You are over budget!</h4>
            <p className="text-xs text-red-600/90 mt-0.5">
              You've exceeded your designated budget by {formatCurrency(Math.abs(remainingBudget))}. Let's keep a closer eye on upcoming expenses.
            </p>
          </div>
        </div>
      )}

      {/* Analytics & Category Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart3 size={18} className="text-slate-600" />
            <h2 className="text-lg font-bold text-slate-800">Category Breakdown</h2>
          </div>
          <button 
            onClick={() => setIsManageCategoriesOpen(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2.5 py-1.5 hover:bg-blue-50 rounded-xl transition-all"
          >
            <Settings size={13} />
            Customize Categories
          </button>
        </div>

        {tripExpenses.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6 text-center text-slate-400 text-sm">
            Add expenses to see category-wise breakdown.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const spent = categoryTotals[cat.name] || 0;
              const pct = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;

              return (
                <div key={cat.name} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-400">{Math.round(pct)}%</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-slate-500 block">{cat.name}</span>
                    <span className="text-sm font-bold text-slate-800">{formatCurrency(spent)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${cat.fill}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Members & Splitting Dashboard */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">👥</span>
          <h2 className="text-lg font-bold text-slate-800">Members & Splitting Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Member Balances */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member Balances</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {splittingSummary.map((item) => {
                const isCreditor = item.balance > 0.01;
                const isDebtor = item.balance < -0.01;
                const absBalance = Math.abs(item.balance);
                
                return (
                  <div 
                    key={item.name}
                    className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-3 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{item.numExpenses} transactions</span>
                        </div>
                      </div>
                      
                      {/* Balance status badge */}
                      {isCreditor && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/30">
                          Owed {formatCurrency(absBalance)}
                        </span>
                      )}
                      {isDebtor && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-500 border border-red-100/30">
                          Owes {formatCurrency(absBalance)}
                        </span>
                      )}
                      {!isCreditor && !isDebtor && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                          Settled up
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between border-t border-slate-100/80 pt-2.5 text-xs text-slate-500">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Paid</span>
                        <span className="font-bold text-slate-700">{formatCurrency(item.paid)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Share</span>
                        <span className="font-medium text-slate-600">{formatCurrency(item.share)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Splitting Settlements & Quick Add */}
          <div className="flex flex-col gap-6">
            {/* Settlements Panel */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex-1 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Transfers</h3>
              
              {settlements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 text-xs gap-1.5 h-full">
                  <span className="text-xl">🎉</span>
                  <p className="font-semibold text-slate-600">All settled up!</p>
                  <p className="text-[10px] max-w-[180px]">No transfers are needed to balance this trip's budget.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {settlements.map((tx, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-blue-50/30 border border-blue-100/20 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <span className="text-slate-900">{tx.from}</span>
                        <span className="text-blue-500 text-[10px]">➔</span>
                        <span className="text-slate-900">{tx.to}</span>
                      </div>
                      <span className="font-black text-blue-600">{formatCurrency(tx.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Form Panel */}
            <div className="bg-slate-50/50 border border-dashed border-slate-200 p-4 rounded-3xl space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700">Add Trip Member</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Invite others to split costs.</p>
              </div>
              <form onSubmit={handleAddMember} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name (e.g. Alice)"
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors focus:outline-none"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800">Trip Expenses</h2>
          
          <button
            onClick={handleOpenAddExpense}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition-all hover:scale-[1.01]"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>

        {/* Filter / Search Bar Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Added 'no-scrollbar' for standard dynamic mobile scrolls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Expenses List */}
        {tripExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-3xl mb-3">🏷️</span>
            <h3 className="text-md font-bold text-slate-800">No expenses logged</h3>
            <p className="text-slate-500 text-xs mt-1">Tap the button above to add your first expense.</p>
          </div>
        ) : Object.keys(groupedExpenses).length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
            No expenses match your search/filters.
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {Object.keys(groupedExpenses).map((dateStr) => (
                <div key={dateStr} className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-400 tracking-wide uppercase px-1">{dateStr}</h3>
                  <div className="space-y-2">
                    {groupedExpenses[dateStr].map((exp) => {
                      const catDetails = categoryMap[exp.category] || categoryMap['Miscellaneous'];
                      return (
                        <motion.div
                          key={exp.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${catDetails.bg}`}>
                              {catDetails.emoji}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1">{exp.description}</h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                  {exp.category}
                                </span>
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100/30">
                                  👤 Paid by {exp.paidBy || 'You'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-black text-slate-900 text-sm md:text-base">{formatCurrency(exp.amount)}</span>
                            {/* Make action buttons ALWAYS visible on mobile/touch screens (since hover doesn't exist on phones) */}
                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEditExpense(exp)}
                                className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(exp.id, exp.description)}
                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Add Expense FAB (Visible on Mobile only) */}
      <button
        onClick={handleOpenAddExpense}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30 z-30 md:hidden animate-bounce"
      >
        <Plus size={24} />
      </button>

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseExpenseModal}
        onSave={expenseToEdit ? updateExpense : addExpense}
        tripId={trip.id}
        defaultDate={trip.startDate}
        expenseToEdit={expenseToEdit}
      />

      {/* Edit Trip Modal */}
      <CreateTripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        onSave={updateTrip}
        tripToEdit={trip}
      />

      {/* Customize Categories Modal */}
      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
      />
    </div>
  );
}
