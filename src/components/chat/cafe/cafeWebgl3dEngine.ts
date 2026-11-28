import { buildPixelWebgl3dEngineScript } from '../../pixel/pixelWebgl3dEngine';

/**
 * Lớp tương thích (Compatibility Shim — Quyết định 247–250)
 * Ủy quyền toàn bộ sang Động cơ WebGL 3D dùng chung `pixelWebgl3dEngine.ts`.
 */
export function buildCafeWebgl3dEngineScript(): string {
  return buildPixelWebgl3dEngineScript();
}
