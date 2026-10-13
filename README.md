# SocialMatch

**Places that fit your social energy, mapped around Bacolod City, Negros Occidental.**

Authors: J. Lacson and S. Miranda

## 1. What it is

SocialMatch helps people decide *where to go* based on how they feel. You pick one or more moods
(Relaxed, Chill, Energetic, Party and so on) and the app scores every place on the map by how well its
noise, crowd and social energy match that mood. Each place is colored by how much people interact
there, from quiet **Solo** spots to **Highly interactive** ones.

**Intended users:** students and young professionals who want a quiet corner to read, a casual place to
meet people, or a loud night out, and friends who want to see where each other are.

## 2. Features

| Area | What you can do |
|---|---|
| Map | Leaflet map of Bacolod with color-coded place markers and ★ event markers. Same-color places group into numbered clusters. |
| Search | Type part of a place name (autocomplete). Selecting a result flies the map to it and opens its popup. |
| Moods and filters | Pick moods, filter by interaction color and activity type, show or hide events. |
| Ranking | "Best match" (heap top-K), "Nearest" (needs "My location") and "A to Z" (merge sort). |
| Directions | "My location" uses browser geolocation. "Get directions" draws a driving route and step list (OSRM) and links to Google Maps. |
| Recently viewed | A stack of the places you opened, with a **Back** button. |
| Reviews | Read and post 1 to 5 star reviews per place (saved in the database). |
| Friends (right panel) | Friend cards with mood and status. Tap a place to jump to it, or show friends' avatars on the map. |
| Profile (right panel) | Name, handle, bio, usual mood, preferred places. Saved to the database. "Apply to map" turns them into filters. |
| Phones | The right panel becomes a full-screen sheet opened from the bottom bar (Explore / Friends / Profile). |

## 3. How to run it

