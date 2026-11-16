import { useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Home,
  Search,
  Tv,
  Undo2,
  X,
} from 'lucide-react';

interface RemoteControlDrawerProps {
  onNavigateDirection: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onSelect: () => void;
  onBack: () => void;
  onHome: () => void;
  onOpenSearch: () => void;
}

export function RemoteControlDrawer({
  onNavigateDirection,
  onSelect,
  onBack,
  onHome,
  onOpenSearch,
}: RemoteControlDrawerProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Fire TV Remote Control"
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131924] border border-slate-700/90 text-slate-100 text-xs font-semibold shadow-xl hover:border-amber-400 transition-colors cursor-pointer"
      >
        <Tv className="w-4 h-4 text-amber-400" />
        <span>TV Remote</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="On-Screen Fire TV Remote"
      className="fixed bottom-5 right-5 z-30 w-56 rounded-2xl bg-[#111622] border border-slate-700/90 shadow-2xl p-4 space-y-4 select-none"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-semibold text-slate-300 tracking-wide">
          Fire TV Remote
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close remote"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Circular D-Pad */}
      <div className="mx-auto w-36 h-36 rounded-full bg-[#1A2232] border border-slate-700/80 relative flex items-center justify-center">
        <button
          type="button"
          onClick={() => onNavigateDirection('up')}
          aria-label="D-Pad Up"
          className="absolute top-1.5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center text-slate-200 hover:text-amber-400 hover:bg-slate-700/60 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateDirection('down')}
          aria-label="D-Pad Down"
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center text-slate-200 hover:text-amber-400 hover:bg-slate-700/60 cursor-pointer"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateDirection('left')}
          aria-label="D-Pad Left"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-slate-200 hover:text-amber-400 hover:bg-slate-700/60 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateDirection('right')}
          aria-label="D-Pad Right"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-slate-200 hover:text-amber-400 hover:bg-slate-700/60 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onSelect}
          aria-label="Select"
          className="w-12 h-12 rounded-full bg-amber-400 text-[#0B0F17] font-display font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
        >
          OK
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="h-9 rounded-lg bg-[#1A2232] border border-slate-700/70 flex items-center justify-center text-slate-200 hover:text-amber-400 cursor-pointer"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onHome}
          aria-label="Home"
          className="h-9 rounded-lg bg-[#1A2232] border border-slate-700/70 flex items-center justify-center text-slate-200 hover:text-amber-400 cursor-pointer"
        >
          <Home className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search"
          className="h-9 rounded-lg bg-[#1A2232] border border-slate-700/70 flex items-center justify-center text-slate-200 hover:text-amber-400 cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-400 text-center leading-snug">
        Keyboard arrows, Enter, and 3-digit channel numbers also work.
      </p>
    </aside>
  );
}
