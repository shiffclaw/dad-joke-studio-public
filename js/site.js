/* Dad Joke Studio Public — data loader */

(function () {
  const page = document.body.parentElement.querySelector('title').textContent;

  function loadJSON(url) {
    return fetch(url).then(r => r.json()).catch(() => null);
  }

  /* --- Homepage: latest comic --- */
  async function loadLatestComic() {
    const el = document.getElementById('latest-comic');
    if (!el) return;
    const comics = await loadJSON('data/comics.json');
    if (!comics || comics.length === 0) return;

    const latest = comics[comics.length - 1];
    el.innerHTML = `
      <div class="comic-feature">
        <img src="${latest.image}" alt="${latest.title}">
        <div class="comic-info">
          <h2>${latest.title}</h2>
          <p class="issue-meta">Issue #${latest.issue} &bull; ${latest.date}</p>
        </div>
      </div>`;
  }

  /* --- Archive --- */
  async function loadArchive() {
    const el = document.getElementById('archive-container');
    if (!el) return;
    const comics = await loadJSON('data/comics.json');
    if (!comics || comics.length === 0) return;

    el.innerHTML = comics.slice().reverse().map(c => `
      <a class="archive-card" href="${c.image}" target="_blank">
        <img src="${c.thumbnail || c.image}" alt="${c.title}">
        <div class="card-info">
          <h3>${c.title}</h3>
          <p>Issue #${c.issue} &bull; ${c.date}</p>
        </div>
      </a>`).join('');
  }

  /* --- Pipeline / Studio --- */
  async function loadPipeline() {
    const board = document.getElementById('pipeline-board');
    const empty = document.getElementById('pipeline-empty');
    const dateEl = document.getElementById('pipeline-date');
    if (!board) return;

    const data = await loadJSON('data/pipeline.json');
    if (!data || !data.columns || data.columns.length === 0) {
      board.style.display = 'none';
      return;
    }

    if (empty) empty.style.display = 'none';
    if (dateEl && data.date) dateEl.textContent = 'Last updated: ' + data.date;

    const stageClasses = {
      'Scouting': 'scouting',
      'Writing': 'writing',
      'Casting': 'casting',
      'Visual Dev': 'visual',
      'Production': 'production',
    };

    board.innerHTML = data.columns.map(col => {
      const cls = stageClasses[col.stage] || 'scouting';
      const items = (col.items || []).map(it =>
        `<div class="pipeline-item"><span class="joke-id">${it.id}</span> ${it.label || ''}</div>`
      ).join('');
      return `<div class="pipeline-col"><h3 class="${cls}">${col.stage}</h3>${items || '<div class="pipeline-item" style="color:#aaa;text-align:center">Empty</div>'}</div>`;
    }).join('');
  }

  /* --- Team --- */
  async function loadTeam() {
    const el = document.getElementById('team-container');
    if (!el) return;
    const team = await loadJSON('data/team.json');
    if (!team) return;

    el.innerHTML = team.map(m => `
      <div class="team-card">
        <img src="${m.avatar}" alt="${m.name}" onerror="this.style.display='none'">
        <h3>${m.name}</h3>
        <div class="role">${m.role}</div>
        <p>${m.bio}</p>
      </div>`).join('');
  }

  /* --- Shorts --- */
  async function loadShorts() {
    const el = document.getElementById('shorts-container');
    if (!el) return;
    const shorts = await loadJSON('data/shorts.json');
    if (!shorts || shorts.length === 0) return;

    el.innerHTML = shorts.map(s => `
      <div class="short-card">
        <div class="video-wrap">
          <iframe src="https://www.youtube.com/embed/${s.youtubeId}" allowfullscreen></iframe>
        </div>
        <div class="short-info">
          <h3>${s.title}</h3>
        </div>
      </div>`).join('');
  }

  /* Boot */
  loadLatestComic();
  loadArchive();
  loadPipeline();
  loadTeam();
  loadShorts();
})();
