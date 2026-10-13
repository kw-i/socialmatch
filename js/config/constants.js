// App-wide constants. Colors here match css/app.css (--level-1 ... --level-4).

// Starting view of the map: Bacolod City, Negros Occidental.
const MAP_CENTER = [10.6713, 122.9511];
const MAP_START_ZOOM = 13;

// Interaction levels. The level number is stored in places.social_level.
const INTERACTION_LEVELS = {
  1: { label: 'Solo',               color: '#3b6fd4' },
  2: { label: 'Low interaction',    color: '#2f9e7a' },
  3: { label: 'Casual social',      color: '#e8a317' },
  4: { label: 'Highly interactive', color: '#d6455d' }
};

// How many places the "Best matches" list shows.
const RESULT_LIMIT = 8;
