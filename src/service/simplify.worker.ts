import { simplify } from '../meshSimplify/simplify';
import * as Comlink from 'comlink';
import { Triangle } from '../meshSimplify/models/Triangle';
import { Vector } from '../meshSimplify/models/Vector';

const obj = {
  simplify(array: number[]) {
    const triangles: Triangle[] = [];
    for (let i = 0, len = array.length; i < len; ) {
      const v1 = new Vector(array[i++], array[i++], array[i++]);
      const v2 = new Vector(array[i++], array[i++], array[i++]);
      const v3 = new Vector(array[i++], array[i++], array[i++]);
      triangles.push(new Triangle(v1, v2, v3));
    }
    console.log(triangles);

    return simplify(triangles, [1, 0.8, 0.5, 0.2, 0.1]);
  },
};
Comlink.expose(obj);
