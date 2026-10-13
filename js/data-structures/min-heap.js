// DATA STRUCTURE: Min-Heap (priority queue).
// Used by algorithms/top-k.js to keep only the K best-matching places
// without sorting the whole list.
//
// The heap is stored in a plain array. For the item at index i:
//   parent = (i - 1) / 2,  left child = 2i + 1,  right child = 2i + 2
// The smallest item (by priorityOf) is always at index 0.
class MinHeap {
  constructor(priorityOf) {
    this.items = [];
    this.priorityOf = priorityOf; // function: item -> number
  }

  get size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  // Add an item at the end, then move it up until the heap rule holds.
  push(item) {
    this.items.push(item);
    this.moveUp(this.items.length - 1);
  }

  // Remove and return the smallest item.
  pop() {
    const smallest = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;   // move the last item to the top...
      this.moveDown(0);       // ...and sink it into place
    }
    return smallest;
  }

  moveUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.priorityOf(this.items[parent]) <= this.priorityOf(this.items[index])) break;
      this.swap(parent, index);
      index = parent;
    }
  }

  moveDown(index) {
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < this.items.length &&
          this.priorityOf(this.items[left]) < this.priorityOf(this.items[smallest])) {
        smallest = left;
      }
      if (right < this.items.length &&
          this.priorityOf(this.items[right]) < this.priorityOf(this.items[smallest])) {
        smallest = right;
      }
      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  swap(a, b) {
    [this.items[a], this.items[b]] = [this.items[b], this.items[a]];
  }
}
