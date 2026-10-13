// All Supabase (PostgreSQL) reads and writes live here, so the rest of the
// app never builds a query itself. Tables are defined in sql/schema.sql.
const database = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Throw the first error found so callers can use a single try/catch.
function throwIfError(...responses) {
  const failed = responses.find(response => response.error);
  if (failed) throw failed.error;
}

// ---------- Map data (read-only) ----------

async function loadMapData() {
  const [moods, places, events, friends] = await Promise.all([
    database.from('moods').select('*').order('id'),
    database.from('places').select('*').order('id'),
    database.from('events').select('*').gte('event_date', new Date().toISOString()).order('event_date'),
    database.from('friends').select('*').order('id')
  ]);
  throwIfError(moods, places, events, friends);
  return { moods: moods.data, places: places.data, events: events.data, friends: friends.data };
}

// ---------- Reviews (read + insert) ----------

async function loadReviews() {
  const response = await database.from('reviews').select('*').order('created_at', { ascending: false });
  throwIfError(response);
  return response.data;
}

async function insertReview(placeId, author, rating, body) {
  const response = await database.from('reviews').insert({ place_id: placeId, author, rating, body });
  throwIfError(response);
}

// ---------- Profile (read + upsert), one row per browser ----------

// A random id saved in this browser identifies "my" profile row (no login needed).
function getDeviceId() {
  let deviceId = localStorage.getItem('socialmatch_device_id');
  if (!deviceId) {
    deviceId = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());
    localStorage.setItem('socialmatch_device_id', deviceId);
  }
  return deviceId;
}

async function loadMyProfile() {
  const response = await database.from('profiles').select('*').eq('device_id', getDeviceId()).maybeSingle();
  throwIfError(response);
  return response.data; // null when this device has never saved a profile
}

async function saveMyProfile(profile) {
  const response = await database.from('profiles').upsert({
    device_id: getDeviceId(),
    display_name: profile.displayName,
    handle: profile.handle,
    bio: profile.bio,
    usual_mood: profile.usualMood,
    favorite_categories: profile.favoriteCategories,
    share_mood: profile.shareMood,
    updated_at: new Date().toISOString()
  }, { onConflict: 'device_id' });
  throwIfError(response);
}
