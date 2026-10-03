// Core algorithms, written by hand so you can explain and modify them.

// Haversine distance in km between two lat/lng points
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, rad = d => d * Math.PI / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Social Preference Score (0-100): 100 = perfect match.
// Weighted, normalized difference between a place and the user's preference.
function socialScore(place, pref) {
  const w = { noise: 0.3, crowd: 0.3, social: 0.4 };
  const diff = w.noise * Math.abs(place.noise_level - pref.noise) / 4 +
               w.crowd * Math.abs(place.crowd_level - pref.crowd) / 4 +
               w.social * Math.abs(place.social_level - pref.social) / 3;
  return Math.round(100 * (1 - diff));
}

// Min-heap keyed by `key`; used to keep the top K items without a full sort.
class MinHeap {
  constructor(key) { this.a = []; this.key = key; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a; a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.key(a[p]) <= this.key(a[i])) break;
      [a[p], a[i]] = [a[i], a[p]]; i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last; let i = 0;
      for (;;) {
        let l = 2 * i + 1, r = l + 1, m = i;
        if (l < a.length && this.key(a[l]) < this.key(a[m])) m = l;
        if (r < a.length && this.key(a[r]) < this.key(a[m])) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]]; i = m;
      }
    }
    return top;
  }
}

// Top K by score, highest first. O(n log k)
function topK(items, k) {
  const h = new MinHeap(x => x.score);
  for (const it of items) {
    if (h.size < k) h.push(it);
    else if (it.score > h.peek().score) { h.pop(); h.push(it); }
  }
  const out = [];
  while (h.size) out.push(h.pop());
  return out.reverse();
}

// Filtering with a Set for O(1) category lookup
function filterPlaces(places, f) {
  const cats = f.category ? new Set([f.category]) : null;
  return places.filter(p =>
    (!cats || cats.has(p.category)) &&
    p.noise_level <= f.maxNoise && p.crowd_level <= f.maxCrowd);
}
