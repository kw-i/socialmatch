// ALGORITHM: Merge sort (divide and conquer, stable).
// Used by the "Sort by" menu to order the places list by match score,
// distance or name. Stable means items that compare as equal keep their
// original order, so a name sort never reshuffles places with equal scores.
// Cost: O(n log n).
function mergeSort(items, compare) {
  if (items.length <= 1) return items;

  const middle = Math.floor(items.length / 2);
  const leftHalf = mergeSort(items.slice(0, middle), compare);
  const rightHalf = mergeSort(items.slice(middle), compare);

  return mergeSortedHalves(leftHalf, rightHalf, compare);
}

// Combine two already-sorted arrays into one sorted array.
function mergeSortedHalves(left, right, compare) {
  const merged = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    // "<= 0" takes from the left on ties, which keeps the sort stable.
    if (compare(left[leftIndex], right[rightIndex]) <= 0) {
      merged.push(left[leftIndex++]);
    } else {
      merged.push(right[rightIndex++]);
    }
  }

  // One side is empty now; append whatever is left of the other.
  while (leftIndex < left.length) merged.push(left[leftIndex++]);
  while (rightIndex < right.length) merged.push(right[rightIndex++]);

  return merged;
}

// Comparison functions used with mergeSort (negative = a comes first).
const compareByScoreHighFirst = (a, b) => b.score - a.score;
const compareByDistanceNearFirst = (a, b) => a.distanceKm - b.distanceKm;
const compareByName = (a, b) => a.name.localeCompare(b.name);
