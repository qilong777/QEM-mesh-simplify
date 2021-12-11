import { Matrix } from './Matrix';
import { Vector } from './Vector';

export class Triangle {
  constructor(public v1: Vector, public v2: Vector, public v3: Vector) {}

  quadric(): Matrix {
    const n = this.normal();
    const { x, y, z } = this.v1;
    const a = n.x;
    const b = n.y;
    const c = n.z;
    const d = -a * x - b * y - c * z;
    const matrix = new Matrix(a * a, a * b, a * c, a * d, a * b, b * b, b * c, b * d, a * c, b * c, c * c, c * d, a * d, b * d, c * d, d * d);
    return matrix;
  }

  normal(): Vector {
    const v1 = this.v1;
    const v2 = this.v2;
    const v3 = this.v3;
    const vec1 = v2.sub(v1);
    const vec2 = v3.sub(v1);
    return vec1.cross(vec2).normalize();
  }
}
