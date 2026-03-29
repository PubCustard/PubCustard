import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { WeatherType } from '../types';
import { format } from 'date-fns';
import { BookOpen, Plus, X, Sun, Cloud, CloudRain, Snowflake, Wind, CloudSun, Image } from 'lucide-react';

const WEATHER_ICONS: Record<WeatherType, { icon: React.ComponentType<{ className?: string; size?: number }>; label: string }> = {
  sunny: { icon: Sun, label: 'Sunny' },
  cloudy: { icon: Cloud, label: 'Cloudy' },
  rainy: { icon: CloudRain, label: 'Rainy' },
  frost: { icon: Snowflake, label: 'Frost' },
  snow: { icon: Snowflake, label: 'Snow' },
  windy: { icon: Wind, label: 'Windy' },
  overcast: { icon: CloudSun, label: 'Overcast' },
};

async function compressImage(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function JournalPage() {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [text, setText] = useState('');
  const [weather, setWeather] = useState<WeatherType | ''>('');
  const [selectedBedId, setSelectedBedId] = useState<number | undefined>();
  const [selectedPlantId, setSelectedPlantId] = useState<number | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const journal = useLiveQuery(() => db.journal.orderBy('date').reverse().toArray()) ?? [];
  const beds = useLiveQuery(() => db.beds.toArray()) ?? [];
  const plants = useLiveQuery(() => db.plants.toArray()) ?? [];

  const getBedName = (id?: number) => id ? beds.find(b => b.id === id)?.name : undefined;
  const getPlantName = (id?: number) => id ? plants.find(p => p.id === id)?.name : undefined;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    setPhotoPreview(dataUrl);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await db.journal.add({
      date,
      text: text.trim(),
      bedId: selectedBedId,
      plantId: selectedPlantId,
      weather: weather || undefined,
      photoDataUrl: photoPreview,
    });
    setText('');
    setWeather('');
    setSelectedBedId(undefined);
    setSelectedPlantId(undefined);
    setPhotoPreview(undefined);
    setShowForm(false);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-green-700 dark:text-green-400" />
          <h1 className="text-2xl font-bold text-green-900 dark:text-green-100">Journal</h1>
        </div>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800 p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-800 dark:text-green-200">New Entry</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm" />
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What's happening in the garden today?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm min-h-[100px]" />

            {/* Weather selector */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Weather</label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(WEATHER_ICONS) as [WeatherType, typeof WEATHER_ICONS[WeatherType]][]).map(([type, { icon: Icon, label }]) => (
                  <button
                    key={type}
                    onClick={() => setWeather(weather === type ? '' : type)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                      weather === type ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 ring-1 ring-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional links */}
            <div className="grid grid-cols-2 gap-2">
              <select value={selectedBedId ?? ''} onChange={(e) => setSelectedBedId(e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm">
                <option value="">Link to bed...</option>
                {beds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select value={selectedPlantId ?? ''} onChange={(e) => setSelectedPlantId(e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none text-sm">
                <option value="">Link to plant...</option>
                {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Photo upload */}
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                <Image size={16} /> Add Photo
              </button>
              {photoPreview && (
                <div className="mt-2 relative inline-block">
                  <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  <button onClick={() => setPhotoPreview(undefined)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={!text.trim()}
              className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium">
              Save Entry
            </button>
          </div>
        </div>
      )}

      {/* Journal Feed */}
      <div className="space-y-4">
        {journal.map((entry) => {
          const WeatherIcon = entry.weather ? WEATHER_ICONS[entry.weather]?.icon : null;
          return (
            <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {format(new Date(entry.date), 'EEEE, d MMMM yyyy')}
                </span>
                <div className="flex items-center gap-2">
                  {WeatherIcon && <WeatherIcon size={16} className="text-gray-500" />}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{entry.text}</p>
              {entry.photoDataUrl && (
                <img src={entry.photoDataUrl} alt="Journal photo" className="mt-3 rounded-lg max-w-full max-h-64 object-cover" />
              )}
              <div className="flex gap-2 mt-2">
                {getBedName(entry.bedId) && (
                  <span className="text-xs px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                    {getBedName(entry.bedId)}
                  </span>
                )}
                {getPlantName(entry.plantId) && (
                  <span className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                    {getPlantName(entry.plantId)}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {journal.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Your journal is empty</h3>
            <p className="text-sm text-gray-400 mt-1">Start recording your garden observations!</p>
          </div>
        )}
      </div>

      {/* FAB */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center z-30"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
