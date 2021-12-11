import { Matrix } from './Matrix';
import { Vector } from './Vector';

export class Vertex extends Vector {
  constructor(public vector: Vector, public quadric: Matrix = new Matrix()) {
    super(vector.x, vector.y, vector.z);
  }
  // equal(vertex: Vertex): boolean {
  //   return this.vector.equals(vertex.vector) && this.quadric.equals(vertex.quadric);
  // }
}
