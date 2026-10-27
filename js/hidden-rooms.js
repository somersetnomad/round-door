/* The Round Door Hobbit Study · four new hidden rooms
   The Barrel Cellar (riddle door), the Echo Gallery (riddle door), the Mapmaker's Attic (needs four keys)
   and the Last-Light Door (needs every key). All riddles and puzzles are original to this study. */
(function () {
  const RD = window.RD; if (!RD) return;
  const { store, $, el, sparkle, spawn, GOLD, LS, saveLS, KEYS, earnKey, renderLocks, matches, wrongShake, keySvg, chapters, f1, actx, reduce } = RD;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* A riddle door: carved words, an answer box, and a key when it opens. */
  function riddleDoor(id, keyId, html, answers, nudge) {
    const lock = $('#' + id + 'Lock');
    lock.innerHTML = html + `<div class="row"><input id="${id}In" placeholder="Speak the answer…" aria-label="Your answer to the door"><button class="btn solid" id="${id}Btn">Speak</button></div><p class="feedback" id="${id}Fb" aria-live="polite"></p>`;
    const inp = $('#' + id + 'In'), fb = $('#' + id + 'Fb');
    $('#' + id + 'Btn').onclick = () => {
      if (matches(inp.value, answers)) { LS.unl[id] = 1; saveLS(); sparkle($('#' + id + 'Btn'), true); earnKey(keyId); renderLocks(); document.dispatchEvent(new CustomEvent('rd:unlock', { detail: { id } })); }
      else wrongShake(inp, fb, nudge);
    };
    inp.onkeydown = e => { if (e.key === 'Enter') $('#' + id + 'Btn').click(); };
  }

  /* ================= THE BARREL CELLAR ================= */
  riddleDoor('cellar', 'cellar',
    `<span class="label">The barrel door</span><h3>A great barrel blocks the stair, with words burned into its lid</h3><p class="carve">"Round as the moon and belted with iron, I stand still when I am full. Empty me, and I will ride the river all the way to the lake. What am I?"</p>`,
    ['barrel', 'barrels', 'cask', 'casks', 'keg', 'kegs', 'tun'], 'The barrel does not budge. Think of something the dwarves once travelled in…');

  const LOGIC = [
    { names: ['Fili', 'Kili', 'Ori'], clues: ['Ori is not in a barrel at either end of the row.', 'Kili\'s barrel is somewhere to the left of Fili\'s.'], sol: { Kili: 1, Ori: 2, Fili: 3 } },
    { names: ['Dori', 'Nori', 'Bifur'], clues: ['Bifur is not in barrel 2.', 'Nori\'s barrel has a higher number than Bifur\'s.', 'Dori is not in barrel 3.'], sol: { Bifur: 1, Dori: 2, Nori: 3 } },
    { names: ['Balin', 'Dwalin', 'Oin', 'Gloin'], clues: ['Balin is in barrel 4.', 'Dwalin\'s barrel does not touch Balin\'s.', 'Oin and Gloin are brothers, and their barrels touch.', 'Gloin\'s barrel has a higher number than Oin\'s.'], sol: { Dwalin: 1, Oin: 2, Gloin: 3, Balin: 4 } },
    { names: ['Bombur', 'Bofur', 'Thorin', 'Ori'], clues: ['Bombur needs the biggest barrel, and the biggest is at one end.', 'Bofur\'s barrel touches Bombur\'s.', 'Ori\'s barrel does not touch Bofur\'s.', 'Thorin\'s barrel has a higher number than Ori\'s.'], sol: { Ori: 1, Thorin: 2, Bofur: 3, Bombur: 4 } },
    { names: ['Fili', 'Kili', 'Dori', 'Nori', 'Ori'], clues: ['Dori is in the middle barrel.', 'Fili and Kili are brothers, and their barrels touch.', 'Kili\'s barrel has a lower number than Fili\'s.', 'Ori is not at either end.', 'Nori\'s barrel has a higher number than Fili\'s.'], sol: { Kili: 1, Fili: 2, Dori: 3, Ori: 4, Nori: 5 } }
  ];
  let logicDone = store.get('rd-cellar-logic', []), logicI = Math.min(store.get('rd-cellar-li', 0), LOGIC.length - 1);
  const FLOAT = ['An apple', 'A wooden spoon', 'A metal spoon', 'A cork', 'A coin', 'An orange with its peel on', 'The same orange, peeled', 'A grape', 'An empty bottle with its lid on', 'The same bottle filled with water', 'A toy brick', 'A small pebble'];
  let floatS = store.get('rd-float', {}); // {i:{p:'f'|'s', r:'f'|'s'}}

  function renderCellar() {
    const inner = $('#cellarInner'); if (!inner) return;
    const pz = LOGIC[logicI], solved = logicDone.includes(logicI), n = pz.names.length;
    inner.innerHTML = `
      <div class="board"><div class="row between"><span class="label">Barrel logic</span><span class="score">${logicDone.length} of ${LOGIC.length} puzzles solved</span></div>
        <h3>Who is in which barrel?</h3>
        <div class="row">${LOGIC.map((p, i) => `<button class="pill" data-lp="${i}" aria-pressed="${i === logicI}">${logicDone.includes(i) ? '✓ ' : ''}Puzzle ${i + 1}</button>`).join('')}</div>
        <p>${n} dwarves are packed into ${n} barrels standing in a row, numbered 1 to ${n} from left to right. Use every clue.</p>
        <ol class="clean">${pz.clues.map(c => `<li>${esc(c)}</li>`).join('')}</ol>
        <div class="barrel-row" style="--n:${n}">${Array.from({ length: n }, (_, b) => `<div class="barrel"><svg viewBox="0 0 70 84" aria-hidden="true"><path d="M8 8 Q2 42 8 76 Q35 86 62 76 Q68 42 62 8 Q35 -2 8 8Z" fill="#a8703c" stroke="#4a2a12" stroke-width="2"/><path d="M5 22 Q35 28 65 22 M3 42 Q35 48 67 42 M5 62 Q35 68 65 62" stroke="#3a2212" stroke-width="3" fill="none"/><text x="35" y="54" text-anchor="middle" font-family="IM Fell English, serif" font-size="22" fill="#fbe9c4">${b + 1}</text></svg>
          <select data-b="${b + 1}" aria-label="Who is in barrel ${b + 1}?" ${solved ? 'disabled' : ''}><option value="">Who?</option>${pz.names.map(nm => `<option${solved && pz.sol[nm] === b + 1 ? ' selected' : ''}>${nm}</option>`).join('')}</select></div>`).join('')}</div>
        <div class="row"><button class="btn solid" id="logicGo" ${solved ? 'disabled' : ''}>Knock on the barrels</button><span class="feedback" id="logicFb" aria-live="polite">${solved ? 'Solved! Every dwarf is in the right barrel.' : ''}</span></div>
        <p class="note">Tip: draw the row on paper and cross out the places each clue rules out. Puzzles get harder as you go.</p></div>

      <div class="board"><div class="row between"><span class="label">Float or sink?</span><span class="score" id="floatScore"></span></div>
        <h3>Why does an empty barrel ride the river?</h3>
        <p>Fill a sink or bowl with water. For each thing, guess first, then test it and mark what really happened.</p>
        <div class="float-table" role="table" aria-label="Float or sink experiment">
          <div class="ft-row ft-head" role="row"><span role="columnheader">Thing</span><span role="columnheader">My guess</span><span role="columnheader">What happened</span></div>
          ${FLOAT.map((t, i) => { const s = floatS[i] || {}; return `<div class="ft-row" role="row"><span role="cell">${t}</span><span role="cell" class="ft-pick">${['f', 's'].map(v => `<button class="pill" data-fl="${i}" data-k="p" data-v="${v}" aria-pressed="${s.p === v}">${v === 'f' ? 'Float' : 'Sink'}</button>`).join('')}</span><span role="cell" class="ft-pick">${['f', 's'].map(v => `<button class="pill" data-fl="${i}" data-k="r" data-v="${v}" aria-pressed="${s.r === v}">${v === 'f' ? 'Floated' : 'Sank'}</button>`).join('')}</span></div>` }).join('')}
        </div>
        <details class="explain"><summary>What is going on?</summary><p>Whether something floats depends on how heavy it is for its size, compared with the same amount of water. A sealed empty barrel or bottle is mostly air, so it is very light for its size and floats. Fill it with water and it sinks. The orange's peel is full of tiny air pockets, which act like a life jacket; take the peel off and it often sinks.</p></details></div>

      <div class="board"><span class="label">The cellar ledger</span><h3>How much does a barrel hold?</h3>
        <div class="vol-grid"><div class="vol-ctl">
          <label class="label" for="bH">Height: <b id="bHo"></b> cm</label><input type="range" id="bH" min="40" max="120" value="${store.get('rd-bH', 80)}">
          <label class="label" for="bD">Width at the middle: <b id="bDo"></b> cm</label><input type="range" id="bD" min="30" max="90" value="${store.get('rd-bD', 60)}">
          <label class="label" for="bd">Width at the ends: <b id="bdo"></b> cm</label><input type="range" id="bd" min="20" max="80" value="${store.get('rd-bd', 48)}">
          <label class="label" for="bKid">A child who weighs <b id="bKido"></b> kg</label><input type="range" id="bKid" min="10" max="60" value="${store.get('rd-bKid', 25)}">
        </div><div class="vol-out" id="volOut" aria-live="polite"></div></div>
        <p class="note">Barrel-makers used a handy rule to estimate how much a barrel holds: multiply the height by π, then by twice the middle width squared plus the end width squared, and divide by 12. A person's body is about as heavy as the same amount of water, so a child's weight in kilograms is close to their volume in litres.</p></div>`;
    calcVol(); scoreFloat();
  }
  function calcVol() {
    const H = +$('#bH').value, D = +$('#bD').value, d = Math.min(+$('#bd').value, D), kid = +$('#bKid').value;
    $('#bHo').textContent = H; $('#bDo').textContent = D; $('#bdo').textContent = d; $('#bKido').textContent = kid;
    store.set('rd-bH', H); store.set('rd-bD', D); store.set('rd-bd', d); store.set('rd-bKid', kid);
    const cm3 = Math.PI * H / 12 * (2 * D * D + d * d), L = cm3 / 1000;
    const apples = Math.floor(cm3 * 0.6 / 220);
    $('#volOut').innerHTML = `<p class="big-num">${Math.round(L)} litres</p><p>That is about <b>${apples.toLocaleString()}</b> apples, if each apple takes up 220 cm³ and the apples fill about six tenths of the space (round things leave gaps).</p><p>${L >= kid * 1.15 ? `A ${kid} kg child takes up about ${kid} litres, so they would fit, with room for ${Math.round(L - kid)} litres of straw to pad them.` : `A ${kid} kg child takes up about ${kid} litres, so this barrel is too small. Try a taller or wider barrel.`}</p>`;
  }
  function scoreFloat() {
    const tested = Object.values(floatS).filter(s => s.p && s.r), right = tested.filter(s => s.p === s.r).length;
    const o = $('#floatScore'); if (o) o.textContent = tested.length ? `${right} of ${tested.length} guesses right` : 'Guess, then test';
  }
  document.addEventListener('click', e => {
    const lp = e.target.closest('[data-lp]'); if (lp) { logicI = +lp.dataset.lp; store.set('rd-cellar-li', logicI); renderCellar(); return; }
    if (e.target.id === 'logicGo') {
      const pz = LOGIC[logicI]; const sel = [...document.querySelectorAll('#cellarInner select[data-b]')];
      const pick = {}; sel.forEach(s => pick[s.value] = +s.dataset.b);
      const fb = $('#logicFb');
      if (sel.some(s => !s.value)) { fb.textContent = 'Put a dwarf in every barrel first.'; fb.style.color = 'var(--bad)'; return; }
      if (new Set(sel.map(s => s.value)).size < sel.length) { fb.textContent = 'One dwarf is in two barrels at once! Check again.'; fb.style.color = 'var(--bad)'; return; }
      if (pz.names.every(nm => pick[nm] === pz.sol[nm])) {
        if (!logicDone.includes(logicI)) { logicDone.push(logicI); store.set('rd-cellar-logic', logicDone); }
        sparkle(e.target, logicDone.length === LOGIC.length);
        if (logicI < LOGIC.length - 1) logicI++; store.set('rd-cellar-li', logicI); renderCellar();
      } else { const wrong = pz.clues.length; fb.textContent = `A muffled voice from inside says "Wrong barrel!" Read all ${wrong} clues again.`; fb.style.color = 'var(--bad)'; }
      return;
    }
    const fl = e.target.closest('[data-fl]'); if (fl) {
      const i = fl.dataset.fl; floatS[i] = floatS[i] || {}; floatS[i][fl.dataset.k] = fl.dataset.v; store.set('rd-float', floatS);
      fl.parentElement.querySelectorAll('.pill').forEach(b => b.setAttribute('aria-pressed', String(b === fl))); scoreFloat();
    }
  });
  document.addEventListener('input', e => { if (['bH', 'bD', 'bd', 'bKid'].includes(e.target.id)) calcVol(); });

  /* ================= THE ECHO GALLERY ================= */
  riddleDoor('echo', 'echo',
    `<span class="label">The whispering door</span><h3>The door has no words on it. Instead, a voice drifts out of the dark</h3><p class="carve">"I live in caves and empty halls. I never speak first, but I always answer, and I answer in your own voice. What am I?"</p>`,
    ['echo', 'echoes', 'an echo'], 'Only silence comes back. Try shouting into a cave in your mind…');

  const CLAPS = [[1, 1, 1], [2, 1, 1], [1, 1, 2], [1, 2, 1, 1], [2, 2, 1, 1], [1, 1, 1, 2, 2], [1, 2, 1, 2, 1, 1], [2, 1, 1, 2, 1, 1, 2]];
  let clapDone = store.get('rd-echo-clap', []), clapI = Math.min(clapDone.length, CLAPS.length - 1), shown = false;
  const CAST = ['Bilbo', 'Thorin', 'Gandalf', 'Balin', 'Bombur', 'Bard', 'Beorn', 'the Elvenking', 'Gollum', 'a Lake-town child', 'a wood-elf guard', 'a goblin sentry'];
  const FEEL = { afraid: 'Speak a little faster than usual, with short breaths and a quiet voice that sometimes wobbles.', proud: 'Stand tall, slow right down, and let your voice drop low and steady.', angry: 'Use short, clipped words and lean on the important ones. Do not shout the whole time; anger is scarier when it is held in.', hopeful: 'Let your voice lift at the ends of sentences, and smile while you speak.', sorry: 'Look down, speak gently, and leave pauses where the words are hard to find.', curious: 'Ask questions, tilt your head, and let your voice rise and fall like someone puzzling things out.', tired: 'Slow, heavy words with long pauses, as if every sentence is uphill.', determined: 'Even, firm words. Plant your feet. Slow down on the last sentence.' };
  const STAGE = ['Start sitting down and stand up when you make your decision.', 'Begin with your back to the audience, then turn to face them.', 'Hold an imaginary object the whole time: a lantern, a cup, a key.', 'Walk three slow steps forward during the speech, one at each turning point.', 'Stay completely still, so your voice does all the work.', 'Look at one person in the audience, as if you are speaking only to them.'];
  const TWIST = ['Thirteen thirsty dwarves thumped three tin tankards.', 'Barrels bobbing by the bridge bumped Bombur\'s back.', 'Silver spiders spin sticky silk at sunset.', 'Grey goblins grumbled, grabbing great green grapes.', 'Round red raspberries roll right round the rug.', 'A brave burglar borrowed Bilbo\'s best blue braces.'];
  const RUNGS = [['Whisper', 'Breath only, no voice. Can the back of the room still hear you?'], ['Murmur', 'A soft voice, as if a dragon is asleep next door.'], ['Speaking voice', 'Your normal voice, but clear. Finish every word.'], ['Calling voice', 'As if calling a friend across a garden. Breathe from your belly.'], ['Stage voice', 'Big and strong but never a scream. Imagine your voice landing on the back wall.']];
  let rung = store.get('rd-rung', 2), twI = store.get('rd-tw', 0) % TWIST.length;

  function renderEcho() {
    const inner = $('#echoInner'); if (!inner) return;
    const cast = store.get('rd-mono', { who: 'Bilbo', feel: 'afraid', st: 0 });
    inner.innerHTML = `
      <div class="board"><div class="row between"><span class="label">Clap it back</span><span class="score">${clapDone.length} of ${CLAPS.length} echoes caught</span></div>
        <h3>Listen to the pattern, then clap it back</h3>
        <div class="clap-dots" aria-live="polite">${shown ? CLAPS[clapI].map(b => `<i class="${b === 2 ? 'long' : ''}"></i>`).join('') : '<span class="note">Press Listen. Short claps and long claps make a pattern.</span>'}</div>
        <div class="row"><button class="btn solid" id="clapPlay">Listen</button><button class="btn" id="clapShow">Show me the pattern</button><button class="btn" id="clapGot">We clapped it back</button><span class="score">Echo ${clapI + 1} of ${CLAPS.length}</span></div>
        <p class="note">A long dot means wait twice as long before the next clap. Take turns: one person makes up a pattern and the rest echo it.</p></div>

      <div class="board"><span class="label">The monologue maker</span><h3>Find a character's voice</h3>
        <div class="mono-ctl"><label class="label">Who are you?<select id="monoWho">${CAST.map(c => `<option${c === cast.who ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
        <label class="label">How do you feel?<select id="monoFeel">${Object.keys(FEEL).map(f => `<option${f === cast.feel ? ' selected' : ''}>${f}</option>`).join('')}</select></label>
        <button class="btn" id="monoStage">New stage direction</button></div>
        <ol class="mono-steps">
          <li><b>Where are you?</b> You are ${cast.who} during chapter ${RD.curChap + 1}, <i>${esc(chapters[RD.curChap][0])}</i>. Begin by saying where you are and one thing you can see, hear or smell.</li>
          <li><b>What do you want?</b> Say, in one sentence, what you want most in the world right now.</li>
          <li><b>What is in the way?</b> Name the problem, the person or the fear standing between you and what you want.</li>
          <li><b>How does it feel?</b> ${FEEL[cast.feel]}</li>
          <li><b>What will you do?</b> End with a decision, even a small one, said as clearly as you can.</li>
        </ol>
        <p class="stage-dir"><span class="label">Stage direction</span> ${STAGE[cast.st % STAGE.length]}</p>
        <p class="note">Aim for about a minute. Use your own words; nobody needs a script. Then swap feelings and perform it again. How much does the speech change?</p></div>

      <div class="two"><div class="board"><span class="label">The voice ladder</span><h3>Climb from a whisper to a stage voice</h3>
        <div class="ladder">${RUNGS.map((r, i) => `<button class="rung" data-rung="${i}" aria-pressed="${i === rung}"><b>${r[0]}</b><span>${r[1]}</span></button>`).reverse().join('')}</div>
        <p class="copy-line" style="font-size:1.15rem">Say this on the <b>${RUNGS[rung][0].toLowerCase()}</b> rung: "The lamps are lit, the door is open, and the road is waiting."</p></div>
      <div class="board"><span class="label">Tongue-twisters of the road</span><h3>Say it three times, faster each time</h3><p class="copy-line" id="twLine">${TWIST[twI]}</p><div class="row"><button class="btn" id="twNext">Next twister</button></div><p class="note">Make one of your own using a character's name and four words that start with the same sound.</p></div></div>`;
  }
  function playClaps(pat) {
    const a = actx(); if (!a) return;
    let t = a.currentTime + .15;
    const unit = .32;
    pat.forEach(b => {
      const len = Math.floor(a.sampleRate * .06), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
      const src = a.createBufferSource(); src.buffer = buf; const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = .8; const g = a.createGain(); g.gain.value = .9;
      src.connect(bp); bp.connect(g); g.connect(a.destination); src.start(t);
      // the gallery answers back, softer
      const s2 = a.createBufferSource(); s2.buffer = buf; const g2 = a.createGain(); g2.gain.value = .18; const bp2 = a.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 1100;
      s2.connect(bp2); bp2.connect(g2); g2.connect(a.destination); s2.start(t + .19);
      t += unit * b;
    });
  }
  document.addEventListener('click', e => {
    const id = e.target.id;
    if (id === 'clapPlay') { playClaps(CLAPS[clapI]); }
    else if (id === 'clapShow') { shown = true; renderEcho(); }
    else if (id === 'clapGot') { if (!clapDone.includes(clapI)) { clapDone.push(clapI); store.set('rd-echo-clap', clapDone); } sparkle(e.target, clapDone.length === CLAPS.length); clapI = Math.min(clapI + 1, CLAPS.length - 1); shown = false; renderEcho(); }
    else if (id === 'monoStage') { const m = store.get('rd-mono', { who: 'Bilbo', feel: 'afraid', st: 0 }); m.st = (m.st + 1) % STAGE.length; store.set('rd-mono', m); renderEcho(); }
    else if (id === 'twNext') { twI = (twI + 1) % TWIST.length; store.set('rd-tw', twI); const l = $('#twLine'); l.textContent = TWIST[twI]; l.classList.remove('flip'); void l.offsetWidth; l.classList.add('flip'); }
    const r = e.target.closest('[data-rung]'); if (r) { rung = +r.dataset.rung; store.set('rd-rung', rung); renderEcho(); }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'monoWho' || e.target.id === 'monoFeel') { const m = store.get('rd-mono', { who: 'Bilbo', feel: 'afraid', st: 0 }); m.who = $('#monoWho').value; m.feel = $('#monoFeel').value; store.set('rd-mono', m); renderEcho(); }
  });

  /* ================= THE MAPMAKER'S ATTIC ================= */
  const COLS = 'ABCDEFGH', SQ = 60, OX = 40;
  const FEAT = { inn: ['The inn', 'B2'], mill: ['The water-mill', 'D2'], bridge: ['The stone bridge', 'E3'], falls: ['The waterfall', 'G5'], stone: ['The standing stone', 'C5'], tower: ['The ruined tower', 'H2'], hives: ['The beehives', 'A4'], lake: ['The lake', 'F2'], wood: ['The old wood', 'A6'], orchard: ['The orchard', 'D1'], fold: ['The sheepfold', 'E5'] };
  const sqXY = ref => { const c = COLS.indexOf(ref[0]), r = +ref.slice(1); return [OX + (c + .5) * SQ, 360 - (r - .5) * SQ]; };
  const HUNT = [
    { q: 'What is in square D2?', a: 'mill', o: ['mill', 'bridge', 'inn', 'orchard'] },
    { q: 'Which square holds the waterfall?', a: 'G5' },
    { q: 'What is in square H2?', a: 'tower', o: ['tower', 'lake', 'falls', 'fold'] },
    { q: 'Which square holds the inn?', a: 'B2' },
    { q: 'What is in square A4?', a: 'hives', o: ['wood', 'hives', 'stone', 'orchard'] },
    { q: 'Which square holds the standing stone?', a: 'C5' },
    { q: 'Start at the stone bridge. Walk two squares north. What do you find?', a: 'fold', o: ['falls', 'fold', 'stone', 'tower'] },
    { q: 'Which square holds the lake?', a: 'F2' }
  ];
  let huntDone = store.get('rd-hunt-grid', []), measure = [];
  const PTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const PTN = { N: 'north', NNE: 'north-north-east', NE: 'north-east', ENE: 'east-north-east', E: 'east', ESE: 'east-south-east', SE: 'south-east', SSE: 'south-south-east', S: 'south', SSW: 'south-south-west', SW: 'south-west', WSW: 'west-south-west', W: 'west', WNW: 'west-north-west', NW: 'north-west', NNW: 'north-north-west' };
  let rose = { k: Math.floor(Math.random() * 8) * 2, opts: [], score: 0, n: 0 };
  function newRose() {
    const level = rose.n >= 5 ? 1 : 2;  // first five questions use the eight main points, then all sixteen
    rose.k = Math.floor(Math.random() * (16 / level)) * level;
    const pool = PTS.filter((_, i) => i !== rose.k && i % level === 0);
    rose.opts = RD.shuffle([PTS[rose.k], ...RD.shuffle(pool).slice(0, 3)]);
  }
  newRose();

  function mapSvg() {
    let s = `<defs><radialGradient id="atP" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#f6e8c4"/><stop offset="1" stop-color="#d6bb84"/></radialGradient></defs><rect x="0" y="0" width="520" height="400" fill="url(#atP)"/>`;
    // river: down the waterfall, under the stone bridge, past the mill and out of the valley
    s += `<path d="M430 0 L430 90 C430 120 380 128 370 150 C360 175 320 190 310 210 C300 232 262 250 250 270 C238 292 200 305 190 330 L182 360" stroke="#6aa0c0" stroke-width="10" fill="none" stroke-linecap="round" opacity=".85"/>`;
    s += `<ellipse cx="${sqXY('F2')[0]}" cy="${sqXY('F2')[1]}" rx="26" ry="18" fill="#7fb2cc" stroke="#4a7a94" stroke-width="1.5"/>`;
    s += `<path d="M130 270 L190 210 L370 210 L490 270" stroke="#8a5a2e" stroke-width="3" stroke-dasharray="7 5" fill="none"/>`;
    [[-14, -8], [8, -12], [-4, 8], [14, 6], [-18, 12]].forEach(([dx, dy]) => { const [x, y] = sqXY('A6'); s += `<circle cx="${x + dx}" cy="${y + dy}" r="9" fill="#55703c" stroke="#2a3a1c"/>`; });
    for (let i = 0; i < 9; i++) { const [x, y] = sqXY('D1'); s += `<circle cx="${x - 18 + (i % 3) * 18}" cy="${y - 14 + Math.floor(i / 3) * 14}" r="5" fill="#7d9450"/><circle cx="${x - 18 + (i % 3) * 18 + 2}" cy="${y - 16 + Math.floor(i / 3) * 14}" r="1.6" fill="#c23a2e"/>`; }
    const ic = { inn: 'M-12 8 V-4 L0 -14 L12 -4 V8Z', mill: 'M-10 8 V-8 H10 V8Z M0 -8 L0 -18 M-8 -14 L8 -22 M8 -14 L-8 -22', bridge: 'M-16 4 Q0 -12 16 4', falls: 'M-8 -14 V10 M0 -14 V12 M8 -14 V10', stone: 'M-5 10 L-4 -12 L5 -12 L6 10Z', tower: 'M-9 10 V-12 H-4 V-8 H0 V-14 H4 V-8 H9 V10Z', hives: 'M-14 8 Q-14 -6 -6 -6 Q2 -6 2 8Z M2 8 Q2 -4 9 -4 Q16 -4 16 8Z', fold: 'M-14 -8 H14 V10 H-14Z' };
    Object.entries(FEAT).forEach(([k, [nm, ref]]) => {
      const [x, y] = sqXY(ref); if (ic[k]) s += `<path d="${ic[k]}" transform="translate(${x} ${y})" fill="${k === 'bridge' || k === 'falls' ? 'none' : '#e9d6a8'}" stroke="#3e2f1c" stroke-width="2"/>`;
      s += `<text x="${x}" y="${y + 24}" text-anchor="middle" font-family="IM Fell English, serif" font-size="10.5" fill="#3e2f1c">${nm.replace('The ', '')}</text>`;
      s += `<circle class="feat" data-f="${k}" cx="${x}" cy="${y}" r="22" fill="${measure.includes(k) ? 'rgba(162,79,38,.25)' : 'transparent'}" stroke="${measure.includes(k) ? '#a24f26' : 'none'}" stroke-width="2"><title>${nm}, square ${ref}</title></circle>`;
    });
    if (measure.length === 2) { const [a, b] = measure.map(k => sqXY(FEAT[k][1])); s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#a24f26" stroke-width="2.5" stroke-dasharray="6 4"/>`; }
    for (let c = 0; c <= 8; c++) s += `<line x1="${OX + c * SQ}" y1="0" x2="${OX + c * SQ}" y2="360" stroke="#5a4630" stroke-width=".8" opacity=".55"/>`;
    for (let r = 0; r <= 6; r++) s += `<line x1="${OX}" y1="${r * SQ}" x2="${OX + 8 * SQ}" y2="${r * SQ}" stroke="#5a4630" stroke-width=".8" opacity=".55"/>`;
    for (let c = 0; c < 8; c++) s += `<text x="${OX + (c + .5) * SQ}" y="384" text-anchor="middle" font-family="IM Fell English, serif" font-size="18" fill="#a24f26">${COLS[c]}</text>`;
    for (let r = 1; r <= 6; r++) s += `<text x="20" y="${366 - (r - .5) * SQ}" text-anchor="middle" font-family="IM Fell English, serif" font-size="18" fill="#a24f26">${r}</text>`;
    s += `<g transform="translate(494 28)"><circle r="16" fill="#f6e8c4" stroke="#5a4630"/><path d="M0 -14 L4 0 L0 14 L-4 0Z" fill="#a24f26"/><text y="-19" text-anchor="middle" font-size="11" font-family="IM Fell English, serif" fill="#3e2f1c">N</text></g>`;
    return s;
  }
  function renderAtticLock() {
    const lock = $('#atticLock'); if (!lock) return;
    const have = LS.keys.length;
    lock.innerHTML = `<span class="label">The four-keyhole door</span><h3>A low door at the top of a ladder, with four keyholes in a row</h3>
      <div class="keyholes">${[0, 1, 2, 3].map(i => `<span class="kh${i < have ? ' on' : ''}">${i < have ? keySvg(KEYS.find(k => k.id === LS.keys[i]).col, true) : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="4" fill="#1a120a"/><path d="M10 12 L9 20 L15 20 L14 12Z" fill="#1a120a"/></svg>'}</span>`).join('')}</div>
      <p>Any four lore keys will turn these locks. You are carrying <b>${have}</b>. ${have < 4 ? 'Find more in the other secret rooms, then climb back up.' : ''}</p>`;
  }
  function renderAttic() {
    const inner = $('#atticInner'); if (!inner) return;
    const hd = huntDone.length, best = store.get('rd-rose-best', 0);
    let dist = '';
    if (measure.length === 2) {
      const [a, b] = measure.map(k => FEAT[k][1]); const dc = Math.abs(COLS.indexOf(a[0]) - COLS.indexOf(b[0])), dr = Math.abs(+a.slice(1) - +b.slice(1));
      const sq = Math.hypot(dc, dr), mi = sq * 5;
      dist = `From <b>${FEAT[measure[0]][0].toLowerCase()}</b> to <b>${FEAT[measure[1]][0].toLowerCase()}</b> is ${dc} square${dc === 1 ? '' : 's'} across and ${dr} up or down. As the crow flies that is about <b>${f1(sq)}</b> squares, or <b>${Math.round(mi)} miles</b>. Walking at 3 miles an hour, it would take about <b>${f1(mi / 3)} hours</b>.`;
    } else dist = measure.length ? 'Now tap a second place on the map.' : 'Tap any two places on the map to measure between them.';
    inner.innerHTML = `
      <div class="board"><div class="row between"><span class="label">The grid-reference hunt</span><span class="score">${hd} of ${HUNT.length} found${hd === HUNT.length ? ' · Compass Key earned' : ''}</span></div>
        <h3>Read the grid like a mapmaker</h3>
        <p>To name a square, read the letter along the bottom first, then the number up the side. A handy saying: <i>along the corridor, then up the stairs</i>.</p>
        <div class="atlas"><svg viewBox="0 0 520 400" role="img" aria-label="A grid map of an invented valley with a river, a lake, an inn, a mill, a bridge, a waterfall, a standing stone, a ruined tower, beehives, an old wood, an orchard and a sheepfold">${mapSvg()}</svg></div>
        <div class="hunt-qs">${HUNT.map((h, i) => { const ok = huntDone.includes(i); return `<div class="hq${ok ? ' done' : ''}"><span class="act-n">${i + 1}</span><p>${h.q}</p>${ok ? `<b class="score">${h.o ? FEAT[h.a][0] : h.a}</b>` : h.o ? `<div class="row">${h.o.map(o => `<button class="pill" data-hq="${i}" data-v="${o}">${FEAT[o][0].replace('The ', '')}</button>`).join('')}</div>` : `<div class="row"><input data-hqi="${i}" placeholder="e.g. A1" maxlength="3" style="width:90px" aria-label="Grid square for question ${i + 1}"><button class="btn small" data-hqb="${i}">Check</button></div>`}</div>`; }).join('')}</div></div>

      <div class="board"><span class="label">Measuring the road</span><h3>Each square is 5 miles across</h3><p aria-live="polite">${dist}</p>
        <div class="row"><button class="btn small" id="measClear">Clear the ruler</button></div>
        <p class="note">Older explorers: the straight-line distance uses Pythagoras. Square the squares across, add the squares up, then take the square root. Roads are never straight, so a real journey is always longer.</p></div>

      <div class="board"><div class="row between"><span class="label">The compass rose</span><span class="score">This round: ${rose.score} of ${rose.n} · best ${best} of 10</span></div>
        <h3>Which way is the needle pointing?</h3>
        <div class="rose-wrap"><svg viewBox="-110 -110 220 220" class="rose" aria-hidden="true"><circle r="100" fill="#f6e8c4" stroke="#5a4630" stroke-width="2"/>${PTS.map((p, i) => { const a = i * 22.5 * Math.PI / 180; const r = i % 2 ? 76 : 86; return `<text x="${f1(Math.sin(a) * r)}" y="${f1(-Math.cos(a) * r + 4)}" text-anchor="middle" font-family="IM Fell English, serif" font-size="${i % 4 === 0 ? 15 : i % 2 ? 0 : 11}" fill="#3e2f1c">${i % 4 === 0 ? p : ''}</text><line x1="${f1(Math.sin(a) * 92)}" y1="${f1(-Math.cos(a) * 92)}" x2="${f1(Math.sin(a) * (i % 2 ? 96 : 99))}" y2="${f1(-Math.cos(a) * (i % 2 ? 96 : 99))}" stroke="#5a4630"/>`; }).join('')}<g class="needle" style="transform:rotate(${rose.k * 22.5}deg)"><path d="M0 -70 L8 0 L0 12 L-8 0Z" fill="#a24f26"/><circle r="5" fill="#3e2f1c"/></g></svg>
          <div class="rose-opts">${rose.n >= 10 ? `<p class="big-num">${rose.score} of 10</p><button class="btn solid" id="roseAgain">Play again</button>` : rose.opts.map(o => `<button class="opt" data-rose="${o}">${PTN[o]} <small>(${o})</small></button>`).join('')}<p class="feedback" id="roseFb" aria-live="polite"></p></div></div>
        <p class="note">The first five questions use the eight main points. After that, all sixteen.</p></div>`;
  }
  function checkHunt(i, v, btn) {
    const ok = String(v).trim().toUpperCase() === HUNT[i].a.toUpperCase();
    if (ok) { if (!huntDone.includes(i)) huntDone.push(i); store.set('rd-hunt-grid', huntDone); sparkle(btn, huntDone.length === HUNT.length); if (huntDone.length === HUNT.length) earnKey('compass'); renderAttic(); }
    else { btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake'); }
  }
  document.addEventListener('click', e => {
    const f = e.target.closest('#atticInner .feat'); if (f) { const k = f.dataset.f; measure = measure.length >= 2 ? [k] : measure.includes(k) ? measure : measure.concat(k); renderAttic(); return; }
    const b = e.target.closest('[data-hq]'); if (b) { checkHunt(+b.dataset.hq, b.dataset.v === HUNT[+b.dataset.hq].a ? HUNT[+b.dataset.hq].a : '_', b); return; }
    const c = e.target.closest('[data-hqb]'); if (c) { const i = +c.dataset.hqb; checkHunt(i, document.querySelector(`[data-hqi="${i}"]`).value, c); return; }
    if (e.target.id === 'measClear') { measure = []; renderAttic(); return; }
    const r = e.target.closest('[data-rose]'); if (r) {
      const ok = r.dataset.rose === PTS[rose.k]; rose.n++; if (ok) rose.score++;
      if (rose.n >= 10) { store.set('rd-rose-best', Math.max(store.get('rd-rose-best', 0), rose.score)); renderAttic(); return; }
      const msg = ok ? 'Yes! ' + PTN[PTS[rose.k]] + '.' : 'Not quite. It was ' + PTN[PTS[rose.k]] + '.';
      newRose(); renderAttic(); const fb = $('#roseFb'); fb.textContent = msg; fb.style.color = ok ? 'var(--good)' : 'var(--bad)'; return;
    }
    if (e.target.id === 'roseAgain') { rose = { score: 0, n: 0 }; newRose(); renderAttic(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.hqi != null) document.querySelector(`[data-hqb="${e.target.dataset.hqi}"]`).click(); });

  /* ================= THE LAST-LIGHT DOOR ================= */
  const REFLECT = ['Which chapter would you most like to hear again, and why?', 'Which character changed the most from the beginning to the end?', 'What is one thing you made or did during this study that you are proud of?', 'If you could ask the author one question, what would it be?', 'What does "there and back again" mean to you now, after the whole journey?'];
  function renderLastLock() {
    const lock = $('#lastlightLock'); if (!lock) return;
    lock.innerHTML = `<span class="label">The last door</span><h3>Smooth grey stone, with a keyhole for every key under the hill</h3>
      <div class="keyholes wide">${KEYS.map(k => `<span class="kh${LS.keys.includes(k.id) ? ' on' : ''}" title="${LS.keys.includes(k.id) ? k.name : 'An empty keyhole'}">${keySvg(k.col, LS.keys.includes(k.id))}</span>`).join('')}</div>
      <p>You carry <b>${LS.keys.length}</b> of ${KEYS.length} keys. When every keyhole is filled, the last light of day will show you the way in. Your satchel has hints for the keys still missing.</p>`;
  }
  function renderLast() {
    const inner = $('#lastlightInner'); if (!inner) return;
    const S = RD.study, refl = store.get('rd-ll-reflect', {});
    const read = RD.read.length, done = S ? S.totalDone() : 0, total = S ? S.totalActs() : 0;
    const bySubj = S ? S.SUBJ.map(s => { let n = 0, m = 0; chapters.forEach((_, ch) => { n += S.countFor(ch, s); m += S.actsFor(ch, s).length; }); return [s, n, m]; }) : [];
    const allRead = read >= chapters.length;
    inner.innerHTML = `
      <div class="board"><span class="label">Your journey book</span><h3>Everything your family has done under the hill</h3>
        <div class="tally-row"><div><b class="big-num">${read}</b><span>of ${chapters.length} chapters read</span></div><div><b class="big-num">${done}</b><span>of ${total.toLocaleString()} activities</span></div><div><b class="big-num">${LS.visited.filter(x => RD.POS[x] && x !== 'home').length}</b><span>rooms explored</span></div><div><b class="big-num">${LS.curios.length}</b><span>curios found</span></div></div>
        <div class="vbars">${bySubj.map(([s, n, m]) => `<div class="vbar"><span>${esc(RD.SHORT[s])}</span><div class="bar"><i style="width:${m ? n / m * 100 : 0}%"></i></div><span>${n}</span></div>`).join('')}</div>
        <div class="row"><button class="btn solid" id="bookPrint">Print the journey book</button><span class="note">It gathers your notebook pages, reflections, riddle and journal into one keepsake.</span></div></div>
      <div class="board"><span class="label">Last-light reflections</span><h3>Talk these over, then write your answers</h3>
        ${REFLECT.map((q, i) => `<label class="refl"><span>${i + 1}. ${q}</span><textarea data-rf="${i}" rows="2" placeholder="Write or dictate…">${esc(refl[i] || '')}</textarea></label>`).join('')}<span class="saved" id="reflSaved"></span></div>
      <div class="board"><span class="label">There and back again</span>${allRead ? `<div class="cert"><span class="label">Be it known</span><h2>There and Back Again</h2><p>This scroll is given to</p><input id="tbaName" value="${esc(store.get('rd-tba', ''))}" placeholder="Write your names" aria-label="Your names"><p>who read all nineteen chapters aloud, from the round door to the mountain and home again.</p><p class="note">Sealed on ${new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p></div><div class="row no-print"><button class="btn solid" id="tbaPrint">Print the scroll</button></div>` : `<p>This scroll appears when all nineteen chapters are marked as read in the Hall. You have read <b>${read}</b>.</p>`}</div>`;
  }
  function journeyBook() {
    const nb = store.get('rd-nb', {}), refl = store.get('rd-ll-reflect', {}), fields = [['happened', 'What happened'], ['words', 'New words'], ['moment', 'Favourite moment'], ['wonder', 'I wonder']];
    let h = `<h1>Our Journey Book</h1><p class="pp-sum">The Round Door Hobbit Study · ${RD.read.length} of 19 chapters read · ${RD.study ? RD.study.totalDone() : 0} activities done · ${LS.keys.length} keys and ${LS.curios.length} curios found</p>`;
    chapters.forEach((c, i) => { const p = nb[i]; if (!p || !Object.values(p).some(Boolean)) return; h += `<h2>Chapter ${i + 1}: ${esc(c[0])}</h2>` + fields.filter(([k]) => p[k]).map(([k, l]) => `<h3>${l}</h3><p>${esc(p[k]).replace(/\n/g, '<br>')}</p>`).join(''); });
    if (Object.values(refl).some(Boolean)) h += `<h2>Last-light reflections</h2>` + REFLECT.map((q, i) => refl[i] ? `<h3>${q}</h3><p>${esc(refl[i])}</p>` : '').join('');
    const rid = store.get('rd-myriddle', ''), cj = store.get('rd-cj', ''), rn = store.get('rd-rune', '');
    if (rid) h += `<h2>A riddle we carved</h2><p>${esc(rid).replace(/\n/g, '<br>')}</p>`;
    if (cj) h += `<h2>From the reflection journal</h2><p>${esc(cj).replace(/\n/g, '<br>')}</p>`;
    if (rn) h += `<h2>In runes</h2><p style="font-family:'Noto Sans Runic',serif;font-size:18pt">${esc(RD.toRunes(rn))}</p><p>${esc(rn)}</p>`;
    h += `<p class="pp-foot">Made under the hill at the Round Door Hobbit Study.</p>`;
    let sheet = $('#printSheet'); if (!sheet) { sheet = el('div', { id: 'printSheet' }); document.body.appendChild(sheet); }
    sheet.innerHTML = h; document.body.classList.add('printing');
    const off = () => { document.body.classList.remove('printing'); removeEventListener('afterprint', off); }; addEventListener('afterprint', off);
    try { window.print() } catch (e) { }
    setTimeout(() => { if (!matchMedia('print').matches) off(); }, 1500);
  }
  let rfT;
  document.addEventListener('input', e => {
    const i = e.target.dataset && e.target.dataset.rf; if (i != null) { const r = store.get('rd-ll-reflect', {}); r[i] = e.target.value; clearTimeout(rfT); rfT = setTimeout(() => { store.set('rd-ll-reflect', r); const s = $('#reflSaved'); if (s) { s.textContent = 'Saved ✓'; setTimeout(() => s.textContent = '', 1500); } }, 400); }
    if (e.target.id === 'tbaName') store.set('rd-tba', e.target.value);
  });
  document.addEventListener('click', e => {
    if (e.target.id === 'bookPrint') journeyBook();
    if (e.target.id === 'tbaPrint') { document.body.classList.remove('printing'); try { window.print() } catch (_) { } }
  });

  /* ================= wiring ================= */
  function renderAll() { renderCellar(); renderEcho(); renderAtticLock(); renderAttic(); renderLastLock(); renderLast(); }
  renderAll();
  document.addEventListener('rd:key', () => { renderAtticLock(); renderLastLock(); renderLast(); });
  document.addEventListener('rd:room', e => {
    const id = e.detail.id;
    if (id === 'lastlight') renderLast();
    if (id === 'echo') renderEcho();
    if (id === 'attic') { renderAtticLock(); renderAttic(); }
    if (id === 'lastlight' && e.detail.first && RD.isOpen('lastlight') && !reduce) for (let k = 0; k < 6; k++) setTimeout(() => spawn(Math.random() * innerWidth, -10, 14, 2, 90, GOLD, .12), k * 180);
  });
  document.addEventListener('rd:chap', () => setTimeout(renderEcho, 0));
})();
