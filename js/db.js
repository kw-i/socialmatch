const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadAll() {
  const [m, p, e] = await Promise.all([
    db.from('moods').select('*').order('id'),
    db.from('places').select('*'),
    db.from('events').select('*').gte('event_date', new Date().toISOString()).order('event_date')
  ]);
  const err = m.error || p.error || e.error;
  if (err) throw err;
  return { moods: m.data, places: p.data, events: e.data };
}
