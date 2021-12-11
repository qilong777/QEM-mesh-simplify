export class Vector {
  constructor(public x: number, public y: number, public z: number) {}

  equals(v: Vector): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }
  less(v: Vector): boolean {
    if (this.x != v.x) {
      return this.x < v.x;
    }
    if (this.y != v.y) {
      return this.y < v.y;
    }
    return this.z < v.z;
  }
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector): Vector {
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    return new Vector(x, y, z);
  }

  normalize(): Vector {
    const d = this.length();
    return new Vector(this.x / d, this.y / d, this.z / d);
  }

  add(b: Vector): Vector {
    return new Vector(this.x + b.x, this.y + b.y, this.z + b.z);
  }

  sub(b: Vector): Vector {
    return new Vector(this.x - b.x, this.y - b.y, this.z - b.z);
  }

  mulScalar(b: number): Vector {
    return new Vector(this.x * b, this.y * b, this.z * b);
  }

  toString(): string {
    return `x:${this.x}y:${this.y}z:${this.z}`;
  }
}
