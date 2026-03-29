import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Plant, PlantCategory, Planting, PlantingStatus, GardenBed } from '../types';
import { Sprout, Search, Plus, X, Filter, Leaf, ChevronRight } from 'lucide-react';

const CATEGORY_COLORS: Record<PlantCategory, string> = {
  vegetable: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  fruit: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  herb: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  flower: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

const STATUS_COLORS: Record<PlantingStatus, string> = {
  planned: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  sown: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  transplanted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  growing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  harvesting: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  finished: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

function formatRange(range?: { start: string; end: string }) {
  if (!range) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [sm] = range.start.split('-').map(Number);
  const [em] = range.end.split('-').map(Number);
  return `${months[sm - 1]}–${months[em - 1]}`;
}

export default function PlantsPage() {
  const [activeView, setActiveView] = useState<'database' | 'plantings'>('database');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PlantCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PlantingStatus | 'all'>('all');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [showAddPlanting, setShowAddPlanting] = useState(false);

  const plants = useLiveQuery(() => db.plants.toArray()) ?? [];
  const plantings = useLiveQuery(() => db.plantings.toArray()) ?? [];
  const beds = useLiveQuery(() => db.beds.toArray()) ?? [];

  // Add Plant form state
  const [newPlant, setNewPlant] = useState<Partial<Plant>>({
    name: '', category: 'vegetable', spacingRowCm: 30, spacingPlantCm: 20,
    sunRequirement: 'full-sun', wateringNotes: '', frostTolerance: 'hardy',
    companionPlants: [], antagonists: [], notes: '', isCustom: true,
  });

  // Add Planting form state
  const [newPlanting, setNewPlanting] = useState<Partial<Planting>>({
    plantId: 0, bedId: 0, status: 'planned', notes: '', year: new Date().getFullYear(),
  });

  const filteredPlants = plants.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredPlantings = plantings.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const getPlantName = (id: number) => plants.find(p => p.id === id)?.name ?? 'Unknown';
  const getBedName = (id: number) => beds.find(b => b.id === id)?.name ?? 'Unknown';

  const handleAddPlant = async () => {
    if (!newPlant.name) return;
    await db.plants.add(newPlant as Plant);
    setShowAddPlant(false);
    setNewPlant({ name: '', category: 'vegetable', spacingRowCm: 30, spacingPlantCm: 20, sunRequirement: 'full-sun', wateringNotes: '', frostTolerance: 'hardy', companionPlants: [], antagonists: [], notes: '', isCustom: true });
  };

  const handleAddPlanting = async () => {
    if (!newPlanting.plantId || !newPlanting.bedId) return;
    await db.plantings.add(newPlanting as Planting);
    setShowAddPlanting(false);
    setNewPlanting({ plantId: 0, bedId: 0, status: 'planned', notes: '', year: new Date().getFullYear() });
  };

  const updatePlantingStatus = async (id: number, status: PlantingStatus) => {
    await db.plantings.update(id, { status });
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-green-700 dark:text-green-400" />
          <h1 className="text-2xl font-bold text-green-900 dark:text-green-100">Plants</h1>
        </div>
        <div className="flex items-center gap-2">
          {activeView === 'database' ? (
            <button onClick={() => setShowAddPlant(true)} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Plant
            </button>
          ) : (
            <button onClick={() => setShowAddPlanting(true)} className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Planting
            </button>
          )}
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveView('database')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeView === 'database' ? 'bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
        >
          Plant Database ({plants.length})
        </button>
        <button
          onClick={() => setActiveView('plantings')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeView === 'plantings' ? 'bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
        >
          My Plantings ({plantings.length})
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plants..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
        {activeView === 'database' ? (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as PlantCategory | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm outline-none"
          >
            <option value="all">All Categories</option>
            <option value="vegetable">Vegetables</option>
            <option value="fruit">Fruit</option>
            <option value="herb">Herbs</option>
            <option value="flower">Flowers</option>
          </select>
        ) : (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PlantingStatus | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm outline-none"
          >
            <option value="all">All Status</option>
            <option value="planned">Planned</option>
            <option value="sown">Sown</option>
            <option value="transplanted">Transplanted</option>
            <option value="growing">Growing</option>
            <option value="harvesting">Harvesting</option>
            <option value="finished">Finished</option>
            <option value="failed">Failed</option>
          </select>
        )}
      </div>

      {/* Plant Database View */}
      {activeView === 'database' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPlants.map((plant) => (
            <button
              key={plant.id}
              onClick={() => setSelectedPlant(plant)}
              className="text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-green-400 dark:hover:border-green-600 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{plant.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[plant.category]}`}>
                  {plant.category}
                </span>
              </div>
              {plant.botanicalName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">{plant.botanicalName}</p>
              )}
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {plant.sowIndoorRange && <p>Indoor sow: {formatRange(plant.sowIndoorRange)}</p>}
                {plant.sowDirectRange && <p>Direct sow: {formatRange(plant.sowDirectRange)}</p>}
                {plant.harvestRange && <p>Harvest: {formatRange(plant.harvestRange)}</p>}
                <p>Spacing: {plant.spacingPlantCm}cm x {plant.spacingRowCm}cm</p>
              </div>
            </button>
          ))}
          {filteredPlants.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Leaf className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No plants found
            </div>
          )}
        </div>
      )}

      {/* Plantings View */}
      {activeView === 'plantings' && (
        <div className="space-y-2">
          {filteredPlantings.map((planting) => (
            <div key={planting.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 shadow-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{getPlantName(planting.plantId)}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[planting.status]}`}>
                    {planting.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bed: {getBedName(planting.bedId)} | Year: {planting.year}
                  {planting.quantity ? ` | Qty: ${planting.quantity}` : ''}
                </p>
              </div>
              <select
                value={planting.status}
                onChange={(e) => planting.id && updatePlantingStatus(planting.id, e.target.value as PlantingStatus)}
                className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 outline-none"
              >
                <option value="planned">Planned</option>
                <option value="sown">Sown</option>
                <option value="transplanted">Transplanted</option>
                <option value="growing">Growing</option>
                <option value="harvesting">Harvesting</option>
                <option value="finished">Finished</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          ))}
          {filteredPlantings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Sprout className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No plantings yet. Add one to start tracking!</p>
            </div>
          )}
        </div>
      )}

      {/* Plant Detail Slide-over */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedPlant(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-bold text-green-900 dark:text-green-100">{selectedPlant.name}</h2>
              <button onClick={() => setSelectedPlant(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[selectedPlant.category]}`}>{selectedPlant.category}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{selectedPlant.frostTolerance}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{selectedPlant.sunRequirement}</span>
              </div>
              {selectedPlant.botanicalName && (
                <p className="text-sm text-gray-500 italic">{selectedPlant.botanicalName}</p>
              )}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Growing Calendar</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                    <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Indoor Sow</span>
                    <p className="text-yellow-900 dark:text-yellow-100">{formatRange(selectedPlant.sowIndoorRange)}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <span className="text-xs text-green-700 dark:text-green-300 font-medium">Direct Sow</span>
                    <p className="text-green-900 dark:text-green-100">{formatRange(selectedPlant.sowDirectRange)}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Transplant</span>
                    <p className="text-blue-900 dark:text-blue-100">{formatRange(selectedPlant.transplantRange)}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    <span className="text-xs text-red-700 dark:text-red-300 font-medium">Harvest</span>
                    <p className="text-red-900 dark:text-red-100">{formatRange(selectedPlant.harvestRange)}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">Spacing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plant: {selectedPlant.spacingPlantCm}cm | Row: {selectedPlant.spacingRowCm}cm</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">Watering</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlant.wateringNotes}</p>
              </div>
              {selectedPlant.companionPlants.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">Companion Plants</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedPlant.companionPlants.map((c) => (
                      <span key={c} className="text-xs px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedPlant.antagonists.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">Antagonists</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedPlant.antagonists.map((a) => (
                      <span key={a} className="text-xs px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedPlant.notes && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">Notes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlant.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Plant Modal */}
      {showAddPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddPlant(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-bold">Add Custom Plant</h2>
              <button onClick={() => setShowAddPlant(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <input placeholder="Plant name *" value={newPlant.name} onChange={(e) => setNewPlant(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm" />
              <input placeholder="Botanical name" value={newPlant.botanicalName ?? ''} onChange={(e) => setNewPlant(p => ({ ...p, botanicalName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm" />
              <select value={newPlant.category} onChange={(e) => setNewPlant(p => ({ ...p, category: e.target.value as PlantCategory }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm">
                <option value="vegetable">Vegetable</option>
                <option value="fruit">Fruit</option>
                <option value="herb">Herb</option>
                <option value="flower">Flower</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Plant spacing (cm)" value={newPlant.spacingPlantCm || ''} onChange={(e) => setNewPlant(p => ({ ...p, spacingPlantCm: Number(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm" />
                <input type="number" placeholder="Row spacing (cm)" value={newPlant.spacingRowCm || ''} onChange={(e) => setNewPlant(p => ({ ...p, spacingRowCm: Number(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm" />
              </div>
              <textarea placeholder="Notes" value={newPlant.notes} onChange={(e) => setNewPlant(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm" rows={3} />
              <button onClick={handleAddPlant} disabled={!newPlant.name}
                className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium">
                Add Plant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Planting Modal */}
      {showAddPlanting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddPlanting(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-bold">Add Planting</h2>
              <button onClick={() => setShowAddPlanting(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <select value={newPlanting.plantId} onChange={(e) => setNewPlanting(p => ({ ...p, plantId: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm">
                <option value={0}>Select plant *</option>
                {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={newPlanting.bedId} onChange={(e) => setNewPlanting(p => ({ ...p, bedId: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm">
                <option value={0}>Select bed *</option>
                {beds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select value={newPlanting.status} onChange={(e) => setNewPlanting(p => ({ ...p, status: e.target.value as PlantingStatus }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm">
                <option value="planned">Planned</option>
                <option value="sown">Sown</option>
                <option value="transplanted">Transplanted</option>
                <option value="growing">Growing</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date sown indoor</label>
                  <input type="date" value={newPlanting.dateSownIndoor ?? ''} onChange={(e) => setNewPlanting(p => ({ ...p, dateSownIndoor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date sown direct</label>
                  <input type="date" value={newPlanting.dateSownDirect ?? ''} onChange={(e) => setNewPlanting(p => ({ ...p, dateSownDirect: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm" />
                </div>
              </div>
              <input type="number" placeholder="Quantity" value={newPlanting.quantity ?? ''} onChange={(e) => setNewPlanting(p => ({ ...p, quantity: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm" />
              <textarea placeholder="Notes" value={newPlanting.notes} onChange={(e) => setNewPlanting(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm" rows={2} />
              <button onClick={handleAddPlanting} disabled={!newPlanting.plantId || !newPlanting.bedId}
                className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium">
                Add Planting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
