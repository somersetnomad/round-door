/* The Round Door Hobbit Study · deeper study layer
   Adds to every subject room a "chapter scroll" with six hands-on activities for the chosen chapter,
   adds extra discussion, a go-deeper extension and three cross-subject quests to the Hearth Room,
   a chapter ledger to the Hall, door-shaped passages at the foot of every room, and a printable chapter plan.
   Everything saves in this browser only (localStorage), like the rest of the site. */
(function () {
  const RD = window.RD; if (!RD) return;
  const { store, $, el, sparkle, go, setChap, chapters, sections, GRAPH, SHORT, isOpen, isSecret, ROOM_ICON } = RD;
  const C = window.RD_CONTENT || [];
  const SUBJ = ['narration', 'literature', 'geography', 'history', 'science', 'math', 'art', 'cooking', 'character', 'drama', 'notebook', 'outdoor'];
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX'];
  const subjName = id => (sections.find(s => s.id === id) || {}).name || id;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const icon = id => `<svg viewBox="0 0 24 24" aria-hidden="true">${ROOM_ICON[id] || ''}</svg>`;

  let done = store.get('rd-act', {});      // { "ch-subject": [activity indices] }
  let qDone = store.get('rd-quest', {});   // { "ch-q": [step indices] }
  const key = (ch, s) => ch + '-' + s;
  const isDone = (ch, s, i) => (done[key(ch, s)] || []).includes(i);
  const countFor = (ch, s) => (done[key(ch, s)] || []).length;
  const actsFor = (ch, s) => (C[ch] && C[ch].act && C[ch].act[s]) || [];
  const totalActs = () => C.reduce((n, c) => n + (c ? SUBJ.reduce((m, s) => m + ((c.act && c.act[s]) || []).length, 0) : 0), 0);
  const totalDone = () => Object.values(done).reduce((n, a) => n + a.length, 0);
  function toggle(ch, s, i, on) {
    const k = key(ch, s); const a = new Set(done[k] || []);
    on ? a.add(i) : a.delete(i);
    done[k] = [...a]; store.set('rd-act', done);
    document.dispatchEvent(new CustomEvent('rd:act', { detail: { ch, s, i, on, n: done[k].length } }));
  }

  /* ---------- chapter strip (shared by every scroll) ---------- */
  function strip(cur) {
    const read = RD.read;
    return `<div class="ch-strip" role="group" aria-label="Choose a chapter">${chapters.map((c, i) =>
      `<button class="ch-dot${read.includes(i) ? ' read' : ''}" data-ch="${i}" aria-pressed="${i === cur}" title="Chapter ${i + 1}: ${esc(c[0])}" aria-label="Chapter ${i + 1}, ${esc(c[0])}">${i + 1}</button>`).join('')}</div>`;
  }

  /* ---------- the scroll in each subject room ---------- */
  function questsUsing(ch, s) { return ((C[ch] && C[ch].quests) || []).map((q, i) => ({ q, i })).filter(x => x.q.rooms.includes(s)); }
  function renderScroll(s) {
    const host = document.querySelector(`.ch-scroll[data-subj="${s}"]`); if (!host) return;
    const ch = RD.curChap, acts = actsFor(ch, s), n = countFor(ch, s);
    const qs = questsUsing(ch, s);
    host.querySelector('.scroll-sheet').innerHTML = `
      <div class="row between"><span class="label">Chapter work · ${esc(subjName(s))}</span><span class="score">${n} of ${acts.length || 6} done</span></div>
      <h3><span class="num">${ROMAN[ch + 1]}.</span> ${esc(chapters[ch][0])}</h3>
      ${strip(ch)}
      ${acts.length ? `<ol class="acts">${acts.map(([t, d], i) => `<li class="act${isDone(ch, s, i) ? ' done' : ''}"><label><input type="checkbox" data-i="${i}" ${isDone(ch, s, i) ? 'checked' : ''}><span class="act-n">${i + 1}</span><span class="act-t"><b>${esc(t)}</b>${esc(d)}</span></label></li>`).join('')}</ol>`
        : `<p class="note">The activities for this chapter are still being written.</p>`}
      ${qs.length ? `<div class="scroll-foot"><span class="label">Part of a quest</span>${qs.map(({ q }) => `<button class="door small-door" data-go="narration" data-quest="1">${icon('narration')}${esc(q.t)}</button>`).join('')}</div>` : ''}
      <div class="row no-print"><button class="btn small" data-print="${ch}">Print chapter ${ch + 1}'s full plan</button></div>`;
  }
  function renderAllScrolls() { SUBJ.forEach(renderScroll) }

  function mountScrolls() {
    SUBJ.forEach(s => {
      const panel = $('#p-' + s); if (!panel) return;
      const head = panel.querySelector('.panel-head');
      const box = el('section', { class: 'ch-scroll', 'data-subj': s, 'aria-label': 'Chapter work for ' + subjName(s) },
        '<div class="scroll-rod" aria-hidden="true"></div><div class="scroll-sheet"></div><div class="scroll-rod bottom" aria-hidden="true"></div>');
      // In the Hearth Room the scroll sits after the chapter companion; elsewhere straight after the room's heading.
      if (s === 'narration') { const comp = $('#chapBody').closest('.board'); comp.after(box) }
      else head.after(box);
      box.addEventListener('change', e => {
        const i = e.target.dataset.i; if (i == null) return;
        toggle(RD.curChap, s, +i, e.target.checked);
        const li = e.target.closest('.act'); li.classList.toggle('done', e.target.checked);
        if (e.target.checked) sparkle(e.target, countFor(RD.curChap, s) === actsFor(RD.curChap, s).length);
        box.querySelector('.score').textContent = `${countFor(RD.curChap, s)} of ${actsFor(RD.curChap, s).length} done`;
        renderLedger();
      });
    });
  }

  /* ---------- Hearth Room: more questions, go deeper, quests ---------- */
  function renderDeeper() {
    const host = $('#chapDeeper'); if (!host) return;
    const ch = RD.curChap, c = C[ch];
    if (!c) { host.innerHTML = '<p class="note">More for this chapter is on its way.</p>'; return; }
    const qk = i => ch + '-' + i;
    host.innerHTML = `
      <div class="two">
        <div class="board"><span class="label">More to talk over · chapter ${ch + 1}</span><h3>Questions for the fireside</h3>
          <ol class="clean talk">${c.talk.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
          <p class="note">There are no wrong answers here. Ask for a reason, and let the youngest answer first.</p></div>
        <details class="board deeper"><summary><span class="label">Go deeper · for older children</span><h3>${esc(c.deeper.t)}</h3><span class="note">Tap to unroll</span></summary>
          <p>${esc(c.deeper.d)}</p><ol class="clean">${c.deeper.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol></details>
      </div>
      <div class="board" id="quests"><div class="row between"><span class="label">Three quests across the rooms</span><span class="score">${c.quests.filter((q, i) => (qDone[qk(i)] || []).length === q.steps.length).length} of 3 complete</span></div>
        <h3>Projects that join the subjects together</h3>
        <div class="quests">${c.quests.map((q, i) => {
          const d = qDone[qk(i)] || [];
          return `<article class="quest-card${d.length === q.steps.length ? ' complete' : ''}"><span class="seal" aria-hidden="true">${['I', 'II', 'III'][i]}</span><h4>${esc(q.t)}</h4><p>${esc(q.d)}</p>
            <div class="row quest-rooms">${q.rooms.map(r => `<button class="door small-door" data-go="${r}">${icon(r)}${esc(SHORT[r])}</button>`).join('')}</div>
            <ul class="check q-steps">${q.steps.map((st, j) => `<li class="${d.includes(j) ? 'done' : ''}"><label><input type="checkbox" data-q="${i}" data-j="${j}" ${d.includes(j) ? 'checked' : ''}><span>${esc(st)}</span></label></li>`).join('')}</ul></article>`;
        }).join('')}</div></div>`;
  }
  function mountDeeper() {
    const scroll = document.querySelector('.ch-scroll[data-subj="narration"]');
    const box = el('div', { id: 'chapDeeper', class: 'inner' });
    scroll.after(box);
    box.addEventListener('change', e => {
      const t = e.target; if (t.dataset.q == null) return;
      const k = RD.curChap + '-' + t.dataset.q, j = +t.dataset.j; const a = new Set(qDone[k] || []);
      t.checked ? a.add(j) : a.delete(j); qDone[k] = [...a]; store.set('rd-quest', qDone);
      const q = C[RD.curChap].quests[+t.dataset.q];
      if (t.checked) sparkle(t, qDone[k].length === q.steps.length);
      renderDeeper();
    });
  }

  /* ---------- Hall: the chapter ledger ---------- */
  function renderLedger() {
    const host = $('#ledger'); if (!host) return;
    const total = totalActs(), d = totalDone();
    host.innerHTML = `<div class="row between"><span class="label">The chapter ledger</span><span class="score">${d.toLocaleString()} of ${total.toLocaleString()} activities done</span></div>
      <h3>Every chapter, every room</h3>
      <p class="note">Each square is one subject for one chapter. Darker means more of its six activities are done. Tap a square to go straight there.</p>
      <div class="ledger-wrap"><table class="ledger"><thead><tr><th scope="col"><span class="sr">Chapter</span></th>${SUBJ.map(s => `<th scope="col" title="${esc(subjName(s))}">${icon(s)}<span class="sr">${esc(subjName(s))}</span></th>`).join('')}<th scope="col" class="lt">Done</th></tr></thead>
      <tbody>${chapters.map((c, ch) => {
        let row = 0, rowMax = 0;
        const cells = SUBJ.map(s => { const n = countFor(ch, s), m = actsFor(ch, s).length || 6; row += n; rowMax += m;
          return `<td><button class="lcell" data-ch="${ch}" data-s="${s}" style="--f:${(n / m).toFixed(2)}" aria-label="Chapter ${ch + 1}, ${esc(subjName(s))}: ${n} of ${m} done"></button></td>` }).join('');
        return `<tr class="${RD.read.includes(ch) ? 'is-read' : ''}"><th scope="row"><button class="lrow" data-ch="${ch}" title="${esc(c[0])}">${ch + 1}</button></th>${cells}<td class="lt">${row}/${rowMax}</td></tr>`;
      }).join('')}</tbody></table></div>`;
  }
  function mountLedger() {
    const after = $('#pips').closest('.board');
    const box = el('div', { class: 'board', id: 'ledger' }); after.after(box);
    box.addEventListener('click', e => {
      const c = e.target.closest('.lcell'); if (c) { setChap(+c.dataset.ch); go(c.dataset.s, e); return; }
      const r = e.target.closest('.lrow'); if (r) { setChap(+r.dataset.ch); go('narration', e); }
    });
  }

  /* ---------- doors at the foot of every room ---------- */
  function renderPassages(id) {
    const panel = $('#p-' + id); if (!panel) return;
    let nav = panel.querySelector(':scope > .passages');
    if (!nav) { nav = el('nav', { class: 'passages', 'aria-label': 'Passages leading out of this room' }); panel.appendChild(nav); }
    const doors = (GRAPH[id] || []).map(n => {
      const sealed = isSecret(n) && !isOpen(n);
      return `<button class="arch${sealed ? ' sealed' : ''}${isSecret(n) ? ' secret' : ''}" data-go="${n}"><span class="arch-icon">${sealed ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="4" fill="currentColor"/><path d="M10 12 L9 20 L15 20 L14 12Z" fill="currentColor"/></svg>' : icon(n)}</span><span class="arch-name">${sealed ? 'A sealed door' : esc(SHORT[n])}</span><span class="arch-sub">${sealed ? 'Locked for now' : RD.LS.visited.includes(n) ? 'You have been here' : 'Not yet explored'}</span></button>`;
    }).join('');
    nav.innerHTML = `<span class="label">Passages from the ${esc(SHORT[id])}</span><div class="arches">${doors}</div><button class="btn small" data-open-map>Unroll the labyrinth map</button>`;
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-open-map]')) $('#mapBtn').click(); });

  /* ---------- printable chapter plan ---------- */
  function printPlan(ch) {
    const c = C[ch], ttl = chapters[ch];
    let h = `<h1>Chapter ${ch + 1} · ${esc(ttl[0])}</h1><p class="pp-sum">${esc(ttl[1])}</p>
      <h2>Tell it back</h2><p>${esc(ttl[2])}</p><h2>Talk it over</h2><ol>${ttl[3].concat(c ? c.talk : []).map(q => `<li>${esc(q)}</li>`).join('')}</ol>`;
    if (c) {
      h += `<h2>Go deeper: ${esc(c.deeper.t)}</h2><p>${esc(c.deeper.d)}</p><ol>${c.deeper.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`;
      h += `<h2>Quests</h2>${c.quests.map(q => `<h3>${esc(q.t)} <small>(${q.rooms.map(r => esc(SHORT[r])).join(', ')})</small></h3><p>${esc(q.d)}</p><ol>${q.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`).join('')}`;
      h += SUBJ.map(s => `<h2>${esc(subjName(s))}</h2><ol class="pp-acts">${actsFor(ch, s).map(([t, d], i) => `<li><span class="pp-box">${isDone(ch, s, i) ? '✓' : ''}</span><b>${esc(t)}.</b> ${esc(d)}</li>`).join('')}</ol>`).join('');
    }
    h += `<p class="pp-foot">The Round Door Hobbit Study · somersetnomad.github.io/round-door · Use alongside your own copy of the book.</p>`;
    let sheet = $('#printSheet'); if (!sheet) { sheet = el('div', { id: 'printSheet' }); document.body.appendChild(sheet); }
    sheet.innerHTML = h; document.body.classList.add('printing');
    const done = () => { document.body.classList.remove('printing'); removeEventListener('afterprint', done); };
    addEventListener('afterprint', done);
    try { window.print() } catch (e) { }
    setTimeout(() => { if (!matchMedia('print').matches) done() }, 1500);
  }

  /* ---------- wiring ---------- */
  mountScrolls(); mountDeeper(); mountLedger();
  renderAllScrolls(); renderDeeper(); renderLedger(); renderPassages(RD.curRoom);

  document.addEventListener('click', e => {
    const d = e.target.closest('.ch-dot'); if (d) { setChap(+d.dataset.ch); return; }
    const p = e.target.closest('[data-print]'); if (p) { printPlan(+p.dataset.print); return; }
    if (e.target.closest('[data-quest]')) setTimeout(() => { const q = $('#quests'); q && q.scrollIntoView({ behavior: RD.reduce ? 'auto' : 'smooth', block: 'start' }) }, 700);
  });
  document.addEventListener('rd:chap', () => {
    // wait one tick so curChap has updated, then re-render and play the unrolling animation
    setTimeout(() => {
      renderAllScrolls(); renderDeeper();
      document.querySelectorAll('.ch-scroll').forEach(s => { s.classList.remove('unroll'); void s.offsetWidth; s.classList.add('unroll') });
    }, 0);
  });
  document.addEventListener('rd:read', () => { renderAllScrolls(); renderLedger() });
  document.addEventListener('rd:room', e => { renderPassages(e.detail.id); if (e.detail.id === 'home') renderLedger() });
  document.addEventListener('rd:key', () => renderPassages(RD.curRoom));

  RD.study = { SUBJ, printPlan, totalActs, totalDone, countFor, actsFor, renderLedger, renderPassages };
})();
