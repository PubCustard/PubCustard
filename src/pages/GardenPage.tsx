import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer } from 'react-konva';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { GardenBed, BedType } from '../types';
import { Plus, ZoomIn, ZoomOut, Grid3X3, Trash2, X, Map } from 'lucide-react';
import type Konva from 'konva';

const BED_COLORS: Record<BedType, string> = {
  vegetable: '#4ade80',
  fruit: '#f97316',
  flower: '#ec4899',
  herb: '#a78bfa',
  mixed: '#facc15',
  path: '#9ca3af',
  structure: '#78716c',
};

const CELL_SIZE = 40;

export default function GardenPage() {
  const garden = useLiveQuery(() => db.gardens.toCollection().first());
  const beds = useLiveQuery(() =>
    garden?.id ? db.beds.where('gardenId').equals(garden.id).toArray() : []
  , [garden?.id]) ?? [];

  const [selectedBedId, setSelectedBedId] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [editPanel, setEditPanel] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<BedType>('vegetable');
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (transformerRef.current) {
      const stage = stageRef.current;
      if (!stage) return;
      if (selectedBedId !== null) {
        const node = stage.findOne(`#bed-${selectedBedId}`);
        if (node) {
          transformerRef.current.nodes([node]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      } else {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedBedId, beds]);

  const gridWidth = (garden?.gridWidth ?? 20) * CELL_SIZE;
  const gridHeight = (garden?.gridHeight ?? 15) * CELL_SIZE;

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? scale / scaleBy : scale * scaleBy;
    setScale(Math.max(0.3, Math.min(3, newScale)));
  }, [scale]);

  const addBed = async () => {
    if (!garden?.id) return;
    const newBed: GardenBed = {
      gardenId: garden.id,
      name: `Bed ${beds.length + 1}`,
      type: 'vegetable',
      x: 2 * CELL_SIZE,
      y: 2 * CELL_SIZE,
      width: 4 * CELL_SIZE,
      height: 2 * CELL_SIZE,
      rotation: 0,
      color: BED_COLORS.vegetable,
    };
    const id = await db.beds.add(newBed);
    setSelectedBedId(id as number);
  };

  const handleBedDragEnd = async (bed: GardenBed, e: Konva.KonvaEventObject<DragEvent>) => {
    if (!bed.id) return;
    await db.beds.update(bed.id, { x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = async (bed: GardenBed, e: Konva.KonvaEventObject<Event>) => {
    if (!bed.id) return;
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    await db.beds.update(bed.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(CELL_SIZE, node.width() * scaleX),
      height: Math.max(CELL_SIZE, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const deleteBed = async () => {
    if (selectedBedId) {
      await db.beds.delete(selectedBedId);
      setSelectedBedId(null);
      setEditPanel(false);
    }
  };

  const openEditPanel = (bed: GardenBed) => {
    setSelectedBedId(bed.id!);
    setEditName(bed.name);
    setEditType(bed.type);
    setEditPanel(true);
  };

  const saveEdit = async () => {
    if (selectedBedId) {
      await db.beds.update(selectedBedId, {
        name: editName,
        type: editType,
        color: BED_COLORS[editType],
      });
      setEditPanel(false);
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage() || e.target.attrs?.id === 'grid-bg') {
      setSelectedBedId(null);
      setEditPanel(false);
    }
  };

  return (
    <div className="h-screen md:h-[calc(100vh-1rem)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-green-700 dark:text-green-400" />
          <h1 className="text-lg font-bold text-green-900 dark:text-green-100">Garden Layout</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addBed} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
            <Plus className="w-4 h-4" /> Add Bed
          </button>
          <button onClick={() => setScale(s => Math.min(3, s * 1.2))} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setScale(s => Math.max(0.3, s / 1.2))} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={() => setShowGrid(g => !g)} className={`p-1.5 rounded-lg ${showGrid ? 'bg-green-100 dark:bg-green-900 text-green-700' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          {selectedBedId && (
            <button onClick={deleteBed} className="p-1.5 bg-red-100 dark:bg-red-900 text-red-600 rounded-lg hover:bg-red-200">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 bg-green-50 dark:bg-gray-900 overflow-hidden relative">
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          draggable
          onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* Background */}
            <Rect
              id="grid-bg"
              x={0} y={0}
              width={gridWidth} height={gridHeight}
              fill="#f0fdf4"
            />

            {/* Grid lines */}
            {showGrid && Array.from({ length: (garden?.gridWidth ?? 20) + 1 }).map((_, i) => (
              <Rect key={`v-${i}`} x={i * CELL_SIZE} y={0} width={0.5} height={gridHeight} fill="#bbf7d0" />
            ))}
            {showGrid && Array.from({ length: (garden?.gridHeight ?? 15) + 1 }).map((_, i) => (
              <Rect key={`h-${i}`} x={0} y={i * CELL_SIZE} width={gridWidth} height={0.5} fill="#bbf7d0" />
            ))}

            {/* Beds */}
            {beds.map((bed) => (
              <Group
                key={bed.id}
                id={`bed-${bed.id}`}
                x={bed.x}
                y={bed.y}
                width={bed.width}
                height={bed.height}
                rotation={bed.rotation}
                draggable
                onClick={() => openEditPanel(bed)}
                onTap={() => openEditPanel(bed)}
                onDragEnd={(e) => handleBedDragEnd(bed, e)}
                onTransformEnd={(e) => handleTransformEnd(bed, e)}
              >
                <Rect
                  width={bed.width}
                  height={bed.height}
                  fill={bed.color}
                  opacity={0.7}
                  stroke={selectedBedId === bed.id ? '#166534' : '#15803d'}
                  strokeWidth={selectedBedId === bed.id ? 3 : 1}
                  cornerRadius={4}
                  shadowColor="rgba(0,0,0,0.1)"
                  shadowBlur={4}
                  shadowOffset={{ x: 2, y: 2 }}
                />
                <Text
                  text={bed.name}
                  width={bed.width}
                  height={bed.height}
                  align="center"
                  verticalAlign="middle"
                  fontSize={14}
                  fill="#14532d"
                  fontStyle="bold"
                  padding={4}
                />
              </Group>
            ))}

            <Transformer
              ref={transformerRef}
              rotateEnabled={true}
              boundBoxFunc={(_, newBox) => {
                if (newBox.width < CELL_SIZE || newBox.height < CELL_SIZE) {
                  return { ...newBox, width: Math.max(CELL_SIZE, newBox.width), height: Math.max(CELL_SIZE, newBox.height) };
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>

        {/* Scale indicator */}
        <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-400">
          {Math.round(scale * 100)}% | 1 sq = {garden?.scale ?? 0.5}{garden?.scaleUnit === 'feet' ? 'ft' : 'm'}
        </div>
      </div>

      {/* Edit Panel */}
      {editPanel && selectedBedId && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-green-800 dark:text-green-200">Edit Bed</h3>
            <button onClick={() => setEditPanel(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as BedType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-green-500"
              >
                {Object.keys(BED_COLORS).map((type) => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Color preview:</span>
              <div className="w-8 h-8 rounded" style={{ backgroundColor: BED_COLORS[editType] }} />
            </div>
            <button
              onClick={saveEdit}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={deleteBed}
              className="w-full py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 rounded-lg font-medium"
            >
              Delete Bed
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {beds.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Map className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Click "Add Bed" to start designing your garden</p>
          </div>
        </div>
      )}
    </div>
  );
}
