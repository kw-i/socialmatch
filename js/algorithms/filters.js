// ALGORITHM: Set-based filtering.
// Selected categories and colors live in Sets, so checking "is this place's
// category selected?" is a constant-time lookup. An empty Set means
// "no restriction" (everything passes).
function filterPlaces(places, selectedCategories, selectedLevels) {
  return places.filter(place => {
    const categoryOk = selectedCategories.size === 0 || selectedCategories.has(place.category);
    const levelOk = selectedLevels.size === 0 || selectedLevels.has(place.social_level);
    return categoryOk && levelOk;
  });
}

// Add the value if it is missing, remove it if it is present.
function toggleInSet(set, value) {
  if (set.has(value)) set.delete(value);
  else set.add(value);
}
