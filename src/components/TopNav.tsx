import { Search } from 'lucide-react';
import type { AppView } from '../types/tv';

interface TopNavProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenSearch: () => void;
}

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'live', label: 'Live TV' },
  { id: 'languages', label: 'Languages' },
  { id: 'categories', label: 'Categories' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'guide', label: 'TV Guide' },
];

export function TopNav({ activeView, onSelectView, onOpenSearch }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('live')}
          data-tv-focusable="true"
          className="font-display text-xl font-bold tracking-tight text-slate-100 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer rounded-md px-1 py-0.5"
        >
          BharatStream
        </button>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary TV Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                data-tv-focusable="true"
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer rounded-md px-2 ${
                  isActive
                    ? 'text-amber-400'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-2 right-2 bottom-0 h-0.5 bg-amber-400 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            data-tv-focusable="true"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-400 text-[#0B0F17] hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Mobile / narrow viewport sub-navigation */}
      <nav
        className="flex md:hidden items-center gap-4 px-6 pb-2.5 overflow-x-auto tv-scroll"
        aria-label="Mobile TV Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 px-1.5 border-b-2 transition-colors ${
                isActive
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
