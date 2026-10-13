// The About tab: how SocialMatch works, plus credits.
function renderAbout() {
  const legend = Object.values(INTERACTION_LEVELS).map(level =>
    `<li class="legend"><span class="dot" style="background:${level.color}"></span>${escapeHtml(level.label)}</li>`).join('');

  byId('tab-about').innerHTML = `
    <div class="about-hero">
      <h2>Find places that fit your mood</h2>
      <p>SocialMatch ranks spots around Bacolod, Negros Occidental by how well their noise, crowd, and
         social energy match how you feel right now.</p>
    </div>

    <h2>How it works</h2>
    <ol class="steps">
      <li><b>1</b><div>Pick one or more <em>moods</em> on the Explore tab.</div></li>
      <li><b>2</b><div>Every place gets a <em>match score</em> from 0 to 100%. Higher means a closer fit.</div></li>
      <li><b>3</b><div>Search a place, tap a result or a marker to see details, read reviews, or get directions.</div></li>
      <li><b>4</b><div>Use the Friends and Profile panels to see where friends are and set your preferences.</div></li>
    </ol>

    <h2>How the score is calculated</h2>
    <div class="weights">
      <div><span>Social level</span><i style="width:40%"></i><b>40%</b></div>
      <div><span>Noise</span><i style="width:30%"></i><b>30%</b></div>
      <div><span>Crowd</span><i style="width:30%"></i><b>30%</b></div>
    </div>
    <p class="meta">With several moods selected, each place shows its best match across them.</p>

    <h2>Map colors</h2>
    <ul class="legend-list">${legend}</ul>
    <p class="meta">Nearby places of the same color group into numbered clusters. Bigger markers mean a better
       match. ★ markers are upcoming events.</p>

    <h2>Credits</h2>
    <p class="meta">Map data © OpenStreetMap contributors · Leaflet · Leaflet.markercluster · OSRM routing ·
       Supabase · Familjen Grotesk font. See README.md for details.</p>`;
}
