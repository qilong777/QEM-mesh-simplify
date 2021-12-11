import { Vector } from './Vector';
import { Vertex } from './Vertex';

export class Face {
  public vertex1: Vertex;
  public vertex2: Vertex;
  public vertex3: Vertex;
  // 是否已被删除
  public removed: boolean;
  constructor(vertex1: Vertex, vertex2: Vertex, vertex3: Vertex, removed = false) {
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
    this.vertex3 = vertex3;
    this.removed = removed;
  }

  // 不在是一个平面
  isNotFace(): boolean {
    const vertex1 = this.vertex1;
    const vertex2 = this.vertex2;
    const vertex3 = this.vertex3;
    return vertex1.equals(vertex2) || vertex1.equals(vertex3) || vertex2.equals(vertex3);
  }

  // 获取法向量
  normal(): Vector {
    const vertex1 = this.vertex1;
    const vertex2 = this.vertex2;
    const vertex3 = this.vertex3;
    const vec1 = vertex2.vector.sub(vertex1.vector);
    const vec2 = vertex3.vector.sub(vertex1.vector);
    return vec1.cross(vec2).normalize();
  }
}
