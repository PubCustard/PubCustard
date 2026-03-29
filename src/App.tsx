import { useState, useEffect, lazy, Suspense } from 'react';
import Navigation from './components/Navigation';
import type { TabId } from './types';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const GardenPage = lazy(() => import('./pages/GardenPage'));
const PlantsPage = lazy(() => import('./pages/PlantsPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  const settings = useLiveQuery(() => db.settings.toCollection().first());

  useEffect(() => {
    if (settings?.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [settings?.darkMode]);

  const renderPage = () => {
    if (showSettings) {
      return <SettingsPage onClose={() => setShowSettings(false)} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'garden':
        return <GardenPage />;
      case 'plants':
        return <PlantsPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'journal':
        return <JournalPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={`min-h-screen ${settings?.darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-earth-50 dark:bg-gray-900 text-green-900 dark:text-gray-100">
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setShowSettings(false);
            setActiveTab(tab);
          }}
          onSettingsOpen={() => setShowSettings(true)}
        />

        {/* Main content area */}
        <main className="md:ml-56 pb-20 md:pb-4">
          <Suspense fallback={<LoadingSpinner />}>
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
