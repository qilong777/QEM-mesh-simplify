import { Matrix } from './Matrix';
import { Vector } from './Vector';
import { Vertex } from './Vertex';

export class PairKey {
  public A: Vector;
  public B: Vector;
  constructor(A: Vector, B: Vector) {
    this.A = A;
    this.B = B;
  }
  toString(): string {
    return this.A.toString() + this.B.toString();
  }
}

export function createPairKey(a: Vertex, b: Vertex): PairKey {
  if (b.less(a)) {
    [a, b] = [b, a];
  }
  return new PairKey(a.vector, b.vector);
}

export class Pair {
  public A: Vertex;
  public B: Vertex;
  public index: number;
  public removed: boolean;
  public cachedError: number;
  constructor(A: Vertex, B: Vertex, index = -1, removed = false, cachedError = -1) {
    this.A = A;
    this.B = B;
    this.index = index;
    this.removed = removed;
    this.cachedError = cachedError;
  }

  quadric(): Matrix {
    return this.A.quadric.add(this.B.quadric);
  }

  vector(): Vector {
    const q = this.quadric();
    if (Math.abs(q.determinant()) > 1e-3) {
      const v = q.quadricVector();
      if (!Number.isNaN(v.x) && !Number.isNaN(v.y) && !Number.isNaN(v.z)) {
        return v;
      }
    }
    const n = 32;
    const a = this.A.vector;
    const b = this.B.vector;
    const d = b.sub(a);
    let bestE = -1.0;
    let bestV = new Vector(0, 0, 0);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const v = a.add(d.mulScalar(t));
      const e = q.quadricError(v);
      if (bestE < 0 || e < bestE) {
        bestE = e;
        bestV = v;
      }
    }
    return bestV;
  }

  error(): number {
    if (this.cachedError < 0) {
      this.cachedError = this.quadric().quadricError(this.vector());
    }
    return this.cachedError;
  }
}

export function createPair(a: Vertex, b: Vertex): Pair {
  if (b.less(a)) {
    [a, b] = [b, a];
  }
  return new Pair(a, b, -1, false, -1);
}
