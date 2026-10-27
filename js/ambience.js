/* The Round Door Hobbit Study · sounds of the hill, candlelight and a carried lantern
   Every sound is made live in the browser with the Web Audio API: no recordings, nothing to download.
   Each room has its own mix (hearth, wind, water, cave drips, birds, crickets, chimes …) and the mix
   crossfades as you walk from room to room. Sound is off until someone turns it on, and the choice is remembered. */
(function () {
  const RD = window.RD; if (!RD) return;
  const { store, $, el } = RD;

  /* ---------------- room mixes ---------------- */
  const MIX = {
    home: { hearth: .8 }, narration: { hearth: 1 }, cooking: { hearth: .7, kettle: .25 }, drama: { hearth: .35, cave: .2 }, notebook: { hearth: .5, tick: .35 },
    literature: { lap: .55, drips: .8, cave: .5 }, vault: { drips: 1, cave: .6 }, cellar: { drips: .45, cave: .5, hearth: .12 },
    geography: { wind: .55, birds: .45 }, history: { wind: 1, cave: .15 }, art: { wind: .35, birds: .7 }, science: { wind: .3, birds: .9, stream: .45 },
    outdoor: { stream: .7, birds: .8, wind: .3 }, character: { crickets: .7, wind: .3 }, moon: { wind: .3, chimes: .8, crickets: .3 },
    math: { cave: .6, coins: .55, drips: .2 }, treasury: { cave: .6, coins: .9 }, echo: { cave: .5, whispers: .5, drips: .3 },
    attic: { wind: .6, tick: .35, birds: .2 }, lastlight: { wind: .5, thrush: .85 }
  };

  let ac = null, master = null, verb = null, white = null, brown = null;
  const live = {};          // name -> {g, stop}
  let soundOn = store.get('rd-sound', false), vol = store.get('rd-vol', .7), room = RD.curRoom, armed = false;

  function setup() {
    if (ac) return true;
    ac = RD.actx(); if (!ac) return false;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.connect(ac.destination);
    master = ac.createGain(); master.gain.value = 0; master.connect(comp);
    // a soft cave reverb made from decaying noise
    verb = ac.createConvolver(); const len = ac.sampleRate * 2.8, ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb.buffer = ir; const vg = ac.createGain(); vg.gain.value = .55; verb.connect(vg); vg.connect(master);
    const n = ac.sampleRate * 4; white = ac.createBuffer(1, n, ac.sampleRate); brown = ac.createBuffer(1, n, ac.sampleRate);
    const w = white.getChannelData(0), b = brown.getChannelData(0); let last = 0;
    for (let i = 0; i < n; i++) { w[i] = Math.random() * 2 - 1; last = (last + .02 * w[i]) / 1.02; b[i] = last * 3.2; }
    return true;
  }
  const noise = (buf) => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = Math.random(); s.start(0, Math.random() * 3); return s; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  function loop(alive, fn, min, max) { const t = () => { if (!alive.v) return; fn(); setTimeout(t, rnd(min, max)); }; setTimeout(t, rnd(min * .3, max)); }
  function ping(dest, f, dur, peak, type = 'sine', bend = 1, wet = 0, pan = 0) {
    const t = ac.currentTime + .01, o = ac.createOscillator(), g = ac.createGain(); o.type = type;
    o.frequency.setValueAtTime(f, t); if (bend !== 1) o.frequency.exponentialRampToValueAtTime(f * bend, t + Math.min(dur, .09));
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    let out = g; if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; }
    o.connect(g); out.connect(dest); if (wet) { const s = ac.createGain(); s.gain.value = wet; out.connect(s); s.connect(verb); }
    o.start(t); o.stop(t + dur + .05);
  }

  /* ---------------- the layers ---------------- */
  const LAYERS = {
    hearth(g, alive) {
      const s = noise(brown), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 460; const lg = ac.createGain(); lg.gain.value = .55; s.connect(lp); lp.connect(lg); lg.connect(g);
      loop(alive, () => {
        const l2 = Math.floor(ac.sampleRate * rnd(.006, .035)), b2 = ac.createBuffer(1, l2, ac.sampleRate), c = b2.getChannelData(0);
        for (let i = 0; i < l2; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / l2, 3);
        const n = ac.createBufferSource(); n.buffer = b2; const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = rnd(900, 3500); const gg = ac.createGain(); gg.gain.value = rnd(.04, .2) * (Math.random() < .12 ? 2.4 : 1);
        n.connect(hp); hp.connect(gg); gg.connect(g); n.start();
      }, 40, 420);
      return () => { try { s.stop() } catch (e) { } };
    },
    wind(g, alive) {
      const s = noise(white), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = .7; const wg = ac.createGain(); wg.gain.value = .25;
      s.connect(bp); bp.connect(wg); wg.connect(g);
      loop(alive, () => { const t = ac.currentTime; bp.frequency.setTargetAtTime(rnd(260, 820), t, rnd(1, 3)); wg.gain.setTargetAtTime(rnd(.08, .42), t, rnd(.8, 2.5)); }, 1500, 4200);
      return () => { try { s.stop() } catch (e) { } };
    },
    stream(g, alive) {
      const s = noise(white), hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500; const sg = ac.createGain(); sg.gain.value = .06; s.connect(hp); hp.connect(sg); sg.connect(g);
      const bands = [0, 1, 2].map(() => { const b = ac.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = 4; b.frequency.value = rnd(600, 2400); const bg = ac.createGain(); bg.gain.value = .11; s.connect(b); b.connect(bg); bg.connect(g); return b; });
      loop(alive, () => { const t = ac.currentTime; bands.forEach(b => b.frequency.setTargetAtTime(rnd(500, 2800), t, .05)); }, 90, 260);
      return () => { try { s.stop() } catch (e) { } };
    },
    lap(g, alive) {
      const s = noise(brown), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 340; const lg = ac.createGain(); lg.gain.value = .1; s.connect(lp); lp.connect(lg); lg.connect(g);
      loop(alive, () => { const t = ac.currentTime; lg.gain.setTargetAtTime(.32, t, .5); lg.gain.setTargetAtTime(.06, t + 1.4, 1); }, 3500, 6500);
      return () => { try { s.stop() } catch (e) { } };
    },
    cave(g) {
      const s = noise(brown), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 130; const cg = ac.createGain(); cg.gain.value = .7; s.connect(lp); lp.connect(cg); cg.connect(g);
      const o = ac.createOscillator(); o.frequency.value = 55; const og = ac.createGain(); og.gain.value = .018; o.connect(og); og.connect(g); o.start();
      return () => { try { s.stop(); o.stop() } catch (e) { } };
    },
    drips(g, alive) { loop(alive, () => ping(g, rnd(1300, 2600), rnd(.08, .16), rnd(.05, .14), 'sine', .58, .9, rnd(-.7, .7)), 500, 2400); },
    birds(g, alive) {
      loop(alive, () => {
        const base = rnd(2200, 3600), notes = Math.floor(rnd(3, 7)), pan = rnd(-.8, .8); let t = 0;
        for (let i = 0; i < notes; i++) { const f = base * rnd(.8, 1.35); setTimeout(() => ping(g, f, rnd(.05, .12), rnd(.02, .05), 'sine', rnd(.75, 1.4), .15, pan), t); t += rnd(70, 150); }
      }, 2300, 7000);
    },
    thrush(g, alive) {
      loop(alive, () => {
        const base = rnd(2000, 3200), phrase = Array.from({ length: Math.floor(rnd(2, 5)) }, () => [base * rnd(.8, 1.4), rnd(.05, .11), rnd(.7, 1.4)]);
        const pan = rnd(-.4, .4);
        [0, 1].forEach(rep => phrase.forEach(([f, d, b], i) => setTimeout(() => ping(g, f, d, .05, 'sine', b, .2, pan), rep * (phrase.length * 130 + 260) + i * 130)));
      }, 3000, 6500);
    },
    crickets(g, alive) {
      [[4300, -.5, 380], [4700, .5, 520]].forEach(([f, pan, gap]) => loop(alive, () => { for (let i = 0; i < 3; i++) setTimeout(() => ping(g, f, .028, .02, 'sine', 1, 0, pan), i * 42); }, gap, gap + 160));
    },
    chimes(g, alive) {
      const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
      loop(alive, () => { const f = scale[Math.floor(Math.random() * scale.length)]; ping(g, f, 3.2, .05, 'sine', 1, .8, rnd(-.6, .6)); ping(g, f * 2.76, 1.4, .012, 'sine', 1, .8); }, 3500, 8500);
    },
    coins(g, alive) {
      loop(alive, () => { const n = Math.floor(rnd(1, 4)); for (let i = 0; i < n; i++) setTimeout(() => { [3150, 4720, 6380].forEach(f => ping(g, f * rnd(.96, 1.04), rnd(.2, .45), .018, 'sine', 1, .7, rnd(-.6, .6))); }, i * rnd(90, 160)); }, 5000, 12000);
    },
    tick(g, alive) {
      let tock = false;
      loop(alive, () => { tock = !tock; ping(g, tock ? 1900 : 2300, .03, .03, 'triangle', .5, .1); }, 1000, 1001);
    },
    kettle(g, alive) {
      loop(alive, () => { const s = noise(white), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = rnd(2400, 3000); bp.Q.value = 18; const kg = ac.createGain(); const t = ac.currentTime; kg.gain.setValueAtTime(0, t); kg.gain.linearRampToValueAtTime(.05, t + 2); kg.gain.linearRampToValueAtTime(0, t + 4.5); s.connect(bp); bp.connect(kg); kg.connect(g); setTimeout(() => { try { s.stop() } catch (e) { } }, 4800); }, 14000, 26000);
    },
    whispers(g, alive) {
      loop(alive, () => { const s = noise(white), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = rnd(1400, 2600); bp.Q.value = 2.5; const wg = ac.createGain(), t = ac.currentTime, d = rnd(.5, 1.2);
        wg.gain.setValueAtTime(0, t); for (let k = 0; k < 4; k++) { wg.gain.linearRampToValueAtTime(rnd(.02, .07), t + d * (k + .5) / 4); wg.gain.linearRampToValueAtTime(.005, t + d * (k + 1) / 4); }
        const p = ac.createStereoPanner ? ac.createStereoPanner() : ac.createGain(); if (p.pan) p.pan.value = rnd(-.9, .9);
        s.connect(bp); bp.connect(wg); wg.connect(p); p.connect(verb); setTimeout(() => { try { s.stop() } catch (e) { } }, d * 1000 + 200); }, 4000, 9000);
    }
  };

  function startLayer(name) {
    if (live[name]) return live[name];
    const g = ac.createGain(); g.gain.value = 0; g.connect(master);
    const alive = { v: true }; const stopFn = LAYERS[name](g, alive);
    live[name] = { g, stop() { alive.v = false; stopFn && stopFn(); setTimeout(() => { try { g.disconnect() } catch (e) { } }, 200); } };
    return live[name];
  }
  function applyRoom(id) {
    room = id; if (!ac || !soundOn) return;
    const mix = MIX[id] || MIX.home, t = ac.currentTime;
    Object.keys(live).forEach(n => { if (!(n in mix)) { const L = live[n]; L.g.gain.cancelScheduledValues(t); L.g.gain.setTargetAtTime(0, t, .5); setTimeout(() => { if (live[n] === L && !((MIX[room] || {})[n])) { L.stop(); delete live[n]; } }, 3000); } });
    Object.entries(mix).forEach(([n, lv]) => { const L = startLayer(n); L.g.gain.cancelScheduledValues(t); L.g.gain.setTargetAtTime(lv, t, .7); });
  }
  function setSound(on) {
    soundOn = on; store.set('rd-sound', on); btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('span').textContent = on ? 'Sounds of the hill' : 'Sounds off';
    if (on) {
      if (!setup()) return; if (ac.state === 'suspended') ac.resume();
      master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(vol, ac.currentTime, .6); applyRoom(room);
    } else if (ac) {
      master.gain.setTargetAtTime(0, ac.currentTime, .3);
      setTimeout(() => { if (!soundOn) { Object.keys(live).forEach(n => { live[n].stop(); delete live[n]; }); } }, 1500);
    }
  }

  /* ---------------- the dock button and lamp-shelf settings ---------------- */
  const { dock, menu } = RD.dock();
  const btn = el('button', { class: 'amb', id: 'soundBtn', 'aria-pressed': 'false', title: 'Turn the sounds of the hill on or off' },
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fl" d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3-1-5 1-8z" fill="#e98a3a"/><path d="M12 12c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1.5 1-2.5 2-3.5 0 1 .5 1.5 1 1.5 0-1.5-.5-2 0-3z" fill="#ffd36e"/></svg><span>Sounds off</span>');
  dock.insertBefore(btn, $('#shelfBtn'));
  btn.onclick = () => setSound(!soundOn);
  const volRow = el('label', { class: 'shelf-row vol' }, `<span>Volume</span><input type="range" id="setVol" min="0" max="1" step=".05" value="${vol}">`);
  menu.insertBefore(volRow, menu.children[1]);
  volRow.querySelector('input').oninput = e => { vol = +e.target.value; store.set('rd-vol', vol); if (ac && soundOn) master.gain.setTargetAtTime(vol, ac.currentTime, .1); };

  // a remembered "on" can only start after the first tap or key press (browsers insist)
  if (soundOn) {
    btn.setAttribute('aria-pressed', 'true'); btn.querySelector('span').textContent = 'Sounds of the hill';
    const arm = () => { if (armed) return; armed = true; setSound(true); removeEventListener('pointerdown', arm); removeEventListener('keydown', arm); };
    addEventListener('pointerdown', arm); addEventListener('keydown', arm);
  }
  document.addEventListener('rd:room', e => applyRoom(e.detail.id));
  document.addEventListener('visibilitychange', () => { if (!ac || !soundOn) return; document.hidden ? ac.suspend() : ac.resume(); });

  /* ---------------- candlelight and a carried lantern ---------------- */
  const candle = el('div', { id: 'candlelight', 'aria-hidden': 'true' }); document.body.appendChild(candle);
  const lantern = el('div', { id: 'lanternlight', 'aria-hidden': 'true' }); document.body.appendChild(lantern);
  let candleOn = store.get('rd-candle', true), lanternOn = store.get('rd-lantern', false);
  candle.hidden = !candleOn; document.body.classList.toggle('lantern-on', lanternOn);
  let lx = innerWidth / 2, ly = innerHeight / 2, raf = 0;
  const moveLamp = (x, y) => { lx = x; ly = y; if (!raf) raf = requestAnimationFrame(() => { raf = 0; lantern.style.setProperty('--lx', lx + 'px'); lantern.style.setProperty('--ly', ly + 'px'); }); };
  addEventListener('pointermove', e => { if (lanternOn) moveLamp(e.clientX, e.clientY); }, { passive: true });
  addEventListener('pointerdown', e => { if (lanternOn) moveLamp(e.clientX, e.clientY); }, { passive: true });
  RD.shelfToggle('setCandle', 'Candlelight around the edges', candleOn, v => { candleOn = v; store.set('rd-candle', v); candle.hidden = !v; });
  RD.shelfToggle('setLantern', 'Carry a lantern (darkens the room around it)', lanternOn, v => { lanternOn = v; store.set('rd-lantern', v); document.body.classList.toggle('lantern-on', v); });

  RD.ambience = { setSound, applyRoom, MIX };
})();
