import { Face } from './models/Face';
import { createPair, createPairKey, Pair } from './models/Pair';
import { PriorityQueue } from './models/Queue';
import { Triangle } from './models/Triangle';
import { Vertex } from './models/Vertex';

// 生成buffergeometry需要的属性
interface Attribute {
  vertices: number[];
  normals: number[];
}

// 添加value值为数组的map
function setOrPushMap<T, K>(map: Map<T, K[]>, v: T, f: K) {
  const faces = map.get(v);
  if (faces) {
    faces.push(f);
  } else {
    map.set(v, [f]);
  }
}

// 获取一种比例的属性
function getOneFactorAttribute(vertexFaces: Map<Vertex, Face[]>) {
  const distinctFaces = new Map<Face, boolean>();

  for (const [_, faces] of vertexFaces) {
    for (const f of faces) {
      if (!f.removed) {
        distinctFaces.set(f, true);
      }
    }
  }

  const vertices = new Array<number>(9 * distinctFaces.size);
  const normals = new Array<number>(9 * distinctFaces.size);
  let i = 0;
  let j = 0;
  for (const [f] of distinctFaces) {
    vertices[i++] = f.vertex1.x;
    vertices[i++] = f.vertex1.y;
    vertices[i++] = f.vertex1.z;
    vertices[i++] = f.vertex2.x;
    vertices[i++] = f.vertex2.y;
    vertices[i++] = f.vertex2.z;
    vertices[i++] = f.vertex3.x;
    vertices[i++] = f.vertex3.y;
    vertices[i++] = f.vertex3.z;
    const normal = f.normal();
    normals[j++] = normal.x;
    normals[j++] = normal.y;
    normals[j++] = normal.z;

    normals[j++] = normal.x;
    normals[j++] = normal.y;
    normals[j++] = normal.z;

    normals[j++] = normal.x;
    normals[j++] = normal.y;
    normals[j++] = normal.z;
  }
  return { vertices, normals };
}

// 建立顶点映射，去除重复点
function initVector2VertexMap(triangles: Triangle[]) {
  const vectorVertex = new Map<string, Vertex>();
  let v1Str: string;
  let v2Str: string;
  let v3Str: string;
  let vertex1: Vertex | undefined;
  let vertex2: Vertex | undefined;
  let vertex3: Vertex | undefined;
  for (const t of triangles) {
    const q = t.quadric();
    v1Str = t.v1.toString();
    vertex1 = vectorVertex.get(v1Str);
    if (!vertex1) {
      vertex1 = new Vertex(t.v1);
      vectorVertex.set(v1Str, vertex1);
    }
    v2Str = t.v2.toString();
    vertex2 = vectorVertex.get(v2Str);
    if (!vertex2) {
      vertex2 = new Vertex(t.v2);
      vectorVertex.set(v2Str, vertex2);
    }
    v3Str = t.v3.toString();
    vertex3 = vectorVertex.get(v3Str);
    if (!vertex3) {
      vertex3 = new Vertex(t.v3);
      vectorVertex.set(v3Str, vertex3);
    }
    // 累加顶点的误差矩阵,把顶点上关联的所有屏幕的Kp加起来
    vertex1.quadric = vertex1.quadric.add(q);
    vertex2.quadric = vertex2.quadric.add(q);
    vertex3.quadric = vertex3.quadric.add(q);
  }
  return vectorVertex;
}

// 创建顶点到相关联面的映射
function initVetex2Faces(triangles: Triangle[], vectorVertex: Map<string, Vertex>) {
  const vertexFaces = new Map<Vertex, Face[]>();
  for (const t of triangles) {
    const v1 = vectorVertex.get(t.v1.toString()) as Vertex;
    const v2 = vectorVertex.get(t.v2.toString()) as Vertex;
    const v3 = vectorVertex.get(t.v3.toString()) as Vertex;
    const f = new Face(v1, v2, v3);

    setOrPushMap<Vertex, Face>(vertexFaces, v1, f);
    setOrPushMap<Vertex, Face>(vertexFaces, v2, f);
    setOrPushMap<Vertex, Face>(vertexFaces, v3, f);
  }
  return vertexFaces;
}

// 建立顶点对的映射，去除重复的。且顶点对不可能出现(v1,v2)和(v2,v1)
function initPairKey2Pair(triangles: Triangle[], vectorVertex: Map<string, Vertex>) {
  const pairs = new Map<string, Pair>();
  for (const t of triangles) {
    const v1 = vectorVertex.get(t.v1.toString()) as Vertex;
    const v2 = vectorVertex.get(t.v2.toString()) as Vertex;
    const v3 = vectorVertex.get(t.v3.toString()) as Vertex;
    pairs.set(createPairKey(v1, v2).toString(), createPair(v1, v2));
    pairs.set(createPairKey(v2, v3).toString(), createPair(v2, v3));
    pairs.set(createPairKey(v3, v1).toString(), createPair(v3, v1));
  }
  return pairs;
}

function timeStart(str: string) {
  // console.time(str);
}

function timeEnd(str: string) {
  // console.timeEnd(str);
}

/**
 *
 * @param triangles mesh的三角形
 * @param factors 需要获取的 原始模型面数的比例。
 * @returns 如factors为[0.8, 0.5]，则返回原始模型80%和50%面的BufferGeometry的属性
 */
