export function useSnapToGrid(value: number, gridSize: number = 10): number {
  return Math.round(value / gridSize) * gridSize;
} 