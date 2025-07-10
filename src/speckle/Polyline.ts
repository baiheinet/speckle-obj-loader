import { Base } from "./Base";
import { Point } from "./Point";
export class Polyline extends Base {
  value: number[]; closed?: boolean; name?: string;
  constructor(points: Point[], closed = false, name = '') {
    super();
    this.speckle_type = 'Objects.Geometry.Polyline';
    this.value = points.flatMap(p => [p.x, p.y, p.z]);
    this.closed = closed;
    this.name = name;
  }
} 