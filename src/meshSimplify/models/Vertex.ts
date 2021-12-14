import { Matrix } from './Matrix';
import { Vector } from './Vector';
/**
 * 顶点数据
 */
export class Vertex extends Vector {
  // 顶点的坐标
  public vector: Vector;

  // 顶点的误差矩阵
  public quadric: Matrix;
  constructor(vector: Vector, quadric: Matrix = new Matrix()) {
    super(vector.x, vector.y, vector.z);
    this.vector = vector;
    this.quadric = quadric;
  }
  // equal(vertex: Vertex): boolean {
  //   return this.vector.equals(vertex.vector) && this.quadric.equals(vertex.quadric);
  // }
}
