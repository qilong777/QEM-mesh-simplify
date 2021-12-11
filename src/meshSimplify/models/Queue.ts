import FastPriorityQueue from './FastPriorityQueue';
import { Pair } from './Pair';

// export type PriorityQueue = Pair[];

export class PriorityQueue extends FastPriorityQueue<Pair> {
  constructor() {
    super();
  }

  // 排序的规则
  compare(i: number, j: number): boolean {
    return this.array[i].error() < this.array[j].error();
  }

  swap(i: number, j: number): void {
    const array = this.array;
    [array[i], array[j]] = [array[j], array[i]];
    array[i].index = i;
    array[j].index = j;
  }

  // push数据前，对数据做的事
  pushFunc(val: Pair): void {
    val.index = this.len();
    this.array.push(val);
  }

  // pop拿到堆顶元素后做的事
  popFunc(): Pair | null {
    const val = this.array.pop() || null;
    if (val) {
      val.index = -1;
    }
    return val;
  }
}
