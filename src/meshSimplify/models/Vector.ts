export class Vector {
  // 字符串值
  private stringVal: string | undefined;
  constructor(public x: number, public y: number, public z: number) {}

  // 判断向量是否相等
  equals(v: Vector): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  // 把向量根据x，y，z的先后比较
  less(v: Vector): boolean {
    if (this.x != v.x) {
      return this.x < v.x;
    }
    if (this.y != v.y) {
      return this.y < v.y;
    }
    return this.z < v.z;
  }

  // 获取向量长度
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  // 返回和一个向量的点乘
  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  // 返回和一个向量的叉乘
  cross(v: Vector): Vector {
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    return new Vector(x, y, z);
  }

  // 返回单位话后的向量
  normalize(): Vector {
    const d = this.length();
    return new Vector(this.x / d, this.y / d, this.z / d);
  }

  // 返回和另一个向量相加的结果
  add(b: Vector): Vector {
    return new Vector(this.x + b.x, this.y + b.y, this.z + b.z);
  }

  // 返回和另一个向量相减的结果
  sub(b: Vector): Vector {
    return new Vector(this.x - b.x, this.y - b.y, this.z - b.z);
  }

  // 返回向量数乘一个值的结果
  mulScalar(b: number): Vector {
    return new Vector(this.x * b, this.y * b, this.z * b);
  }

  toString(): string {
    // return `x:${this.x}y:${this.y}z:${this.z}`;
    if (!this.stringVal) {
      this.stringVal = `x:${this.x}y:${this.y}z:${this.z}`;
    }
    return this.stringVal;
  }
}
