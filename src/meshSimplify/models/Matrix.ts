import { Matrix4 } from 'three';
import { Vector } from './Vector';

export class Matrix {
  public x00 = 0;
  public x01 = 0;
  public x02 = 0;
  public x03 = 0;
  public x10 = 0;
  public x11 = 0;
  public x12 = 0;
  public x13 = 0;
  public x20 = 0;
  public x21 = 0;
  public x22 = 0;
  public x23 = 0;
  public x30 = 0;
  public x31 = 0;
  public x32 = 0;
  public x33 = 0;
  constructor(x00 = 0, x01 = 0, x02 = 0, x03 = 0, x10 = 0, x11 = 0, x12 = 0, x13 = 0, x20 = 0, x21 = 0, x22 = 0, x23 = 0, x30 = 0, x31 = 0, x32 = 0, x33 = 0) {
    this.x00 = x00;
    this.x01 = x01;
    this.x02 = x02;
    this.x03 = x03;
    this.x10 = x10;
    this.x11 = x11;
    this.x12 = x12;
    this.x13 = x13;
    this.x20 = x20;
    this.x21 = x21;
    this.x22 = x22;
    this.x23 = x23;
    this.x30 = x30;
    this.x31 = x31;
    this.x32 = x32;
    this.x33 = x33;
  }
  quadricError(v: Vector): number {
    return v.x * this.x00 * v.x + v.y * this.x10 * v.x + v.z * this.x20 * v.x + this.x30 * v.x + v.x * this.x01 * v.y + v.y * this.x11 * v.y + v.z * this.x21 * v.y + this.x31 * v.y + v.x * this.x02 * v.z + v.y * this.x12 * v.z + v.z * this.x22 * v.z + this.x32 * v.z + v.x * this.x03 + v.y * this.x13 + v.z * this.x23 + this.x33;
  }

  quadricVector(): Vector {
    const b = new Matrix(this.x00, this.x01, this.x02, this.x03, this.x10, this.x11, this.x12, this.x13, this.x20, this.x21, this.x22, this.x23, 0, 0, 0, 1);
    return b.inverse().mulPosition(new Vector(0, 0, 0));
  }

  add(b: Matrix): Matrix {
    return new Matrix(this.x00 + b.x00, this.x10 + b.x10, this.x20 + b.x20, this.x30 + b.x30, this.x01 + b.x01, this.x11 + b.x11, this.x21 + b.x21, this.x31 + b.x31, this.x02 + b.x02, this.x12 + b.x12, this.x22 + b.x22, this.x32 + b.x32, this.x03 + b.x03, this.x13 + b.x13, this.x23 + b.x23, this.x33 + b.x33);
  }

  mulPosition(b: Vector): Vector {
    const x = this.x00 * b.x + this.x01 * b.y + this.x02 * b.z + this.x03;
    const y = this.x10 * b.x + this.x11 * b.y + this.x12 * b.z + this.x13;
    const z = this.x20 * b.x + this.x21 * b.y + this.x22 * b.z + this.x23;
    return new Vector(x, y, z);
  }

  determinant(): number {
    return (
      this.x00 * this.x11 * this.x22 * this.x33 -
      this.x00 * this.x11 * this.x23 * this.x32 +
      this.x00 * this.x12 * this.x23 * this.x31 -
      this.x00 * this.x12 * this.x21 * this.x33 +
      this.x00 * this.x13 * this.x21 * this.x32 -
      this.x00 * this.x13 * this.x22 * this.x31 -
      this.x01 * this.x12 * this.x23 * this.x30 +
      this.x01 * this.x12 * this.x20 * this.x33 -
      this.x01 * this.x13 * this.x20 * this.x32 +
      this.x01 * this.x13 * this.x22 * this.x30 -
      this.x01 * this.x10 * this.x22 * this.x33 +
      this.x01 * this.x10 * this.x23 * this.x32 +
      this.x02 * this.x13 * this.x20 * this.x31 -
      this.x02 * this.x13 * this.x21 * this.x30 +
      this.x02 * this.x10 * this.x21 * this.x33 -
      this.x02 * this.x10 * this.x23 * this.x31 +
      this.x02 * this.x11 * this.x23 * this.x30 -
      this.x02 * this.x11 * this.x20 * this.x33 -
      this.x03 * this.x10 * this.x21 * this.x32 +
      this.x03 * this.x10 * this.x22 * this.x31 -
      this.x03 * this.x11 * this.x22 * this.x30 +
      this.x03 * this.x11 * this.x20 * this.x32 -
      this.x03 * this.x12 * this.x20 * this.x31 +
      this.x03 * this.x12 * this.x21 * this.x30
    );
  }

