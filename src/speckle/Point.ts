import { Base } from "./Base";
export class Point extends Base {
  x: number; y: number; z: number; units?: string; color?: string;
  constructor(x: number, y: number, z: number, units?: string) {
    super(); this.speckle_type = 'Objects.Geometry.Point'; this.x = x; this.y = y; this.z = z; this.units = units;
  }
} 