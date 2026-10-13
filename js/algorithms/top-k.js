// ALGORITHM: Top-K selection using a min-heap.
// Returns the K items with the highest score, best first.
//
// The heap holds at most K items and its smallest item is the weakest of the
// current "best K". A new item only gets in if it beats that weakest item,
// which replaces it. Cost: O(n log k), cheaper than sorting all n items.
function getTopK(items, k, scoreOf) {
  const heap = new MinHeap(scoreOf);

  for (const item of items) {
    if (heap.size < k) {
      heap.push(item);
    } else if (scoreOf(item) > scoreOf(heap.peek())) {
      heap.pop();
      heap.push(item);
    }
  }

  // The heap pops smallest first, so reverse to get the best first.
  const best = [];
  while (heap.size > 0) {
    best.push(heap.pop());
  }
  return best.reverse();
}
