import { Home, Map, Sprout, BarChart3, BookOpen, Settings } from 'lucide-react';
import type { TabId } from '../types';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSettingsOpen: () => void;
}

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'garden', label: 'Garden', icon: Map },
  { id: 'plants', label: 'Plants', icon: Sprout },
  { id: 'schedule', label: 'Schedule', icon: BarChart3 },
  { id: 'journal', label: 'Journal', icon: BookOpen },
];

export default function Navigation({ activeTab, onTabChange, onSettingsOpen }: NavigationProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 min-h-screen bg-green-800 text-white fixed left-0 top-0 z-40">
        <div className="p-4 border-b border-green-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sprout size={24} />
            Plot
          </h1>
          <p className="text-green-300 text-xs mt-1">Garden Planner</p>
        </div>
        <div className="flex-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-700 text-white font-medium'
                    : 'text-green-200 hover:bg-green-700/50'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={onSettingsOpen}
          className="flex items-center gap-3 px-4 py-3 text-green-200 hover:bg-green-700/50 text-sm border-t border-green-700"
        >
          <Settings size={20} />
          Settings
        </button>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-700 dark:text-green-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
