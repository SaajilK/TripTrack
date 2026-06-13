import React, { createContext, useContext, useState, useEffect } from 'react';

const TripContext = createContext();

const defaultCategories = [
  { name: 'Food', emoji: '🍔', bg: 'bg-orange-50 text-orange-600', fill: 'bg-orange-500', isDefault: true },
  { name: 'Transport', emoji: '🚕', bg: 'bg-blue-50 text-blue-600', fill: 'bg-blue-500', isDefault: true },
  { name: 'Hotel', emoji: '🏨', bg: 'bg-purple-50 text-purple-600', fill: 'bg-purple-500', isDefault: true },
  { name: 'Shopping', emoji: '🛍️', bg: 'bg-pink-50 text-pink-600', fill: 'bg-pink-500', isDefault: true },
  { name: 'Activities', emoji: '🎡', bg: 'bg-emerald-50 text-emerald-600', fill: 'bg-emerald-500', isDefault: true },
  { name: 'Miscellaneous', emoji: '📦', bg: 'bg-slate-50 text-slate-600', fill: 'bg-slate-500', isDefault: true },
];

const dummyTrips = [
  { id: '1', name: 'Summer in Paris 🇫🇷', startDate: '2026-06-01', endDate: '2026-06-05', budget: 150000, members: ['You', 'Alice', 'Bob'] },
  { id: '2', name: 'Bali Beach Getaway 🌴', startDate: '2026-07-10', endDate: '2026-07-16', budget: 80000, members: ['You', 'Alice'] },
  { id: '3', name: 'Tokyo Sakura Tour 🌸', startDate: '2026-10-15', endDate: '', budget: 250000, members: ['You'] }
];

const dummyExpenses = [
  // Paris Trip
  { id: 'e1', tripId: '1', amount: 45000, category: 'Transport', description: 'Round-trip Flights', date: '2026-06-01', paidBy: 'You' },
  { id: 'e2', tripId: '1', amount: 60000, category: 'Hotel', description: 'Sleek Marais Apartment (4 nights)', date: '2026-06-01', paidBy: 'Alice' },
  { id: 'e3', tripId: '1', amount: 3500, category: 'Food', description: 'Dinner at Le Bistro', date: '2026-06-01', paidBy: 'Bob' },
  { id: 'e4', tripId: '1', amount: 1200, category: 'Miscellaneous', description: 'Orange eSIM Card', date: '2026-06-01', paidBy: 'You' },
  { id: 'e5', tripId: '1', amount: 4200, category: 'Activities', description: 'Eiffel Tower Access', date: '2026-06-02', paidBy: 'You' },
  { id: 'e6', tripId: '1', amount: 850, category: 'Food', description: 'Café & Croissant', date: '2026-06-02', paidBy: 'Alice' },
  { id: 'e7', tripId: '1', amount: 1500, category: 'Transport', description: 'Metro 10-Ride Pass', date: '2026-06-02', paidBy: 'Bob' },
  { id: 'e8', tripId: '1', amount: 8000, category: 'Shopping', description: 'Parisian Souvenirs & Skincare', date: '2026-06-03', paidBy: 'Alice' },
  { id: 'e9', tripId: '1', amount: 2200, category: 'Activities', description: 'Louvre Museum Ticket', date: '2026-06-03', paidBy: 'You' },
  { id: 'e10', tripId: '1', amount: 4800, category: 'Food', description: 'Seine Dinner Cruise', date: '2026-06-04', paidBy: 'Bob' },
  
  // Bali Trip
  { id: 'e11', tripId: '2', amount: 25000, category: 'Transport', description: 'Flight to Denpasar', date: '2026-07-10', paidBy: 'You' },
  { id: 'e12', tripId: '2', amount: 30000, category: 'Hotel', description: 'Ubud Private Pool Villa', date: '2026-07-10', paidBy: 'Alice' },
  { id: 'e13', tripId: '2', amount: 1800, category: 'Food', description: 'Local Nasi Goreng & Drinks', date: '2026-07-11', paidBy: 'Alice' },
  { id: 'e14', tripId: '2', amount: 5000, category: 'Activities', description: 'Scuba Diving Nusa Penida', date: '2026-07-12', paidBy: 'You' },
  { id: 'e15', tripId: '2', amount: 1200, category: 'Transport', description: 'Scooter Rental (5 Days)', date: '2026-07-11', paidBy: 'You' },
  { id: 'e16', tripId: '2', amount: 4500, category: 'Shopping', description: 'Handcrafted Straw Bags & Souvenirs', date: '2026-07-14', paidBy: 'Alice' }
];

