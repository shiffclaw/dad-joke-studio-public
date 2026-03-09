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

    el.innerHTML = slice.map(s => {
      const canEmbed = s.embeddable !== false;
      const videoHtml = canEmbed
        ? `<iframe src="https://www.youtube.com/embed/${s.youtubeId}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
        : `<a class="video-fallback" href="https://www.youtube.com/watch?v=${s.youtubeId}" target="_blank" rel="noopener noreferrer">
             <img src="https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg" alt="${s.title}">
             <span class="fallback-cta">Watch on YouTube</span>
           </a>`;

      return `
      <div class="short-card">
        <div class="video-wrap">
          ${videoHtml}
        </div>
        <div class="short-info">
          <h3>${s.title}</h3>
          ${s.date ? '<p class="short-date">' + s.date + '</p>' : ''}
        </div>
      </div>`;
    }).join('');

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

  /* --- Team Smack (runs-based) --- */
  const channelTopics = {
    production: 'Actual work updates. Supposedly.',
    random: 'Off-topic. On-brand.'
  };

  let smackChannelData = {};
  let smackActive = 'production';
  let smackShowingPrevious = {};

  function renderSmackMessages(runs) {
    const el = document.getElementById('smack-messages');
    if (!el) return;

    if (!runs || runs.length === 0) {
      el.innerHTML = '<div style="padding:2rem;text-align:center;color:#999;">No messages yet. Suspiciously quiet.</div>';
      return;
    }

    const channel = smackActive;
    const showAll = smackShowingPrevious[channel];
    const latestRun = runs[0];
    const olderRuns = runs.slice(1);

    let html = '';

    // "Show Previous Messages" button at top (if there are older runs)
    if (olderRuns.length > 0 && !showAll) {
      html += `<button class="smack-show-previous" id="smack-show-prev-btn">Show Previous Messages (${olderRuns.length} earlier thread${olderRuns.length > 1 ? 's' : ''})</button>`;
    }

    // Render older runs if expanded
    if (showAll && olderRuns.length > 0) {
      html += `<button class="smack-show-previous" id="smack-hide-prev-btn">Hide Previous Messages</button>`;
      for (const run of olderRuns.slice().reverse()) {
        html += `<div class="smack-run-divider">${run.label} &mdash; ${run.date}</div>`;
        html += renderMessageList(run.messages);
      }
      html += `<div class="smack-run-divider" style="background:var(--paper-dark);font-size:0.85rem;color:var(--blue);">Current: ${latestRun.label}</div>`;
    }

    // Always show latest run
    html += renderMessageList(latestRun.messages);

    el.innerHTML = html;

    // Bind show/hide buttons
    const showBtn = document.getElementById('smack-show-prev-btn');
    if (showBtn) {
      showBtn.addEventListener('click', function () {
        smackShowingPrevious[channel] = true;
        renderSmackMessages(smackChannelData[channel]);
      });
    }
    const hideBtn = document.getElementById('smack-hide-prev-btn');
    if (hideBtn) {
      hideBtn.addEventListener('click', function () {
        smackShowingPrevious[channel] = false;
        renderSmackMessages(smackChannelData[channel]);
      });
    }
  }

  function renderMessageList(messages) {
    if (!messages || messages.length === 0) return '';
    return messages.map(m => `
      <div class="smack-msg">
        <img class="smack-msg-avatar" src="${m.avatar}" alt="${m.user}" onerror="this.style.display='none'">
        <div class="smack-msg-body">
          <div class="smack-msg-header">
            <span class="smack-msg-user">${m.user}</span>
            <span class="smack-msg-time">${m.timestamp}</span>
          </div>
          <div class="smack-msg-text">${m.text}</div>
        </div>
      </div>`).join('');
  }

  function switchSmackChannel(channel) {
    smackActive = channel;
    document.querySelectorAll('.smack-channel').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.channel === channel);
    });
    const headerEl = document.querySelector('.smack-chat-channel');
    const topicEl = document.querySelector('.smack-chat-topic');
    if (headerEl) headerEl.textContent = '# ' + channel;
    if (topicEl) topicEl.textContent = channelTopics[channel] || '';
    renderSmackMessages(smackChannelData[channel] || []);
  }

  function parseSmackData(data) {
    // Support both old flat array and new runs format
    if (Array.isArray(data)) {
      return [{ label: 'Messages', date: '', messages: data }];
    }
    if (data && data.runs) {
      return data.runs;
    }
    return [];
  }

  async function loadSmack() {
    const el = document.getElementById('smack-messages');
    if (!el) return;

    const [production, random] = await Promise.all([
      loadJSON('data/smack-production.json'),
      loadJSON('data/smack-random.json')
    ]);
    smackChannelData.production = parseSmackData(production);
    smackChannelData.random = parseSmackData(random);

    renderSmackMessages(smackChannelData[smackActive]);

    document.querySelectorAll('.smack-channel').forEach(btn => {
      btn.addEventListener('click', function () {
        switchSmackChannel(this.dataset.channel);
      });
    });
  }

  /* --- Studio: dynamic article loading --- */
  async function loadStudioArticle() {
    const articleEl = document.getElementById('studio-article');
    const archiveEl = document.getElementById('studio-archive-list');
    const archiveSection = document.getElementById('studio-archive-section');
    if (!articleEl) return;

    const articles = await loadJSON('data/studio-articles.json');
    if (!articles || articles.length === 0) {
      articleEl.innerHTML = '<main><div class="empty-state"><h2>No Articles Yet</h2><p>The studio is quiet. Too quiet.</p></div></main>';
      return;
    }

    // Load latest article
    const latest = articles[0];
    try {
      const resp = await fetch('studio/articles/' + latest.slug + '.html');
      if (!resp.ok) throw new Error('Not found');
      let html = await resp.text();
      // Fix image paths (article fragments use ../images/, studio.html needs images/)
      html = html.replace(/src="\.\.\/images\//g, 'src="images/');
      articleEl.innerHTML = html;
    } catch (e) {
      articleEl.innerHTML = '<main><div class="empty-state"><h2>Could not load article</h2><p>' + latest.title + '</p></div></main>';
    }

    // Render archive list (only show if there are older articles)
    if (archiveEl && archiveSection && articles.length > 1) {
      archiveSection.style.display = '';
      const older = articles.slice(1);
      archiveEl.innerHTML = older.map(a =>
        `<a class="studio-archive-list-item" href="studio/article.html?slug=${encodeURIComponent(a.slug)}">
          <span class="archive-date">${a.date}</span>
          <span class="archive-title">${a.title}</span>
        </a>`
      ).join('');
    }
  }

  /* Boot */
  loadLatestComic();
  loadArchive();
  loadPipeline();
  loadTeam();
  loadShorts();
  loadSmack();
  loadStudioArticle();
})();
