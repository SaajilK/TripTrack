import { Routes, Route, Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Home from './pages/Home';
import TripDetails from './pages/TripDetails';

function App() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col">
      {/* Sleek navigation bar */}
      <header className="sticky top-0 z-30 w-full bg-white/85 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-blue-600 hover:opacity-95 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 group-hover:rotate-12 transition-all duration-300">
              <Compass size={22} className="text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
              Trip<span className="text-blue-600">Track</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full tracking-wider border border-blue-100/50">
              Active Tracker
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
        <p>© 2026 TripTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
