// Reviews dialog. Reviews are stored in the "reviews" table (services/database.js).
let allReviews = [];
let reviewPlaceId = null;     // the place whose reviews are open
const reviewStats = {};       // place id -> { count, total, average }

async function refreshReviews() {
  try {
    allReviews = await loadReviews();
  } catch (error) {
    showStatus('Reviews unavailable (run sql/schema.sql): ' + error.message);
    allReviews = [];
  }
  // Rebuild the per-place averages.
  Object.keys(reviewStats).forEach(placeId => delete reviewStats[placeId]);
  for (const review of allReviews) {
    const stats = reviewStats[review.place_id] || (reviewStats[review.place_id] = { count: 0, total: 0, average: 0 });
    stats.count += 1;
    stats.total += review.rating;
    stats.average = stats.total / stats.count;
  }
}

function openReviews(placeId) {
  reviewPlaceId = placeId;
  byId('reviewTitle').textContent = appState.places.find(place => place.id === placeId).name;
  drawReviewList();
  byId('reviewDialog').showModal();
}

function drawReviewList() {
  const stats = reviewStats[reviewPlaceId];
  byId('reviewAverage').textContent = stats
    ? `★ ${stats.average.toFixed(1)} · ${stats.count} review${stats.count > 1 ? 's' : ''}`
    : 'No reviews yet. Be the first!';

  byId('reviewList').innerHTML = allReviews
    .filter(review => review.place_id === reviewPlaceId)
    .map(review => `<li>${avatarHtml(review.author)} <b>${escapeHtml(review.author)}</b>
      ${'★'.repeat(review.rating)}<span class="meta">${new Date(review.created_at).toLocaleDateString()}</span>
      ${escapeHtml(review.body)}</li>`).join('');
}

async function postReview() {
  try {
    await insertReview(reviewPlaceId, myProfile.displayName, +byId('reviewRating').value, byId('reviewText').value.trim());
  } catch (error) {
    showStatus('Could not post review: ' + error.message);
    return;
  }
  byId('reviewText').value = '';
  await refreshReviews();
  drawReviewList();
  renderExplore();
}

function initReviews() {
  byId('reviewPost').onclick = postReview;
  byId('reviewClose').onclick = () => byId('reviewDialog').close();
}
