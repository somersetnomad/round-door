/* The Round Door Hobbit Study · the Lamplighter
   An original in-world narrator who walks ahead of the children with a lantern, greeting each room,
   noticing keys and progress, and hinting at secrets. Can read aloud using the browser's own voices.
   Also builds the "lamp-shelf": the settings dock in the bottom-right corner, shared with ambience.js. */
(function () {
  const RD = window.RD; if (!RD) return;
  const { store, $, el, chapters, SHORT, isOpen, isSecret, KEYS, LS } = RD;

  /* ---------------- the lamp-shelf dock (sound + narrator settings) ---------------- */
  RD.dock = function () {
    let dock = $('#ambDock');
    if (dock) return { dock, menu: $('#shelfMenu') };
    dock = el('div', { class: 'amb-dock', id: 'ambDock' });
    dock.innerHTML = `<div class="shelf-menu" id="shelfMenu" hidden role="dialog" aria-label="Lamp-shelf settings"><span class="label">The lamp-shelf</span></div>
      <button class="amb shelf-btn" id="shelfBtn" aria-expanded="false" aria-controls="shelfMenu" title="Settings for sound, narrator and light"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="6" height="11" rx="1.5" fill="#efe2c4" stroke="#5e3d1f" stroke-width="1.2"/><path class="fl" d="M12 9 c-3 -3 -1 -6 0 -7 c2 2 3 5 0 7z" fill="#ffb347"/><path d="M6 21h12" stroke="#5e3d1f" stroke-width="1.6"/></svg><span class="sr">Lamp-shelf settings</span></button>`;
    document.body.appendChild(dock);
    const btn = $('#shelfBtn'), menu = $('#shelfMenu');
    btn.onclick = () => { const open = menu.hidden; menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
    document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('#ambDock')) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); } });
    return { dock, menu };
  };
  RD.shelfToggle = function (id, label, on, onChange) {
    const { menu } = RD.dock();
    const row = el('label', { class: 'shelf-row' }, `<input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span>${label}</span>`);
    menu.appendChild(row);
    row.querySelector('input').onchange = e => onChange(e.target.checked);
    return row;
  };

  /* ---------------- what the Lamplighter says ---------------- */
  const L = {
    home: {
      first: "Ah, there you are. I'm the Lamplighter. I keep the lamps lit in the passages under this hill, and I'll walk a little ahead of you with mine. Read a chapter together first, then choose any door you like. There's no wrong way through.",
      again: ["Back in the Hall. Mark the chapter you've just read on the little circles, and the whole labyrinth will know how far you've come.", "The ledger on this wall shows every chapter and every room. The dark squares are work done. The pale ones are still waiting for you.", "Wipe your feet, hang up your hood, and choose a passage. I'll have the lamp ready."]
    },
    narration: {
      first: "This is the Hearth Room, the warmest room under the hill. Every telling begins here. Sit close to the fire, tell the chapter back in your own words, and then talk it over. The questions here have no wrong answers.",
      again: ["Pull up a chair. Which chapter did you read today? Choose it from the little circles and I'll find the right scroll.", "The quests on this wall join the rooms together. Each one takes a few days, and each one needs more than one pair of hands.", "Before anything else, tell it back. Even a muddled telling is better than none. That's how stories stick."]
    },
    literature: {
      first: "Mind your step. This is the Lake Cave, cold and very quiet. The water here is black, and something once played a game of riddles beside it. Words matter in this room. Choose them carefully.",
      again: ["Listen to that drip. Every word in this room is a little like a stone dropped in still water: the ripples go further than you'd think.", "Riddles, old words and the storyteller's tricks are kept in this cave. Pick one thing to notice in the chapter you just read.", "Somewhere beyond this cave there's a door that only opens to an answer. I won't tell you where. I'll only say: look past the water."]
    },
    geography: {
      first: "Welcome to the Map Room. Every road on these walls runs east, over the mountains, through the forest and across the long lake. Tap the places as your family reaches them, and watch the gold trail grow.",
      again: ["A good traveller always knows which way is east. Do you?", "The road on this map is long. You don't have to walk it all at once. A chapter at a time is plenty.", "There's a ladder in this room that leads up to an attic. Its door is fussy, though. It wants four keys before it'll let anyone up."]
    },
    history: {
      first: "This is the Old Hall of Kings. It's draughty, I'm afraid, and full of long memories. Every story has another story behind it, and this is the room where we go looking for it.",
      again: ["Old halls like this one remember things that people forget. What happened before the chapter you just read?", "Somewhere behind these pillars is the deepest door of all. It has a keyhole for every key under the hill.", "History is just stories that really happened. Ask an older person in your family for one this week."]
    },
    science: {
      first: "Here's the Root Garden, where the hill's roots come down through the ceiling and the light comes in green. Everything here is about looking closely: creatures, moons, mosses and how things really work.",
      again: ["Stories borrow from real animals all the time. Spiders, ravens, thrushes, bears. Which creature is in your chapter?", "Do one experiment today, and write down what you guessed before you started. A scientist's best tool is a good guess.", "If you're quiet, you can hear the roots drinking. Or perhaps that's me."]
    },
    math: {
      first: "This is the Counting House. Don't touch the gold, it's been counted twice already. Here we share out treasure, measure roads and solve puzzles. Everything adds up eventually.",
      again: ["A fair share is harder to work out than you'd think. Ask any dwarf.", "Numbers are just a careful way of telling the truth. What can you count in today's chapter?", "There's a lock beyond this room carved with runes instead of numbers. You'll need the rune key from the Painted Room."]
    },
    art: {
      first: "This is the Painted Room. Mind the wet paint. Here you can write in runes, paint maps, and make music the way the dwarves do. There's a secret in one of the maps here that only moonlight shows.",
      again: ["An artist and a mapmaker both start the same way: by looking very closely.", "Make something with your hands today. It doesn't have to be good. It has to be yours.", "Try your name in runes. Then try a secret message, and see if anyone at home can read it."]
    },
    cooking: {
      first: "The Kitchen! The best-smelling room under the hill. Hobbits take their meals seriously, and so do I. Here you'll bake, pack for long journeys and learn to look after guests.",
      again: ["Wash your hands first. Then we'll see what's in the larder.", "Feeding people is one of the oldest kinds of kindness there is.", "There's a cool draught coming up through the floor. Something's under this kitchen, behind a very large barrel."]
    },
    character: {
      first: "This is the Lamp Room, where I keep my spare lanterns. It's quiet in here, a good place to think about hard choices. Being brave doesn't mean you aren't afraid. It means you keep walking anyway.",
      again: ["Which choice in today's chapter was the hardest one? Would you have chosen the same?", "Every lamp in here was lit by someone who decided the dark wasn't going to win.", "Take a moment. What did you do this week that needed a little courage?"]
    },
    drama: {
      first: "The Little Stage! Curtains up. In here you act out the big moments in your own words, play storytelling games and practise speaking so the back row can hear you.",
      again: ["Remember: face your audience, speak to the back wall, and pause before the important bit.", "You don't need a script. You need to know what your character wants.", "Did you hear that? Something behind the stage curtain whispers back whenever anyone speaks. I wonder what it wants to hear."]
    },
    notebook: {
      first: "This is the Study, where the ink and paper live. Keep one page for every chapter. Years from now, these notebooks will be the treasure.",
      again: ["Write while the chapter is still warm in your mind.", "Neat is nice, but true is better. Write what you really thought.", "Draw something too. A quick sketch remembers things that words forget."]
    },
    outdoor: {
      first: "Here's the Garden Door. Open it and the whole world is a classroom. Take the adventure outside: hunt, explore, play the games from the story, and come back muddy.",
      again: ["Fresh air helps the story settle. Go and find something in today's chapter out there in the real world.", "Every good adventure starts by stepping out of the front door.", "Look up. Which way is the wind blowing? Which way is east?"]
    },
    vault: {
      sealed: "A round stone door with words carved around its rim. It won't open for a push. It wants an answer.",
      first: "You answered the door! This is the Riddle Vault. Light a candle for every riddle you solve, and leave one of your own for the next explorer.",
      again: ["Candles everywhere. Every one of them was a riddle someone solved.", "The best riddles describe something ordinary in a strange way. Try making one about something in your kitchen."]
    },
    treasury: {
      sealed: "A heavy lock with five runes on it. The rune key is in the Painted Room, if you need it.",
      first: "The Hidden Treasury! Every curio you find in the pictures ends up on these shelves. And there are messages here, locked in runes.",
      again: ["Count your curios. Some of them are very well hidden.", "Treasure doesn't have to be gold. A river pebble counts, if it's the right pebble."]
    },
    moon: {
      sealed: "A silver door with no keyhole at all. Only the Moon Key will open it, and that's found by reading what moonlight shows.",
      first: "The Moon Chamber. Look how close the stars are. Trace the three pictures in the sky and the last of the old keys is yours.",
      again: ["People have been joining up stars into pictures for thousands of years. Make up a constellation of your own tonight.", "On a clear night, step outside and find the moon. What shape is it today?"]
    },
    cellar: {
      sealed: "A huge barrel blocks the cellar stairs, and someone has burned a riddle into its lid. Read it carefully.",
      first: "Down the ladder you go. This is the Barrel Cellar. Cool, dim, and smelling of apples. Every barrel down here has a puzzle in it, and one of them is about whether you'd float.",
      again: ["Knock on a barrel. Full ones thud. Empty ones boom.", "Logic is just being very patient with clues. One clue at a time."]
    },
    echo: {
      sealed: "Behind the stage curtain there's a door with no words on it. But if you stand very still, a voice drifts out with a question.",
      first: "The Echo Gallery. Say hello. Hear that? This is where actors come to find their voices: whisper, call, boom, and listen to it all come back.",
      again: ["Try the voice ladder. Start with a whisper and climb.", "Every character has a voice of their own. Who will you be today?"]
    },
    attic: {
      sealed: "A ladder goes up to a low door with four keyholes in a row. Bring four keys, any four, and it'll open.",
      first: "Mind your head on the beams. This was a mapmaker's attic. Read the grid, measure the roads, and learn the compass. Win the hunt and the Compass Key is yours.",
      again: ["Along the corridor, then up the stairs. That's how you read a grid square.", "Every square on that map is five miles. Hobbit feet would be very tired."]
    },
    lastlight: {
      sealed: "The deepest door of all, smooth grey stone with a keyhole for every key under the hill. Check your satchel to see which keys you're still missing.",
      first: "Every key, in every keyhole. Watch: the last light of the day is falling on the door, and it's opening. You've explored the whole labyrinth. This room is for remembering the journey.",
      again: ["Print your journey book. One day you'll be glad you did.", "There and back again. That's the shape of the best journeys."]
    }
  };
  const KEYLINES = ["A lore key! Pop it in your satchel. Keys open things, and some doors here want more than one.", "Another key. You're collecting them faster than I can polish them.", "That's a fine key. Check the satchel: some doors only open when you carry enough of them."];
  const CURIOLINE = ["Well spotted! That one's going in the Treasury.", "Sharp eyes. Not many people notice that.", "Ah, a curio. Every picture under the hill hides one."];

  /* ---------------- the ribbon ---------------- */
  let on = store.get('rd-narr', true), voiceOn = store.get('rd-narr-voice', false);
  const ribbon = el('div', { class: 'narrator', id: 'narrator', role: 'status', 'aria-live': 'polite', hidden: '' });
  ribbon.innerHTML = `<div class="nar-lamp" aria-hidden="true"><svg viewBox="0 0 34 52"><path d="M17 2v6" stroke="#3a2a14" stroke-width="2"/><path d="M8 14 L17 7 L26 14Z" fill="#3a2a14"/><rect x="8" y="14" width="18" height="26" rx="3" fill="#ffd36e" stroke="#3a2a14" stroke-width="2.4"/><circle cx="17" cy="27" r="5" fill="#fff8d0" class="glow"/><rect x="10" y="40" width="14" height="5" rx="1" fill="#3a2a14"/></svg></div>
    <div class="nar-body"><span class="label">The Lamplighter</span><p id="narText"></p></div>
    <div class="nar-btns"><button class="nar-b" id="narSay" title="Hear it read aloud" aria-label="Read aloud"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8c1.5 1.2 1.5 6.8 0 8M19 6c3 2.5 3 9.5 0 12" stroke="currentColor" stroke-width="1.6" fill="none"/></svg></button><button class="nar-b" id="narX" aria-label="Dismiss">&times;</button></div>`;
  document.body.appendChild(ribbon);
  let hideT, typeT, lastLine = '', hovering = false;

  function voice() {
    if (!('speechSynthesis' in window)) return null;
    const vs = speechSynthesis.getVoices();
    return vs.find(v => /en-GB/i.test(v.lang) && /male|daniel|arthur|george|oliver|ryan/i.test(v.name)) || vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  }
  function speak(t) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); const v = voice(); if (v) u.voice = v;
    u.rate = .93; u.pitch = .9; speechSynthesis.speak(u);
  }
  function say(text, opts = {}) {
    if (!on && !opts.force) return;
    lastLine = text;
    clearTimeout(hideT); clearInterval(typeT);
    const p = $('#narText'); ribbon.hidden = false; ribbon.classList.remove('out'); void ribbon.offsetWidth; ribbon.classList.add('in');
    if (RD.reduce) p.textContent = text;
    else { let i = 0; p.textContent = ''; typeT = setInterval(() => { i += 2; p.textContent = text.slice(0, i); if (i >= text.length) clearInterval(typeT); }, 18); }
    if (voiceOn) speak(text);
    const ms = Math.max(7000, text.length * 75);
    const hide = () => { if (hovering) { hideT = setTimeout(hide, 1500); return; } ribbon.classList.add('out'); setTimeout(() => { ribbon.hidden = true; }, 500); };
    hideT = setTimeout(hide, ms);
  }
  ribbon.addEventListener('pointerenter', () => hovering = true);
  ribbon.addEventListener('pointerleave', () => hovering = false);
  $('#narX').onclick = () => { clearTimeout(hideT); ribbon.hidden = true; if ('speechSynthesis' in window) speechSynthesis.cancel(); };
  $('#narSay').onclick = () => speak(lastLine);

  const said = store.get('rd-narr-said', {});
  const pick = (arr, key) => { const prev = said[key]; let i; do { i = Math.floor(Math.random() * arr.length); } while (arr.length > 1 && i === prev); said[key] = i; store.set('rd-narr-said', said); return arr[i]; };
  function lineFor(id, first) {
    const l = L[id]; if (!l) return null;
    if (isSecret(id) && !isOpen(id)) return l.sealed;
    if (first || !said['seen-' + id]) { said['seen-' + id] = 1; store.set('rd-narr-said', said); return l.first; }
    // now and then, nudge towards the next unread chapter
    const read = RD.read, next = chapters.findIndex((_, i) => !read.includes(i));
    if (id !== 'home' && !isSecret(id) && next >= 0 && Math.random() < .25) return `Your family has read ${read.length} of nineteen chapters. Next comes chapter ${next + 1}, ${chapters[next][0]}. When you've read it, choose it on the scroll in this room.`;
    return pick(l.again, id);
  }

  let lastRoomAt = 0, booted = false;
  document.addEventListener('rd:room', e => {
    const now = Date.now(); if (now - lastRoomAt < 600) return; lastRoomAt = now;
    const t = lineFor(e.detail.id, false); if (t) setTimeout(() => say(t), RD.reduce ? 0 : 700);
  });
  document.addEventListener('rd:key', e => {
    const k = KEYS.find(x => x.id === e.detail.id); const n = LS.keys.length;
    let t = pick(KEYLINES, 'key');
    if (n === 4) t = "Four keys! That's enough for the fussy door up in the Mapmaker's Attic, above the Map Room.";
    if (n === KEYS.length) t = "That's every key under the hill. Go to the Old Hall of Kings. The deepest door is waiting for you.";
    setTimeout(() => say((k ? k.name + '. ' : '') + t), 900);
  });
  document.addEventListener('rd:curio', () => setTimeout(() => say(pick(CURIOLINE, 'curio')), 600));
  document.addEventListener('rd:read', e => {
    const n = e.detail.read.length;
    if (n === chapters.length) say("All nineteen chapters, there and back again. Well done, all of you. There's a scroll waiting for you behind the Last-Light Door, if you can open it.");
    else if (n === 1) say("The first chapter is marked. Every scroll in every room will now remember where you are.");
  });

  /* first visit to the page: greet after the hero has drawn */
  setTimeout(() => { if (!booted) { booted = true; const t = lineFor(RD.curRoom, false); if (t && RD.curRoom !== 'home') say(t); else if (!said['seen-home']) say(lineFor('home', true)); } }, 1600);

  /* settings on the lamp-shelf */
  RD.shelfToggle('setNarr', 'The Lamplighter speaks in each room', on, v => { on = v; store.set('rd-narr', v); if (!v) { ribbon.hidden = true; if ('speechSynthesis' in window) speechSynthesis.cancel(); } else say("Here I am again. I'll keep my voice down.", { force: true }); });
  if ('speechSynthesis' in window) RD.shelfToggle('setVoice', 'Read the Lamplighter\'s words aloud', voiceOn, v => { voiceOn = v; store.set('rd-narr-voice', v); if (v) speak(lastLine || L.home.again[2]); else speechSynthesis.cancel(); });

  RD.narrator = { say };
})();