export function TripProvider({ children }) {
  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('triptrack_trips') || localStorage.getItem('nomad_spend_trips');
    const loadedTrips = saved ? JSON.parse(saved) : dummyTrips;
    return loadedTrips.map(trip => ({
      ...trip,
      members: trip.members && trip.members.length > 0 ? trip.members : ['You']
    }));
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('triptrack_expenses') || localStorage.getItem('nomad_spend_expenses');
    const loadedExpenses = saved ? JSON.parse(saved) : dummyExpenses;
    return loadedExpenses.map(expense => ({
      ...expense,
      paidBy: expense.paidBy || 'You'
    }));
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('triptrack_categories') || localStorage.getItem('nomad_spend_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  // Keep localStorage synced
  useEffect(() => {
    localStorage.setItem('triptrack_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('triptrack_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('triptrack_categories', JSON.stringify(categories));
  }, [categories]);

  // Trip Actions
  const addTrip = (trip) => setTrips([trip, ...trips]);
  
  const updateTrip = (updatedTrip) => {
    setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const deleteTrip = (tripId) => {
    setTrips(trips.filter(t => t.id !== tripId));
    setExpenses(expenses.filter(e => e.tripId !== tripId));
  };

  // Expense Actions
  const addExpense = (expense) => setExpenses([expense, ...expenses]);

  const updateExpense = (updatedExpense) => {
    setExpenses(expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e));
  };

  const deleteExpense = (expenseId) => setExpenses(expenses.filter(e => e.id !== expenseId));

  // Category Actions
  const addCategory = (name, emoji) => {
    // Avoid duplicates
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return false;

    const tailwindColorPairs = [
      { bg: 'bg-indigo-50 text-indigo-600', fill: 'bg-indigo-500' },
      { bg: 'bg-amber-50 text-amber-600', fill: 'bg-amber-500' },
      { bg: 'bg-rose-50 text-rose-600', fill: 'bg-rose-500' },
      { bg: 'bg-teal-50 text-teal-600', fill: 'bg-teal-500' },
      { bg: 'bg-sky-50 text-sky-600', fill: 'bg-sky-500' },
      { bg: 'bg-violet-50 text-violet-600', fill: 'bg-violet-500' },
    ];
    const color = tailwindColorPairs[categories.length % tailwindColorPairs.length];

    const newCategory = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      emoji: emoji || '🏷️',
      bg: color.bg,
      fill: color.fill,
      isDefault: false
    };

    setCategories([...categories, newCategory]);
    return true;
  };

  const deleteCategory = (catName) => {
    // Prevent deleting default categories
    const catToDelete = categories.find(c => c.name === catName);
    if (!catToDelete || catToDelete.isDefault) return;

    setCategories(categories.filter(c => c.name !== catName));

    // Re-route deleted category expenses to "Miscellaneous"
    setExpenses(expenses.map(e => {
      if (e.category === catName) {
        return { ...e, category: 'Miscellaneous' };
      }
      return e;
    }));
  };

  return (
    <TripContext.Provider value={{ 
      trips, 
      expenses, 
      categories,
      addTrip, 
      updateTrip, 
      deleteTrip, 
      addExpense, 
      updateExpense, 
      deleteExpense,
      addCategory,
      deleteCategory
    }}>
      {children}
    </TripContext.Provider>
  );
}

export const useTripContext = () => useContext(TripContext);
