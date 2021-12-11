interface DerivedClassMethod<T> {
  pushFunc(val: T): void;
  popFunc(): T | null;
}

export default class FastPriorityQueue<T> implements DerivedClassMethod<T> {
  pushFunc(val: T): void {
    this.array.push(val);
  }
  popFunc(): T | null {
    return this.array.pop() || null;
  }
  public array: T[] = [];

  len(): number {
    return this.array.length;
  }

  push(myval: T): void {
    this.pushFunc(myval);
    this.up(this.len() - 1);
  }

  // 上浮
  up(j: number): void {
    let i;
    while (j > 0) {
      i = (j - 1) >> 1;
      if (i === j || !this.compare(j, i)) {
        break;
      }
      this.swap(i, j);
      j = i;
    }
  }

  pop(): T | null {
    if (this.len() === 0) {
      return null;
    }
    const n = this.len() - 1;
    this.swap(0, n);
    this.down(0, n);
    return this.popFunc();
  }

  down(i0: number, n: number): boolean {
    let i = i0;
    for (;;) {
      const j1 = 2 * i + 1;
      if (j1 >= n || j1 < 0) {
        break;
      }
      let j = j1;
      const j2 = j1 + 1;
      if (j2 < n && this.compare(j2, j1)) {
        j = j2;
      }
      if (!this.compare(j, i)) {
        break;
      }
      this.swap(i, j);
      i = j;
    }

    return i > i0;
  }

  remove(i: number): T | null {
    const n = this.len() - 1;
    if (n != i) {
      this.swap(i, n);
      if (!this.down(i, n)) {
        this.up(i);
      }
    }
    return this.popFunc();
  }

  compare(i: number, j: number): boolean {
    return this.array[i] < this.array[j];
  }

  swap(i: number, j: number): void {
    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
  }
}
