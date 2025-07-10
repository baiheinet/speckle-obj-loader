import { Base } from "./Base";
export class Mesh extends Base {
  vertices: number[]; faces: number[]; colors: any[]; texture_coordinates: any[]; name?: string;
  constructor(vertices: number[], faces: number[], colors: any[] = [], texture_coordinates: any[] = [], name = '') {
    super();
    this.speckle_type = 'Objects.Geometry.Mesh';
    this.vertices = vertices;
    this.faces = faces;
    this.colors = colors;
    this.texture_coordinates = texture_coordinates;
    this.name = name;
  }
} 