export function simplify(triangles: Triangle[], factors: number[]): Attribute[] {
  // 建立顶点映射，去除重复点
  timeStart('initVector2VertexMap');
  const vectorVertex = initVector2VertexMap(triangles);
  timeEnd('initVector2VertexMap');

  // 创建顶点到相关联面的映射
  timeStart('initVetex2Faces');
  const vertexFaces = initVetex2Faces(triangles, vectorVertex);
  timeEnd('initVetex2Faces');

  // 建立顶点对的映射，去除重复的。且顶点对不可能出现(v1,v2)和(v2,v1)
  timeStart('initPairKey2Pair');
  const pairs = initPairKey2Pair(triangles, vectorVertex);
  timeEnd('initPairKey2Pair');

  // 创建堆，以及顶点到对的映射

  timeStart('queue');
  const queue = new PriorityQueue();
  const vertexPairs = new Map<Vertex, Pair[]>();
  for (const [_, p] of pairs) {
    queue.push(p);
    setOrPushMap<Vertex, Pair>(vertexPairs, p.A, p);
    setOrPushMap<Vertex, Pair>(vertexPairs, p.B, p);
  }
  timeEnd('queue');

  // simplify操作
  const totalFaces = triangles.length;
  let numFaces = totalFaces;
  const res: Attribute[] = [];
  factors.sort((a, b) => b - a);
  const target = Math.floor(numFaces * factors[factors.length - 1]);

  let nowFactorIndex = 0;
  let nowTarget = Math.floor(totalFaces * factors[nowFactorIndex]);

  while (numFaces > target) {
    // 获取误差值最小的顶点对
    const pair = queue.pop();

    if (!pair) {
      break;
    }
    if (pair.removed) {
      continue;
    }

    pair.removed = true;

    // 获取顶点对关联的面
    const distinctFaces = new Map<Face, boolean>();
    if (vertexFaces.get(pair.A)) {
      for (const f of vertexFaces.get(pair.A) as Face[]) {
        if (!f.removed) {
          distinctFaces.set(f, true);
        }
      }
    }
    if (vertexFaces.get(pair.B)) {
      for (const f of vertexFaces.get(pair.B) as Face[]) {
        if (!f.removed) {
          distinctFaces.set(f, true);
        }
      }
    }

    // 获取顶点对关联的对
    const distinctPairs = new Map<Pair, boolean>();
    for (const p of vertexPairs.get(pair.A) as Pair[]) {
      if (!p.removed) {
        distinctPairs.set(p, true);
      }
    }
    for (const p of vertexPairs.get(pair.B) as Pair[]) {
      if (!p.removed) {
        distinctPairs.set(p, true);
      }
    }

    // 获取顶点对合并的顶点
    const v = new Vertex(pair.vector(), pair.quadric());

    // 存放新生成的面
    const newFaces = [];
    let valid = true;

    for (const [f, _] of distinctFaces) {
      let { vertex1, vertex2, vertex3 } = f;
      if (vertex1.equals(pair.A) || vertex1.equals(pair.B)) {
        vertex1 = v;
      }
      if (vertex2.equals(pair.A) || vertex2.equals(pair.B)) {
        vertex2 = v;
      }
      if (vertex3.equals(pair.A) || vertex3.equals(pair.B)) {
        vertex3 = v;
      }
      const face = new Face(vertex1, vertex2, vertex3);
      if (face.isNotFace()) {
        continue;
      }
      if (face.normal().dot(f.normal()) < 1e-3) {
        valid = false;
        break;
      }
      newFaces.push(face);
    }
    if (!valid) {
      continue;
    }

    // 删除旧顶点对到关联面的映射
    vertexFaces.delete(pair.A);
    vertexFaces.delete(pair.B);

    for (const [f] of distinctFaces) {
      f.removed = true;
      numFaces--;
    }

    // 把新生成的面建立顶点到面的映射
    for (const f of newFaces) {
      numFaces++;
      setOrPushMap<Vertex, Face>(vertexFaces, f.vertex1, f);
      setOrPushMap<Vertex, Face>(vertexFaces, f.vertex2, f);
      setOrPushMap<Vertex, Face>(vertexFaces, f.vertex3, f);
    }

    // 删除旧的顶点到关联对的映射
    vertexPairs.delete(pair.A);
    vertexPairs.delete(pair.B);

    // 重新建立影响的顶点和顶点对的关系
    const seen = new Map<string, boolean>();
    for (let [p] of distinctPairs) {
      p.removed = true;
      queue.remove(p.index);
      let a = p.A;
      let b = p.B;
      if (a.equals(pair.A) || a.equals(pair.B)) {
        a = v;
      }
      if (b.equals(pair.A) || b.equals(pair.B)) {
        b = v;
      }

      // 使得b成为之前的旧顶点（但是没有合并）
      if (b.equals(v)) {
        [a, b] = [b, a];
      }

      if (seen.get(b.vector.toString())) {
        continue;
      }

      seen.set(b.vector.toString(), true);
      p = createPair(a, b);
      queue.push(p);

      setOrPushMap<Vertex, Pair>(vertexPairs, a, p);
      setOrPushMap<Vertex, Pair>(vertexPairs, b, p);
    }

    if (numFaces <= nowTarget) {
      res.push(getOneFactorAttribute(vertexFaces));
      nowTarget = Math.floor(totalFaces * factors[++nowFactorIndex]);
    }
  }

  return res;
}
