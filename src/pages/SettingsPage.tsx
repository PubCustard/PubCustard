import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { UnitSystem } from '../types';
import { Settings, Download, Upload, Trash2, ArrowLeft, Moon, Sun, Ruler } from 'lucide-react';

interface SettingsPageProps {
  onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearFinal, setShowClearFinal] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');

  const updateSetting = async (key: string, value: unknown) => {
    if (!settings?.id) return;
    await db.settings.update(settings.id, { [key]: value });
  };

  const exportData = async () => {
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      plants: await db.plants.toArray(),
      gardens: await db.gardens.toArray(),
      beds: await db.beds.toArray(),
      plantings: await db.plantings.toArray(),
      journal: await db.journal.toArray(),
      tasks: await db.tasks.toArray(),
      settings: await db.settings.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plot-garden-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version) throw new Error('Invalid backup file');

      await db.transaction('rw', [db.plants, db.gardens, db.beds, db.plantings, db.journal, db.tasks, db.settings], async () => {
        await db.plants.clear();
        await db.gardens.clear();
        await db.beds.clear();
        await db.plantings.clear();
        await db.journal.clear();
        await db.tasks.clear();
        await db.settings.clear();

        if (data.plants?.length) await db.plants.bulkAdd(data.plants);
        if (data.gardens?.length) await db.gardens.bulkAdd(data.gardens);
        if (data.beds?.length) await db.beds.bulkAdd(data.beds);
        if (data.plantings?.length) await db.plantings.bulkAdd(data.plantings);
        if (data.journal?.length) await db.journal.bulkAdd(data.journal);
        if (data.tasks?.length) await db.tasks.bulkAdd(data.tasks);
        if (data.settings?.length) await db.settings.bulkAdd(data.settings);
      });
      setImportStatus('Data imported successfully!');
    } catch {
      setImportStatus('Error: Invalid backup file');
    }
    e.target.value = '';
  };

  const clearAllData = async () => {
    await db.transaction('rw', [db.plants, db.gardens, db.beds, db.plantings, db.journal, db.tasks, db.settings], async () => {
      await db.plants.clear();
      await db.gardens.clear();
      await db.beds.clear();
      await db.plantings.clear();
      await db.journal.clear();
      await db.tasks.clear();
      await db.settings.clear();
    });
    setShowClearFinal(false);
    setShowClearConfirm(false);
    // Re-initialize defaults
    const { initializeDatabase } = await import('../db');
    await initializeDatabase();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Settings className="w-6 h-6 text-green-700 dark:text-green-400" />
        <h1 className="text-2xl font-bold text-green-900 dark:text-green-100">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Garden Name */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Garden Name</label>
          <input
            value={settings?.gardenName ?? ''}
            onChange={(e) => updateSetting('gardenName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Units */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Units</span>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                onClick={() => updateSetting('units', 'metric')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${settings?.units === 'metric' ? 'bg-white dark:bg-gray-600 text-green-700 shadow-sm font-medium' : 'text-gray-500'}`}
              >
                Metric
              </button>
              <button
                onClick={() => updateSetting('units', 'imperial')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${settings?.units === 'imperial' ? 'bg-white dark:bg-gray-600 text-green-700 shadow-sm font-medium' : 'text-gray-500'}`}
              >
                Imperial
              </button>
            </div>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings?.darkMode ? <Moon className="w-4 h-4 text-gray-500" /> : <Sun className="w-4 h-4 text-gray-500" />}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
            </div>
            <button
              onClick={() => updateSetting('darkMode', !settings?.darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${settings?.darkMode ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings?.darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Data Management</h3>
          <button onClick={exportData}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
            <Download className="w-4 h-4" /> Export All Data (JSON)
          </button>
          <label className="w-full flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium cursor-pointer">
            <Upload className="w-4 h-4" /> Import Data from JSON
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
          {importStatus && (
            <p className={`text-sm ${importStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{importStatus}</p>
          )}
          <button onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium">
            <Trash2 className="w-4 h-4" /> Clear All Data
          </button>
        </div>

        {/* Clear confirmation */}
        {showClearConfirm && !showClearFinal && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">Are you sure? This will delete all your garden data.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearFinal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Yes, continue</button>
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}
        {showClearFinal && (
          <div className="bg-red-100 dark:bg-red-900/40 rounded-xl border border-red-300 dark:border-red-700 p-4">
            <p className="text-sm text-red-900 dark:text-red-100 font-bold mb-3">FINAL WARNING: This action cannot be undone!</p>
            <div className="flex gap-2">
              <button onClick={clearAllData} className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium">Delete Everything</button>
              <button onClick={() => { setShowClearFinal(false); setShowClearConfirm(false); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm text-center">
          <h3 className="font-semibold text-green-800 dark:text-green-200">Plot</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">v1.0.0 — Garden Planner for Scotland</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Central Scotland / USDA Zone 8a / RHS H4–H5</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All data stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
}
