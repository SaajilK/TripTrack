import { useLocalStorage } from './useLocalStorage';

export function useTrips() {
  const [trips, setTrips] = useLocalStorage('travel_trips', []);
  const [expenses, setExpenses] = useLocalStorage('travel_expenses', []);

  // Trip operations
  const addTrip = (trip) => {
    setTrips([...trips, { ...trip, createdAt: Date.now() }]);
  };

  const deleteTrip = (tripId) => {
    setTrips(trips.filter((t) => t.id !== tripId));
    setExpenses(expenses.filter((e) => e.tripId !== tripId));
  };

  const getTrip = (tripId) => trips.find((t) => t.id === tripId);

  // Expense operations
  const addExpense = (expense) => {
    setExpenses([...expenses, { ...expense, createdAt: Date.now() }]);
  };

  const deleteExpense = (expenseId) => {
    setExpenses(expenses.filter((e) => e.id !== expenseId));
  };

  const getTripExpenses = (tripId) => {
    return expenses.filter((e) => e.tripId === tripId).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return {
    trips,
    addTrip,
    deleteTrip,
    getTrip,
    expenses,
    addExpense,
    deleteExpense,
    getTripExpenses
  };
}
