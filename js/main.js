// Application start-up: load data from the database, then build the screen.

function initLeftTabs() {
  byId('tabs').onclick = event => {
    const button = event.target.closest('button');
    if (!button) return;
    document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-pressed', b === button));
    byId('tab-explore').hidden = button.dataset.tab !== 'explore';
    byId('tab-about').hidden = button.dataset.tab !== 'about';
  };
}

async function startApp() {
  try {
    Object.assign(appState, await loadMapData());   // moods, places, events, friends
    await refreshReviews();
    await loadProfileFromDatabase();

    buildExploreControls();
    renderExplore();
    initSearch();
    initHistory();
    initReviews();
    renderAbout();
    initLeftTabs();
    initSocialPanel();
  } catch (error) {
    console.error(error);
    showStatus('Could not load data: ' + (error.message || JSON.stringify(error)), 0);
  }
}

startApp();
