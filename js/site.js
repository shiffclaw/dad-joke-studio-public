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

  /* --- Shorts (paginated) --- */
  const SHORTS_PER_PAGE = 6;
  let shortsData = [];
  let shortsPage = 1;

  function renderShortsPage() {
    const el = document.getElementById('shorts-container');
    const pager = document.getElementById('shorts-pager');
    if (!el) return;

    const totalPages = Math.ceil(shortsData.length / SHORTS_PER_PAGE);
    const start = (shortsPage - 1) * SHORTS_PER_PAGE;
    const slice = shortsData.slice(start, start + SHORTS_PER_PAGE);

    el.innerHTML = slice.map(s => `
      <div class="short-card">
        <div class="video-wrap">
          <iframe src="https://www.youtube.com/embed/${s.youtubeId}" loading="lazy" allowfullscreen></iframe>
        </div>
        <div class="short-info">
          <h3>${s.title}</h3>
          ${s.date ? '<p class="short-date">' + s.date + '</p>' : ''}
        </div>
      </div>`).join('');

    if (pager && totalPages > 1) {
      let btns = '';
      if (shortsPage > 1) btns += '<button class="pager-btn" data-page="' + (shortsPage - 1) + '">&laquo; Prev</button>';
      for (let i = 1; i <= totalPages; i++) {
        btns += '<button class="pager-btn' + (i === shortsPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
      }
      if (shortsPage < totalPages) btns += '<button class="pager-btn" data-page="' + (shortsPage + 1) + '">Next &raquo;</button>';
      pager.innerHTML = btns;
      pager.querySelectorAll('.pager-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          shortsPage = parseInt(this.dataset.page);
          renderShortsPage();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }
  }

  async function loadShorts() {
    const el = document.getElementById('shorts-container');
    if (!el) return;
    const shorts = await loadJSON('data/shorts.json');
    if (!shorts || shorts.length === 0) {
      el.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><h2>No Shorts Published Yet</h2><p>The team is "working on it." Jerry says it\'s almost done. It\'s not.</p></div>';
      return;
    }
    shortsData = shorts;
    shortsPage = 1;
    renderShortsPage();
  }

  /* Boot */
  loadLatestComic();
  loadArchive();
  loadPipeline();
  loadTeam();
  loadShorts();
})();
