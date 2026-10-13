// ALGORITHM: Social Preference Score (weighted difference).
// Compares a place with the ideal levels of a mood and returns 0-100,
// where 100 is a perfect match.
//
// Each difference is divided by its largest possible value (noise and crowd
// go 1-5 so the max gap is 4; social goes 1-4 so the max gap is 3), which puts
// all three on the same 0-1 scale before the weights are applied.
function calculateMatchScore(place, moodPreference) {
  const WEIGHT_NOISE = 0.3;
  const WEIGHT_CROWD = 0.3;
  const WEIGHT_SOCIAL = 0.4;

  const noiseGap  = Math.abs(place.noise_level  - moodPreference.noise)  / 4;
  const crowdGap  = Math.abs(place.crowd_level  - moodPreference.crowd)  / 4;
  const socialGap = Math.abs(place.social_level - moodPreference.social) / 3;

  const weightedGap = WEIGHT_NOISE * noiseGap +
                      WEIGHT_CROWD * crowdGap +
                      WEIGHT_SOCIAL * socialGap;

  return Math.round(100 * (1 - weightedGap));
}
