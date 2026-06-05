import { Routes, Route, Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Home from './pages/Home';
import TripDetails from './pages/TripDetails';

function App() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col">
      {/* Sleek navigation bar */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-blue-600 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Compass size={20} className="text-blue-600 animate-pulse" />
            </div>
            <span className="font-bold tracking-tight text-lg text-slate-900">
              Nomad<span className="text-blue-600">Spend</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              Beta UI
            </span>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 md:py-10 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trip/:tripId" element={<TripDetails />} />
        </Routes>
      </main>

      <footer className="py-6 border-t border-slate-100 text-center text-xs text-slate-400">
        <p>© 2026 NomadSpend. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