  inverse(): Matrix {
    const m = new Matrix();
    const r = 1 / this.determinant();
    m.x00 = (this.x12 * this.x23 * this.x31 - this.x13 * this.x22 * this.x31 + this.x13 * this.x21 * this.x32 - this.x11 * this.x23 * this.x32 - this.x12 * this.x21 * this.x33 + this.x11 * this.x22 * this.x33) * r;
    m.x01 = (this.x03 * this.x22 * this.x31 - this.x02 * this.x23 * this.x31 - this.x03 * this.x21 * this.x32 + this.x01 * this.x23 * this.x32 + this.x02 * this.x21 * this.x33 - this.x01 * this.x22 * this.x33) * r;
    m.x02 = (this.x02 * this.x13 * this.x31 - this.x03 * this.x12 * this.x31 + this.x03 * this.x11 * this.x32 - this.x01 * this.x13 * this.x32 - this.x02 * this.x11 * this.x33 + this.x01 * this.x12 * this.x33) * r;
    m.x03 = (this.x03 * this.x12 * this.x21 - this.x02 * this.x13 * this.x21 - this.x03 * this.x11 * this.x22 + this.x01 * this.x13 * this.x22 + this.x02 * this.x11 * this.x23 - this.x01 * this.x12 * this.x23) * r;
    m.x10 = (this.x13 * this.x22 * this.x30 - this.x12 * this.x23 * this.x30 - this.x13 * this.x20 * this.x32 + this.x10 * this.x23 * this.x32 + this.x12 * this.x20 * this.x33 - this.x10 * this.x22 * this.x33) * r;
    m.x11 = (this.x02 * this.x23 * this.x30 - this.x03 * this.x22 * this.x30 + this.x03 * this.x20 * this.x32 - this.x00 * this.x23 * this.x32 - this.x02 * this.x20 * this.x33 + this.x00 * this.x22 * this.x33) * r;
    m.x12 = (this.x03 * this.x12 * this.x30 - this.x02 * this.x13 * this.x30 - this.x03 * this.x10 * this.x32 + this.x00 * this.x13 * this.x32 + this.x02 * this.x10 * this.x33 - this.x00 * this.x12 * this.x33) * r;
    m.x13 = (this.x02 * this.x13 * this.x20 - this.x03 * this.x12 * this.x20 + this.x03 * this.x10 * this.x22 - this.x00 * this.x13 * this.x22 - this.x02 * this.x10 * this.x23 + this.x00 * this.x12 * this.x23) * r;
    m.x20 = (this.x11 * this.x23 * this.x30 - this.x13 * this.x21 * this.x30 + this.x13 * this.x20 * this.x31 - this.x10 * this.x23 * this.x31 - this.x11 * this.x20 * this.x33 + this.x10 * this.x21 * this.x33) * r;
    m.x21 = (this.x03 * this.x21 * this.x30 - this.x01 * this.x23 * this.x30 - this.x03 * this.x20 * this.x31 + this.x00 * this.x23 * this.x31 + this.x01 * this.x20 * this.x33 - this.x00 * this.x21 * this.x33) * r;
    m.x22 = (this.x01 * this.x13 * this.x30 - this.x03 * this.x11 * this.x30 + this.x03 * this.x10 * this.x31 - this.x00 * this.x13 * this.x31 - this.x01 * this.x10 * this.x33 + this.x00 * this.x11 * this.x33) * r;
    m.x23 = (this.x03 * this.x11 * this.x20 - this.x01 * this.x13 * this.x20 - this.x03 * this.x10 * this.x21 + this.x00 * this.x13 * this.x21 + this.x01 * this.x10 * this.x23 - this.x00 * this.x11 * this.x23) * r;
    m.x30 = (this.x12 * this.x21 * this.x30 - this.x11 * this.x22 * this.x30 - this.x12 * this.x20 * this.x31 + this.x10 * this.x22 * this.x31 + this.x11 * this.x20 * this.x32 - this.x10 * this.x21 * this.x32) * r;
    m.x31 = (this.x01 * this.x22 * this.x30 - this.x02 * this.x21 * this.x30 + this.x02 * this.x20 * this.x31 - this.x00 * this.x22 * this.x31 - this.x01 * this.x20 * this.x32 + this.x00 * this.x21 * this.x32) * r;
    m.x32 = (this.x02 * this.x11 * this.x30 - this.x01 * this.x12 * this.x30 - this.x02 * this.x10 * this.x31 + this.x00 * this.x12 * this.x31 + this.x01 * this.x10 * this.x32 - this.x00 * this.x11 * this.x32) * r;
    m.x33 = (this.x01 * this.x12 * this.x20 - this.x02 * this.x11 * this.x20 + this.x02 * this.x10 * this.x21 - this.x00 * this.x12 * this.x21 - this.x01 * this.x10 * this.x22 + this.x00 * this.x11 * this.x22) * r;
    return m;
  }
}
