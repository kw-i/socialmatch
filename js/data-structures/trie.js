// DATA STRUCTURE: Trie (prefix tree).
// Used by the search box (ui/search.js). Every word of every place name is
// inserted, so typing "pla" finds "Bacolod Public PLAza" and "Robinsons PLAce".
// Lookup cost depends on the length of the typed text, not on how many
// places exist.
//
//   root --b--> (b) --a--> (ba) --c--> ...      each node stores the places
//                                               whose words pass through it
class TrieNode {
  constructor() {
    this.children = new Map(); // letter -> TrieNode
    this.places = [];          // places having a word that starts with this prefix
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Insert every word of the place's name.
  insertPlace(place) {
    const words = place.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    for (const word of words) {
      this.insertWord(word, place);
    }
  }

  insertWord(word, place) {
    let node = this.root;
    for (const letter of word) {
      if (!node.children.has(letter)) {
        node.children.set(letter, new TrieNode());
      }
      node = node.children.get(letter);
      // Record the place on every node along the path (once per node).
      if (!node.places.includes(place)) {
        node.places.push(place);
      }
    }
  }

  // Return all places that have a word starting with `prefix`.
  searchPrefix(prefix) {
    let node = this.root;
    for (const letter of prefix.toLowerCase().trim()) {
      node = node.children.get(letter);
      if (!node) return [];  // no word starts with this prefix
    }
    return node.places;
  }
}