You need a free [Supabase](https://supabase.com) project and an internet connection (map tiles, libraries and routing load online).

1. **Create the database.** In Supabase, open **SQL Editor > New query**, paste `sql/schema.sql`, click **Run**.
2. **Load the sample data.** New query, paste `sql/sample-data.sql`, **Run**. (Run it again any time to reset the demo data. Event dates are relative to "now", so re-run it right before recording.)
3. **Connect the app.** Open `js/config/supabase-config.js` and paste your **Project URL** and **anon public key**
   (Supabase > Project Settings > API).
4. **Open the app.** Double-click `index.html` (landing page) or `app.html` (the app). No build step or server is needed.
   If your browser blocks location on `file://`, run `python -m http.server` in this folder and open `http://localhost:8000`.

**Troubleshooting:** "Could not load data" means the SQL was not run or the keys in step 3 are wrong.
Places showing in Cebu means old data is still in the database; re-run `sql/sample-data.sql`.
Pins slightly off: edit the `lat`/`lng` values in `sql/sample-data.sql` (right-click a spot in Google Maps to copy its coordinates) and re-run it.

## 4. Project structure

```
SocialMatch/
├── index.html                 Landing page
├── app.html                   The application
├── README.md
├── css/
│   ├── landing.css            Landing page styles
│   ├── app.css                Base styles, left panel, map markers, dialogs
│   └── social-panel.css       Right panel (Friends / Profile) and the phone layout
├── sql/
│   ├── schema.sql             Tables and access policies
│   └── sample-data.sql        Demo data (moods, places, events, reviews, friends)
└── js/
    ├── config/                constants.js (colors, map center), supabase-config.js (your keys)
    ├── data-structures/       min-heap.js, trie.js, stack.js
    ├── algorithms/            distance.js, scoring.js, top-k.js, merge-sort.js, filters.js
    ├── services/              database.js (every Supabase query lives here)
    ├── map/                   map.js (Leaflet + clusters), markers.js, directions.js
    ├── ui/                    explore.js, search.js, history.js, reviews.js, about.js, social-panel.js, helpers.js
    └── main.js                Start-up
```

Naming: files are `kebab-case`, functions and variables `camelCase`, classes `PascalCase`, constants `UPPER_SNAKE_CASE`,
database columns `snake_case`. Plain script tags are used (no modules) so the app opens straight from a folder; the
load order is listed in `app.html`.

## 5. Data structures

| Data structure | File | Where it is used | Why it fits |
|---|---|---|---|
| **Min-heap** (priority queue) | `js/data-structures/min-heap.js` | Keeps the K best-matching places for the "Best matches" list (`algorithms/top-k.js`). | The heap's smallest item is always the weakest of the current top K, so a new place is compared with one item instead of re-sorting everything. |
| **Trie** (prefix tree) | `js/data-structures/trie.js` | Search box autocomplete (`ui/search.js`). | Finding every name that starts with what you typed costs time proportional to the typed length, not to the number of places. Each word of a name is indexed, so "plaza" finds "Bacolod Public Plaza". |
| **Stack** (LIFO) | `js/data-structures/stack.js` | "Recently viewed" and the **Back** button (`ui/history.js`). | Going back means returning to the most recent place first, which is exactly last in, first out. |
| **Set** (hash set) | `ui/explore.js`, `algorithms/filters.js` | Selected moods, colors and categories. | Checking "is this category selected?" is constant time, and a Set cannot hold duplicates, so toggling a button is a simple add or delete. An empty Set means "no restriction". |
| **Map** (hash map) | `ui/explore.js` (`markerById`), `data-structures/trie.js` (child letters) | Marker lookup by id, and each trie node finds its next letter. | Jump from a list item or search result to its marker without scanning. |
| **Array** | Everywhere | Lists of places, events, friends and heap storage. | The simple sequence the other structures are built on. |

## 6. Algorithms

| Algorithm | File | What it does in the system | Purpose |
|---|---|---|---|
| **Weighted match score** | `js/algorithms/scoring.js` | Compares a place's noise, crowd and social level with a mood's ideal levels (weights 30% / 30% / 40%) and returns 0 to 100. | Turns "how it feels" into a number so places can be ranked and markers can be sized. |
| **Top-K selection (heap)** | `js/algorithms/top-k.js` | Walks the places once, keeping a heap of size K. | Gets the best matches in O(n log k) instead of sorting all n places. |
| **Merge sort** | `js/algorithms/merge-sort.js` | Sorts places by distance or name, and orders search suggestions. | A stable O(n log n) sort: places with equal values keep their original order. |
| **Haversine formula** | `js/algorithms/distance.js` | Computes the distance in km between your location and each place. | Powers "x m away", the Nearest sort and the nearby popups. |
| **Prefix search (trie)** | `js/data-structures/trie.js` + `ui/search.js` | Looks up each typed word and keeps the places found for all words. | Instant autocomplete as you type. |
| **Set filtering** | `js/algorithms/filters.js` | Keeps places whose color and category are in the selected Sets. | Fast, simple multi-filter. |

## 7. Mapping (Leaflet)

* **Leaflet map** centered on Bacolod (`js/map/map.js`) with OpenStreetMap tiles.
* **Markers:** place markers are colored by interaction level and sized by match score; ★ markers are events.
* **Same-color clustering:** one `markerClusterGroup` per color, so only places of the same color merge into a numbered bubble.
* **Popups:** details, rating, **Get directions** and **Reviews** buttons.
* **Search:** the Trie search flies the map to the chosen place.
* **User location and distance:** browser geolocation, blue "You are here" dot, distances in the lists.
* **Routes:** OSRM driving route drawn as a line with turn-by-turn steps and a Google Maps link.
* **Friends on the map:** optional avatar markers next to the place each friend is at.

## 8. Database (Supabase / PostgreSQL)

| Table | Used for | Operations from the app |
|---|---|---|
| `moods` | Mood choices and their ideal noise / crowd / social levels | read |
| `places` | Map places with coordinates, category, noise, crowd and interaction level | read |
| `events` | Upcoming events (only future dates are loaded) | read |
| `reviews` | User reviews linked to a place (`place_id`) | read, **insert** |
| `friends` | Sample friends and where they are (`place_id`) | read |
| `profiles` | One profile per browser (`device_id`) | read, **insert / update (upsert)** |

All queries are in `js/services/database.js`. Tables are linked with foreign keys (`events.place_id`, `reviews.place_id`,
`friends.place_id` all point to `places.id`). Row Level Security is on for every table; the policies in
`sql/schema.sql` are open on purpose because this is a class project with no login.

## 9. Sample data

`sql/sample-data.sql` loads 6 moods, 10 places across all four interaction colors, 6 upcoming events,
14 reviews and 6 friends. Pins are approximate, so check them on the map and adjust the `lat`/`lng` values if needed.

## 10. Testing

Tested before submission:

* A scripted browser run (headless Chromium, with a stand-in for the database) confirmed: places, events and
  friends load; Trie search finds "pla" and "public pla"; the Back stack returns to the previous place; mood
  ranking, A to Z and Nearest sorts work; a review is posted and the average updates; a profile is saved;
  friends appear on the map; the phone layout opens the Friends and Profile sheets without errors.
* **Please also run this checklist against your real Supabase project** (this is the part that proves the database works):

| # | Test | Expected |
|---|---|---|
| 1 | Open `app.html` | Map centers on Bacolod, 10 places listed, events listed |
| 2 | Select the *Relaxed* mood | "Best matches" shows high percentages for quiet places first |
| 3 | Select the *Highly interactive* color | Only red places and events remain |
| 4 | Zoom out | Nearby same-color places merge into a bubble of that color |
| 5 | Type `pla` in search | Suggestions include Bacolod Public Plaza and Robinsons Place Bacolod |
| 6 | Open three places, press **Back** | Returns to the second place, history list shrinks |
| 7 | Click **My location**, sort **Nearest** | Distances appear, list orders by distance |
| 8 | Open a popup, **Get directions** | Route line, distance, time and steps appear |
| 9 | Open **Reviews**, post one, refresh the page | Review is still there (saved in `reviews`) |
| 10 | Right panel > Profile > change name > **Save profile**, refresh | The new name is still there (saved in `profiles`) |
| 11 | Friends > tap a place chip | Map flies to that place |
| 12 | Narrow the browser to phone width | Bottom bar appears; Friends/Profile open as full-screen sheets |

## 11. Credits and acknowledgements

External libraries and services (none of their code was modified):

* [Leaflet 1.9.4](https://leafletjs.com) (BSD-2-Clause): the map.
* [Leaflet.markercluster 1.5.3](https://github.com/Leaflet/Leaflet.markercluster) (MIT): marker clustering.
* [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors: map tiles and data (ODbL).
* [OSRM public demo server](https://project-osrm.org): driving routes.
* [Supabase](https://supabase.com) and [supabase-js](https://github.com/supabase/supabase-js) (MIT): database and client.
* [Familjen Grotesk](https://fonts.google.com/specimen/Familjen+Grotesk) via Google Fonts (SIL OFL): typeface.
* Browser Geolocation API: user location.

Algorithms (heap, trie, stack, merge sort, haversine, weighted scoring) were written for this project from
the standard textbook descriptions.

Tool assistance: Claude (Anthropic) was used as a coding assistant while building and restructuring this project.
*(Edit or remove this line so it accurately reflects how you worked, as your instructor requires.)*

Place names, descriptions, reviews and friends in the sample data are made up for demonstration.
