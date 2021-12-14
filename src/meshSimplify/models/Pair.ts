import { Matrix } from './Matrix';
import { Vector } from './Vector';
import { Vertex } from './Vertex';

export class PairKey {
  public A: Vector;
  public B: Vector;
  private stringVal: string | undefined;
  constructor(A: Vector, B: Vector) {
    this.A = A;
    this.B = B;
  }
  toString(): string {
    if (!this.stringVal) {
      this.stringVal = this.A.toString() + this.B.toString();
    }
    return this.stringVal;
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

  // Q1+Q2
  quadric(): Matrix {
    return this.A.quadric.add(this.B.quadric);
  }

  // 获取使得δv最小的点的向量
  vector(): Vector {
    const q = this.quadric();
    // Q矩阵可逆
    if (Math.abs(q.determinant()) > 1e-3) {
      const v = q.quadricVector();
      if (!Number.isNaN(v.x + v.y + v.z)) {
        return v;
      }
    }
    // Q矩阵不可逆，
    // return this.A.vector.add(this.B.vector).mulScalar(1 / 2);
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

  // 获取这个Pair的误差值
  error(): number {
    if (this.cachedError < 0) {
      // vTQv
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
