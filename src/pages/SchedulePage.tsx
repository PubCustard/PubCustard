import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Plant, PlantCategory } from '../types';
import { BarChart3, Filter } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_WIDTH = 80;
const ROW_HEIGHT = 36;
const LABEL_WIDTH = 140;

const PHASE_COLORS = {
  sowIndoor: { bg: '#fef08a', border: '#eab308', label: 'Indoor Sow' },
  sowDirect: { bg: '#bbf7d0', border: '#22c55e', label: 'Direct Sow' },
  transplant: { bg: '#bfdbfe', border: '#3b82f6', label: 'Transplant' },
  harvest: { bg: '#fecaca', border: '#ef4444', label: 'Harvest' },
};

function mmddToX(mmdd: string): number {
  const [month, day] = mmdd.split('-').map(Number);
  const monthFraction = (day - 1) / 30;
  return (month - 1 + monthFraction) * MONTH_WIDTH;
}

function renderBar(range: { start: string; end: string } | undefined, phase: keyof typeof PHASE_COLORS, y: number) {
  if (!range) return null;
  const x = mmddToX(range.start);
  let width = mmddToX(range.end) - x;
  // Handle wrapping (e.g. harvest Oct-Mar)
  if (width < 0) width = 12 * MONTH_WIDTH - x + mmddToX(range.end);
  const color = PHASE_COLORS[phase];
  return (
    <div
      key={phase}
      className="absolute rounded-sm"
      style={{
        left: LABEL_WIDTH + x,
        top: y + 4,
        width: Math.max(width, 8),
        height: ROW_HEIGHT - 8,
        backgroundColor: color.bg,
        borderLeft: `3px solid ${color.border}`,
      }}
      title={`${color.label}: ${range.start} – ${range.end}`}
    />
  );
}

export default function SchedulePage() {
  const [view, setView] = useState<'template' | 'myplan'>('template');
  const [categoryFilter, setCategoryFilter] = useState<PlantCategory | 'all'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const plants = useLiveQuery(() => db.plants.toArray()) ?? [];
  const plantings = useLiveQuery(() => db.plantings.toArray()) ?? [];

  const filteredPlants = plants.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    return true;
  });

  const getPlant = (id: number) => plants.find(p => p.id === id);

  const totalWidth = LABEL_WIDTH + 12 * MONTH_WIDTH;

  // Highlight current month
  const currentMonth = new Date().getMonth();

  return (
    <div className="p-4 max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-green-700 dark:text-green-400" />
          <h1 className="text-2xl font-bold text-green-900 dark:text-green-100">Schedule</h1>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setView('template')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'template' ? 'bg-white dark:bg-gray-700 text-green-700 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Template
          </button>
          <button
            onClick={() => setView('myplan')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'myplan' ? 'bg-white dark:bg-gray-700 text-green-700 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
          >
            My Plan
          </button>
        </div>
        {view === 'template' && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as PlantCategory | 'all')}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm outline-none"
          >
            <option value="all">All Categories</option>
            <option value="vegetable">Vegetables</option>
            <option value="fruit">Fruit</option>
            <option value="herb">Herbs</option>
            <option value="flower">Flowers</option>
          </select>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {Object.entries(PHASE_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: val.bg, borderLeft: `2px solid ${val.border}` }} />
            {val.label}
          </div>
        ))}
      </div>

      {/* Gantt Chart */}
      <div ref={scrollRef} className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
        <div className="relative" style={{ width: totalWidth, minHeight: 200 }}>
          {/* Month Headers */}
          <div className="sticky top-0 z-10 flex bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" style={{ height: 32 }}>
            <div className="shrink-0 border-r border-gray-200 dark:border-gray-700 px-3 flex items-center text-xs font-medium text-gray-500 dark:text-gray-400" style={{ width: LABEL_WIDTH }}>
              Plant
            </div>
            {MONTHS.map((month, i) => (
              <div
                key={month}
                className={`shrink-0 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-medium ${
                  i === currentMonth ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : 'text-gray-500 dark:text-gray-400'
                }`}
                style={{ width: MONTH_WIDTH }}
              >
                {month}
              </div>
            ))}
          </div>

          {/* Template View */}
          {view === 'template' && filteredPlants.map((plant, idx) => (
            <div
              key={plant.id}
              className={`relative flex ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-850'}`}
              style={{ height: ROW_HEIGHT }}
            >
              <div className="shrink-0 border-r border-gray-100 dark:border-gray-700 px-3 flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 truncate" style={{ width: LABEL_WIDTH }}>
                {plant.name}
              </div>
              {/* Month grid lines */}
              {MONTHS.map((_, i) => (
                <div key={i} className="absolute top-0 bottom-0 border-r border-gray-100 dark:border-gray-700/50" style={{ left: LABEL_WIDTH + (i + 1) * MONTH_WIDTH }} />
              ))}
              {renderBar(plant.sowIndoorRange, 'sowIndoor', 0)}
              {renderBar(plant.sowDirectRange, 'sowDirect', 0)}
              {renderBar(plant.transplantRange, 'transplant', 0)}
              {renderBar(plant.harvestRange, 'harvest', 0)}
            </div>
          ))}

          {/* My Plan View */}
          {view === 'myplan' && plantings.map((planting, idx) => {
            const plant = getPlant(planting.plantId);
            if (!plant) return null;
            return (
              <div
                key={planting.id}
                className={`relative flex ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-850'}`}
                style={{ height: ROW_HEIGHT }}
              >
                <div className="shrink-0 border-r border-gray-100 dark:border-gray-700 px-3 flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 truncate" style={{ width: LABEL_WIDTH }}>
                  {plant.name}
                  <span className="ml-1 text-gray-400 text-[10px]">({planting.status})</span>
                </div>
                {MONTHS.map((_, i) => (
                  <div key={i} className="absolute top-0 bottom-0 border-r border-gray-100 dark:border-gray-700/50" style={{ left: LABEL_WIDTH + (i + 1) * MONTH_WIDTH }} />
                ))}
                {renderBar(plant.sowIndoorRange, 'sowIndoor', 0)}
                {renderBar(plant.sowDirectRange, 'sowDirect', 0)}
                {renderBar(plant.transplantRange, 'transplant', 0)}
                {renderBar(plant.harvestRange, 'harvest', 0)}
              </div>
            );
          })}

          {/* Current month indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-green-600 dark:bg-green-400 z-20 pointer-events-none"
            style={{
              left: LABEL_WIDTH + currentMonth * MONTH_WIDTH + (new Date().getDate() / 30) * MONTH_WIDTH,
            }}
          />

          {/* Empty state */}
          {view === 'myplan' && plantings.length === 0 && (
            <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400 text-sm">
              No plantings yet. Add plantings from the Plants tab to see them here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
