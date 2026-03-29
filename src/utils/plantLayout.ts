import type { PlantCategory } from '../types';

export const MIN_DOT_SPACING_PX = 8;

export const PLANT_DOT_COLORS: Record<PlantCategory, string> = {
  vegetable: '#16a34a',
  fruit: '#ea580c',
  herb: '#7c3aed',
  flower: '#db2777',
};

export interface PlantPosition {
  x: number;
  y: number;
}

export interface BedRegion {
  y: number;
  height: number;
}

/**
 * Calculate grid positions for plants within a rectangular area.
 * Plants are inset by half-spacing from edges so they aren't flush against borders.
 */
export function calcPlantPositions(
  bedWidthPx: number,
  bedHeightPx: number,
  spacingPlantCm: number,
  spacingRowCm: number,
  pxPerCm: number
): PlantPosition[] {
  const spacingPlantPx = spacingPlantCm * pxPerCm;
  const spacingRowPx = spacingRowCm * pxPerCm;

  if (spacingPlantPx <= 0 || spacingRowPx <= 0) return [];

  const marginX = spacingPlantPx / 2;
  const marginY = spacingRowPx / 2;

  const positions: PlantPosition[] = [];

  for (let row = marginY; row <= bedHeightPx - marginY + 0.5; row += spacingRowPx) {
    for (let col = marginX; col <= bedWidthPx - marginX + 0.5; col += spacingPlantPx) {
      positions.push({ x: col, y: row });
    }
  }

  return positions;
}

/**
 * When multiple plants share a bed, divide the bed height into
 * horizontal stripes — one per planting.
 */
export function allocateBedRegions(bedHeightPx: number, plantingCount: number): BedRegion[] {
  if (plantingCount <= 0) return [];
  const regionHeight = bedHeightPx / plantingCount;
  return Array.from({ length: plantingCount }, (_, i) => ({
    y: i * regionHeight,
    height: regionHeight,
  }));
}
