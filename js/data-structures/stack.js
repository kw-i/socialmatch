// DATA STRUCTURE: Stack (Last In, First Out).
// Used by ui/history.js: every place you look at is pushed on the stack,
// and the "Back" button pops the current place to return to the previous one.
class Stack {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  // Newest first, for showing the "Recently viewed" list.
  toArrayNewestFirst() {
    return [...this.items].reverse();
  }
}
