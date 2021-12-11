import { Face } from './models/Face';
import { createPair, createPairKey, Pair, PairKey } from './models/Pair';
import { PriorityQueue } from './models/Queue';
import { Triangle } from './models/Triangle';
import { Vector } from './models/Vector';
import { Vertex } from './models/Vertex';

function addRefMap<T, K>(map: Map<T, K[]>, v: T, f: K) {
  const faces = map.get(v);
  if (faces) {
    faces.push(f);
  } else {
    map.set(v, [f]);
  }
}

interface HasToString {
  toString(): string;
}

function addValMap<T extends HasToString, K>(map: Map<string, K[]>, v: T, f: K) {
  const key = v.toString();
  const faces = map.get(key);
  if (faces) {
    faces.push(f);
  } else {
    map.set(key, [f]);
  }
}

export function simplify(triangles: Triangle[], factor: number): { vertices: number[]; normals: number[] } {
  // 发现不同的顶点
  const vectorVertex = new Map<string, Vertex>();
  for (const t of triangles) {
    const q = t.quadric();
    const vertex1 = new Vertex(t.v1);
    const vertex2 = new Vertex(t.v2);
    const vertex3 = new Vertex(t.v3);

    // accumlate quadric matrices for each vertex based on its faces
    vertex1.quadric = vertex1.quadric.add(q);
    vertex2.quadric = vertex2.quadric.add(q);
    vertex3.quadric = vertex3.quadric.add(q);

    vectorVertex.set(t.v1.toString(), vertex1).set(t.v2.toString(), vertex2).set(t.v3.toString(), vertex3);
  }

  // create faces and map vertex => faces
  const vertexFaces = new Map<Vertex, Face[]>();
  for (const t of triangles) {
    const v1 = vectorVertex.get(t.v1.toString()) as Vertex;
    const v2 = vectorVertex.get(t.v2.toString()) as Vertex;
    const v3 = vectorVertex.get(t.v3.toString()) as Vertex;
    const f = new Face(v1, v2, v3);

    addRefMap<Vertex, Face>(vertexFaces, v1, f);
    addRefMap<Vertex, Face>(vertexFaces, v2, f);
    addRefMap<Vertex, Face>(vertexFaces, v3, f);
  }

  // find distinct pairs
  // TODO: pair vertices within a threshold distance of each other
  const pairs = new Map<string, Pair>();
  for (const t of triangles) {
    const v1 = vectorVertex.get(t.v1.toString()) as Vertex;
    const v2 = vectorVertex.get(t.v2.toString()) as Vertex;
    const v3 = vectorVertex.get(t.v3.toString()) as Vertex;
    pairs.set(createPairKey(v1, v2).toString(), createPair(v1, v2));
    pairs.set(createPairKey(v2, v3).toString(), createPair(v2, v3));
    pairs.set(createPairKey(v3, v1).toString(), createPair(v3, v1));
  }

  // enqueue pairs and map vertex => pairs
  const queue = new PriorityQueue();
  const vertexPairs = new Map<Vertex, Pair[]>();
  for (const [_, p] of pairs) {
    queue.push(p);
    addRefMap<Vertex, Pair>(vertexPairs, p.A, p);
    addRefMap<Vertex, Pair>(vertexPairs, p.B, p);
  }

  // simplify
  let numFaces = triangles.length;
  const target = Math.floor(numFaces * factor);

  while (numFaces > target) {
    // pop best pair
    const pair = queue.pop();

    if (!pair) {
      break;
    }
    if (pair.removed) {
      continue;
    }

    pair.removed = true;

    // get related faces
    const distinctFaces = new Map<Face, boolean>();

    for (const f of vertexFaces.get(pair.A) as Face[]) {
      if (!f.removed) {
        distinctFaces.set(f, true);
      }
    }
    for (const f of vertexFaces.get(pair.B) as Face[]) {
      if (!f.removed) {
        distinctFaces.set(f, true);
      }
    }

    // get related pairs
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

    // create the new vertex
    const v = new Vertex(pair.vector(), pair.quadric());

    // update faces
    // const newFaces = new Array<Face>(distinctFaces.size);
    const newFaces = [];
    const i = 0;
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
      // newFaces[i++] = face;
    }
    if (!valid) {
      continue;
    }
    vertexFaces.delete(pair.A);
    vertexFaces.delete(pair.B);

    for (const [f] of distinctFaces) {
      f.removed = true;
      numFaces--;
    }

    for (const f of newFaces) {
      numFaces++;
      addRefMap<Vertex, Face>(vertexFaces, f.vertex1, f);
      addRefMap<Vertex, Face>(vertexFaces, f.vertex2, f);
      addRefMap<Vertex, Face>(vertexFaces, f.vertex3, f);
    }

    // update pairs and prune current pair

    vertexPairs.delete(pair.A);
    vertexPairs.delete(pair.B);

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

      if (b.equals(v)) {
        // swap so that a == v
        [a, b] = [b, a];
      }

      if (seen.get(b.vector.toString())) {
        continue;
      }

      seen.set(b.vector.toString(), true);
      p = new Pair(a, b);
      queue.push(p);

      addRefMap<Vertex, Pair>(vertexPairs, a, p);
      addRefMap<Vertex, Pair>(vertexPairs, b, p);
    }
  }

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
