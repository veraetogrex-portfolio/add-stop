// VECTOR Maps · add a stop — zero dependencies.
// <section class="vm" data-assets="assets/"></section> becomes the whole directions screen: a drive home → dinner.
// "Flowers" shows three florists along the route with the detour to Petal & Twine as a dashed line;
// "Add stop" grows the route along that dashed line, Petal & Twine becomes stop 1 and every arrival counts 19:38 → 19:44.
;(() => {
  'use strict';

  const svg = (d, o = {}) => `<svg width="${o.s || 18}" height="${o.s || 18}" viewBox="0 0 24 24" fill="none" stroke="${o.c || 'currentColor'}" stroke-width="${o.w || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const P = {
    explore: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    directions: '<path d="M12 3 21 12l-9 9-9-9z"/><path d="M9.5 14v-3h5M12.5 9l2 2-2 2"/>',
    saved: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    recents: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    transit: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l2-4M16 21l-2-4"/>',
    offline: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    home: '<path d="M4 11 12 4l8 7v9H4z"/>',
    studio: '<rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V4h6v3"/>',
    food: '<path d="M6 3v8a3 3 0 0 0 6 0V3M9 3v18M17 3c-2 2-2 7 0 9v9"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    share: '<path d="M12 15V3m-4 4 4-4 4 4M5 12v8h14v-8"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    car: '<path d="M5 16v-4l2-5h10l2 5v4zM5 16v3h3v-3M16 16v3h3v-3"/><circle cx="8.5" cy="13" r=".8"/><circle cx="15.5" cy="13" r=".8"/>',
    bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M9 8h3"/>',
    walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M11 21l2-6-3-3 1-4 4 3 3 1M9 12l-2 3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    flower: '<circle cx="12" cy="8" r="2.5"/><path d="M12 5.5C11 2.5 7 3 8 6M12 5.5c1-3 5-2.5 4 .5M9.5 8.5C6 8 5.5 12 8.5 11.5M14.5 8.5c3.5-.5 4 3.5 1 3M12 10.5V21M12 17c-2-2-5-2-6-1M12 15c2-2 4.5-2 5.5-1"/>',
    coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
    pharmacy: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',
    bag: '<path d="M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0"/>',
    pin: '<circle cx="12" cy="9" r="3"/><path d="M12 12v9"/>',
    pinFlower: '<circle cx="12" cy="9" r="3"/><path d="M12 12v9M12 17c-2-2-4-2-5-1"/>',
    rain: '<path d="M7 15a4 4 0 1 1 1-7.9A5 5 0 0 1 18 9a3 3 0 0 1 0 6zM9 19l-1 2M13 19l-1 2M17 19l-1 2"/>',
    layers: '<path d="m12 4 9 5-9 5-9-5zM3 14l9 5 9-5"/>',
    locate: '<path d="M20 4 4 11l7 2 2 7z"/>',
    go: '<path d="M5 20 12 4l7 16-7-4z"/>',
  };
  const NAV = [['explore', 'Explore'], ['directions', 'Directions'], ['saved', 'Saved'], ['recents', 'Recents'], ['transit', 'Transit'], ['offline', 'Offline maps']];
  const PLACES = [['home', 'Home', '12 Alder Lane'], ['studio', 'Studio', 'Wharf Yard 3'], ['food', 'Tidewater', 'Harbour Row 4']];

  // the route in map px: home → Linden Ave → Kestrel Bridge → Tidewater, and the new way through Petal & Twine
  const ROUTE = {
    old: 'M130 700 130 610 300 505 300 340 430 262 600 168 612 160',
    detour: 'M300 505 468 548 590 512 590 330 612 160',
    added: 'M130 700 130 610 300 505 468 548 590 512 590 330 612 160',
    ghost: 'M300 505 300 340 430 262 600 168',
  };
  const SHARED = 'M130 700 130 610 300 505';   // the part both ways share; the new line grows from its end
  // minutes before → after the stop; clock values are minutes of the day
  const DETOUR = { dur: [22, 28], transit: [31, 37], bike: [26, 33], walk: [94, 101], eta: [19 * 60 + 38, 19 * 60 + 44] };
  const FMT = {
    dur: m => `${m} min`, transit: m => `${m} min`, bike: m => `${m} min`,
    walk: m => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`,
    eta: m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`,
  };
  const TEXT = {
    dist: ['7.8 km', '9.1 km · 1 stop'],
    via: ['Fastest · via Linden Ave and Kestrel Bridge', 'via Petal & Twine, Marrow St and Harbour Bridge'],
    ok: ['On time for your 19:45 table', 'Still on time for your 19:45 table'],
    note: ['Live until you arrive', 'Updated with your stop'],
  };
  const GROW = 800, EASE = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  class MapsApp {
    constructor(root) {
      this.root = root;
      const A = root.dataset.assets || 'assets/';
      const img = (n, alt, st = '') => `<img src="${A}${n}.jpg" alt="${alt}" style="${st}">`;
      const n = k => `<span class="vm-num" data-n="${k}">${FMT[k](DETOUR[k][0])}</span>`;
      const t = k => `<span data-t="${k}">${TEXT[k][0]}</span>`;
      root.innerHTML = `
<nav class="vm-side" aria-label="Main">
  <div class="vm-logo"><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M5 21 13 4l8 17-8-4.5z" fill="none" stroke="#2CC7B5" stroke-width="2" stroke-linejoin="round"/></svg><b>VECTOR</b><span>Maps</span></div>
  ${NAV.map(([k, l]) => `<a class="vm-nav${k === 'directions' ? ' is-on' : ''}" href="#">${svg(P[k])}${l}${k === 'offline' ? '<span style="margin-left:auto;font-size:11.5px;color:var(--vm-muted)">2</span>' : ''}</a>`).join('')}
  <div class="vm-cap">Saved places</div>
  ${PLACES.map(([k, l, s]) => `<a class="vm-nav place" href="#"><span class="vm-dot mute">${svg(P[k], { s: 13, w: 2.2 })}</span><span>${l}<small>${s}</small></span></a>`).join('')}
  <div class="vm-side-foot">
    <div class="vm-week"><div class="vm-small">This week</div><div style="font-size:14px;font-weight:600;margin-top:2px">41 km · 9 trips</div><div class="vm-bar"><span style="width:58%"></span></div></div>
    <div class="vm-me">${img('lena', 'Lena Vos', 'width:34px;height:34px;border-radius:50%')}<div><div style="font-size:13.5px;font-weight:600">Lena Vos</div><div style="font-size:12px;color:var(--vm-muted)">Personal</div></div></div>
  </div>
</nav>
<div class="vm-col">
  <header class="vm-top">
    <label class="vm-search">${svg(P.search, { s: 16, w: 2 })}<span class="vm-sr">Search</span><input type="search" placeholder="Search places and addresses"></label>
    <div style="font-size:13px;color:var(--vm-muted)">Fri, Nov 28 · 19:14</div>
    <div class="vm-top-r">
      <button class="vm-ghost" type="button">${svg(P.share, { s: 16, w: 2 })}Share trip</button>
      <button class="vm-ib" type="button" aria-label="Notifications">${svg(P.bell, { s: 19 })}<i></i></button>
      ${img('lena', 'Lena Vos', 'width:34px;height:34px;border-radius:50%')}
    </div>
  </header>
  <div class="vm-body">
    <aside class="vm-dir" aria-label="Directions">
      <div class="vm-dir-h"><h1>Dinner at Tidewater</h1><span class="vm-small">Table for 3 · 19:45</span></div>
      <div class="vm-stops">
        <div class="vm-stop"><span class="vm-dot a">A</span><span>Home · 12 Alder Lane</span><span>19:16</span></div>
        <div class="vm-stop is-new" data-when="added"><span class="vm-dot">1</span><span>Petal &amp; Twine · flowers</span><span>19:27 · 5 min</span></div>
        <div class="vm-stop"><span class="vm-dot">B</span><span>Tidewater Oyster Bar</span>${n('eta')}</div>
        <button class="vm-addstop" type="button">${svg(P.plus, { s: 14, w: 2.2 })}Add stop</button>
      </div>
      <div class="vm-modes" role="tablist" aria-label="Travel mode">
        <button class="vm-mode" role="tab" type="button" aria-selected="true">${svg(P.car, { s: 17, w: 1.9 })}${n('dur')}</button>
        <button class="vm-mode" role="tab" type="button" aria-selected="false">${svg(P.transit, { s: 17, w: 1.9 })}${n('transit')}</button>
        <button class="vm-mode" role="tab" type="button" aria-selected="false">${svg(P.bike, { s: 17, w: 1.9 })}${n('bike')}</button>
        <button class="vm-mode" role="tab" type="button" aria-selected="false">${svg(P.walk, { s: 17, w: 1.9 })}${n('walk')}</button>
      </div>
      <section class="vm-card vm-route" aria-label="Selected route" aria-live="polite">
        <div class="vm-route-h"><big>${n('dur')}</big><span style="font-size:13px;color:var(--vm-muted)">${t('dist')}</span><span class="vm-plus" data-when="added">+6 min</span><span class="vm-arrive">arrive <b>${n('eta')}</b></span></div>
        <div style="font-size:13px;color:var(--vm-muted)">${t('via')}</div>
        <div class="vm-traffic"><span style="flex:5"></span><span style="flex:1;background:var(--vm-amber)"></span><span style="flex:3"></span></div>
        <div class="vm-ok">${svg(P.check, { s: 14, w: 2.4, c: '#2CC7B5' })}${t('ok')}</div>
      </section>
      <div class="vm-res" data-when="start" style="justify-content:space-between"><div><div style="font-size:14px;font-weight:600">25 min · 8.4 km</div><div class="vm-small" style="margin-top:2px">via Harbour Bridge · arrive 19:41</div></div><span class="vm-small">+3 min</span></div>
      <div>
        <div class="vm-sec-h"><h2>Along your route</h2><span class="vm-small">within 10 min</span></div>
        <div class="vm-chips">
          <button class="vm-chip" type="button" aria-pressed="false" data-chip="flowers">${svg(P.flower, { s: 15, w: 1.9 })}Flowers</button>
          <button class="vm-chip" type="button" aria-pressed="false">${svg(P.coffee, { s: 15, w: 1.9 })}Coffee</button>
          <button class="vm-chip" type="button" aria-pressed="false">${svg(P.pharmacy, { s: 15, w: 1.9 })}Pharmacy</button>
          <button class="vm-chip" type="button" aria-label="3 more categories">+3</button>
        </div>
      </div>
      <div class="vm-recent" data-when="start">
        <div class="vm-small">Recent stops on this way</div>
        <div class="vm-recent-i"><span class="vm-dot mute">${svg(P.coffee, { s: 14, w: 2 })}</span><span>Kiln Coffee · Linden Ave</span><span style="font-size:12px;color:var(--vm-muted)">Nov 21</span></div>
        <div class="vm-recent-i"><span class="vm-dot mute">${svg(P.bag, { s: 14, w: 2 })}</span><span>Fenn Street Market</span><span style="font-size:12px;color:var(--vm-muted)">Nov 14</span></div>
      </div>
      <div class="vm-shops" data-when="pick" aria-label="Flowers along your route">
        <div class="vm-res vm-shop-petal">${img('petal', 'Petal and Twine flower shop at dusk')}
          <div style="flex:1;min-width:0"><div class="vm-res-t">Petal &amp; Twine</div><div class="vm-res-m">★ 4.8 · until 20:00 · <span style="color:var(--vm-route-soft)">+6 min</span></div></div>
          <button class="vm-btn vm-add" type="button" data-add="petal"><span class="vm-add-idle">Add stop</span><span class="vm-add-done" aria-hidden="true">${svg(P.check, { s: 14, w: 2.6, c: '#2CC7B5' })}Stop 1</span></button>
        </div>
        <div class="vm-res">${img('cornerbloom', 'Flower stall under an awning', 'opacity:.6')}
          <div style="flex:1;min-width:0"><div class="vm-res-t" style="color:var(--vm-nav)">Corner Bloom Market</div><div class="vm-res-m">★ 4.6 · <span style="color:var(--vm-amber)">closed when you pass</span></div></div>
        </div>
        <div class="vm-res">${img('moss', 'Florist studio with dried flowers')}
          <div style="flex:1;min-width:0"><div class="vm-res-t">Moss Studio</div><div class="vm-res-m">★ 4.9 · until 21:00 · +11 min</div></div>
          <button class="vm-btn line" type="button">Add stop</button>
        </div>
      </div>
      <button class="vm-go" type="button">${svg(P.go, { s: 17, w: 2.2 })}Start · arrive ${n('eta')}</button>
    </aside>
    <main class="vm-map" aria-label="Map">
      <svg width="832" height="836" viewBox="0 0 832 836" aria-hidden="true">
        <defs><mask id="vm-detour-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="832" height="836"><path class="vm-detour-reveal" d="${ROUTE.detour}" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/></mask></defs>
        <path d="M20 712 112 730 104 836 0 836 0 724z" fill="#0F1A15"/><path d="M160 172 286 198 272 288 178 272z" fill="#0F1A15"/><path d="M556 604 646 622 634 694 542 674z" fill="#0F1A15"/><path d="M690 120 800 140 790 220 700 210z" fill="#0F1A15"/>
        <path d="M-30 280C120 300 220 370 320 395S520 430 610 455 760 520 870 575" fill="none" stroke="#132A3A" stroke-width="78"/>
        <path d="M-30 280C120 300 220 370 320 395S520 430 610 455 760 520 870 575" fill="none" stroke="#0E2230" stroke-width="70"/>
        <g fill="none" stroke="#171B24" stroke-width="3" stroke-linecap="round">
          <path d="M0 640 120 655M140 560 60 470 20 380M200 568 250 700 230 836M300 505 380 620 400 836M380 620 520 640 640 700M468 548 500 680 520 836M640 700 700 836M700 545 760 680 832 700M60 700 30 560"/>
          <path d="M60 230 40 100 60 0M200 262 180 120 210 0M300 340 380 180 380 120M430 262 470 120M430 262 520 330 590 310M612 160 700 260 832 300M700 260 705 420M140 160 300 190 380 120M0 160 140 160M740 90 760 0M520 330 540 420M380 180 470 190M250 700 380 690 500 680M760 680 790 836"/>
        </g>
        <g fill="none" stroke="#232A36" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M128 836 130 610 150 380M-10 690 130 610 300 505 360 470M310 836 300 505 300 340 280 0M60 230 200 262 300 340 430 262 600 168 740 90 832 50"/>
          <path d="M300 505 468 548 590 512 700 545 832 610M590 836 590 512 590 330 612 160 620 0M380 120 612 160 832 200M0 780 300 760 600 720 832 740"/>
        </g>
        <g stroke="#2E3543" stroke-width="12"><path d="M300 352V438M590 412V498"/></g>
        <g font-family="inherit" font-size="11.5" fill="#9A9CA8" font-weight="500">   <!-- street and bridge names: 4.5:1 even on a bridge -->
          <text x="606" y="478" transform="rotate(24 606 478)">Vey River</text><text x="80" y="300" transform="rotate(8 80 300)">Vey River</text>
          <text x="314" y="395" transform="rotate(-90 314 395)" text-anchor="middle">Kestrel Bridge</text><text x="604" y="455" transform="rotate(-90 604 455)" text-anchor="middle">Harbour Bridge</text>
          <text x="372" y="514" transform="rotate(14 372 514)">Marrow St</text><text x="470" y="236" transform="rotate(-29 470 236)">Quay Rd</text>
          <text x="113" y="790" transform="rotate(-90 113 790)">Alder Ln</text><text x="190" y="575" transform="rotate(-32 190 575)">Linden Ave</text>
          <text x="460" y="128" transform="rotate(9 460 128)">Harbour Row</text><text x="660" y="745" transform="rotate(3 660 745)">Fenn Rd</text>
        </g>
        <g font-family="inherit" font-size="13" fill="#9A9CA8" font-weight="600"><text x="200" y="650">Linden</text><text x="250" y="110">Quay Gardens</text><text x="660" y="640">Riverside</text><text x="640" y="80">Old Harbour</text></g>
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path class="vm-ghost" d="${ROUTE.ghost}" stroke="#5F6474" stroke-width="3" stroke-dasharray="2 7"/>
          <g class="vm-old"><path d="${ROUTE.old}" stroke="#0B3B36" stroke-width="12"/><path d="${ROUTE.old}" stroke="#2CC7B5" stroke-width="6"/></g>
          <path class="vm-preview" d="${ROUTE.detour}" stroke="#86E3D6" stroke-width="4" stroke-dasharray="8 8" mask="url(#vm-detour-mask)"/>
          <g class="vm-new"><path d="${ROUTE.added}" stroke="#0B3B36" stroke-width="12"/><path d="${ROUTE.added}" stroke="#2CC7B5" stroke-width="6"/></g>
        </g>
      </svg>
      <div class="vm-pin" style="left:122px;top:692px;width:16px;height:16px;background:var(--vm-text);box-shadow:0 0 0 3px var(--vm-map),0 0 0 5px #3A3F4C"></div>
      <div class="vm-lab" style="left:148px;top:688px">Home · 19:16</div>
      <div class="vm-pin" style="left:598px;top:146px;background:var(--vm-route);box-shadow:0 0 0 3px var(--vm-map)"><span style="width:10px;height:10px;border-radius:50%;background:var(--vm-on-route)"></span></div>
      <div class="vm-lab" style="left:634px;top:148px">Tidewater · ${n('eta')}</div>
      <div class="vm-pin vm-on-pick" style="left:201px;top:571px;background:#1E212A;border:1px solid #3A3F4C;color:#8A8E9C;--d:.12s">${svg(P.pin, { s: 14, w: 2 })}</div>
      <div class="vm-lab vm-on-pick" style="left:236px;top:573px;color:var(--vm-muted);font-weight:500;--d:.12s">Closes 19:30</div>
      <div class="vm-pin vm-on-pick" style="left:676px;top:262px;background:var(--vm-panel);border:2px solid var(--vm-route);color:var(--vm-route);--d:.2s">${svg(P.pin, { s: 14, w: 2 })}</div>
      <div class="vm-lab vm-on-pick" style="left:710px;top:264px;font-weight:500;--d:.2s">+11 min</div>
      <div class="vm-lab vm-on-pick" style="left:498px;top:470px;color:var(--vm-route-soft);border-color:var(--vm-route-line);--d:.3s">+6 min</div>
      <div class="vm-mc vm-on-pick" style="left:330px;top:590px;width:292px;padding:10px;display:flex;gap:10px;--d:.24s">
        ${img('petal', '', 'width:60px;height:60px;border-radius:8px')}${img('bouquet', 'Ranunculus bouquet in kraft paper', 'width:60px;height:60px;border-radius:8px')}
        <div style="min-width:0"><div style="font-size:13.5px;font-weight:600">Petal &amp; Twine</div><div style="font-size:12px;color:var(--vm-muted);margin-top:3px">Marrow St 18</div><div style="font-size:12px;color:var(--vm-muted);margin-top:2px">Pickup in 5 min</div></div>
      </div>
      <div class="vm-petal">${svg(P.pinFlower, { s: 17, w: 2.2 })}<b>1</b></div>
      <div class="vm-lab vm-on-added" style="left:380px;top:578px;border-color:var(--vm-route-line);--d:.45s">Petal &amp; Twine · 19:27</div>
      <div style="position:absolute;left:16px;top:16px;display:flex;gap:8px">
        <div class="vm-lab" style="position:static;height:32px;border-radius:16px;padding:0 12px;font-weight:500;color:var(--vm-text-2)"><span style="width:8px;height:8px;border-radius:50%;background:#6CCB7E"></span>Light traffic</div>
        <div class="vm-lab" style="position:static;height:32px;border-radius:16px;padding:0 12px;font-weight:500;color:var(--vm-text-2)">${svg(P.rain, { s: 14, w: 2 })}8° · rain after 20:00</div>
      </div>
      <div class="vm-mc" style="right:16px;top:16px;width:316px;padding:12px 14px;display:flex;align-items:center;gap:12px">
        <div style="display:flex">${img('noa', 'Noa Park', 'width:32px;height:32px;border-radius:50%;box-shadow:0 0 0 2px #0E1016')}${img('ari', 'Ari Mendel', 'width:32px;height:32px;border-radius:50%;margin-left:-8px;box-shadow:0 0 0 2px #0E1016')}</div>
        <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">Noa and Ari see your arrival</div><div style="font-size:12px;color:var(--vm-muted);margin-top:2px">${t('note')}</div></div>
        <span class="vm-shares" style="font-size:15px;font-weight:600">${n('eta')}</span>
      </div>
      <div style="position:absolute;right:16px;top:330px;display:flex;flex-direction:column;gap:8px">
        <div class="vm-mc" style="position:static;display:flex;flex-direction:column;overflow:hidden"><button class="vm-ib" type="button" style="border-radius:0;width:40px;height:40px" aria-label="Zoom in">+</button><span style="height:1px;background:#20232D"></span><button class="vm-ib" type="button" style="border-radius:0;width:40px;height:40px" aria-label="Zoom out">−</button></div>
        <button class="vm-mc" type="button" style="position:static;width:42px;height:42px;display:grid;place-items:center;color:var(--vm-nav)" aria-label="Map layers">${svg(P.layers)}</button>
        <button class="vm-mc" type="button" style="position:static;width:42px;height:42px;display:grid;place-items:center;color:var(--vm-nav)" aria-label="Show my location">${svg(P.locate)}</button>
      </div>
      <div class="vm-mc" style="right:16px;bottom:16px;width:330px;padding:10px;display:flex;gap:12px">
        ${img('tidewater', 'Tidewater Oyster Bar dining room', 'width:96px;height:72px;border-radius:8px')}
        <div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600">Tidewater Oyster Bar</div><div style="font-size:12.5px;color:var(--vm-muted);margin-top:3px">Harbour Row 4 · ★ 4.7</div><div style="font-size:12.5px;color:var(--vm-text-2);margin-top:3px">Table for 3 at 19:45 · parking 60 m</div></div>
      </div>
      <div style="position:absolute;left:16px;bottom:18px;display:flex;align-items:center;gap:8px;font-size:11.5px;color:#8A8E9C"><span style="width:64px;height:6px;border:1.5px solid #5F6474;border-top:0"></span>500 m</div>
    </main>
  </div>
</div>`;
      this.chip = root.querySelector('[data-chip="flowers"]');
      this.grow = [...root.querySelectorAll('.vm-new path')];
      this.reveal = root.querySelector('.vm-detour-reveal');
      this.chip.addEventListener('click', () => this.pick(this.root.dataset.pick !== 'true'));
      root.querySelector('[data-add="petal"]').addEventListener('click', () => this.addStop());
      root.querySelectorAll('.vm-nav, .vm-ghost').forEach(a => a.addEventListener('click', e => e.preventDefault()));
      // travel mode tabs: click or arrow keys move the selection; only the selected tab is in the tab order
      const tabs = [...root.querySelectorAll('.vm-mode')];
      const select = (t, focus) => { tabs.forEach(x => { x.setAttribute('aria-selected', x === t); x.tabIndex = x === t ? 0 : -1; }); if (focus) t.focus(); };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(t));
        t.addEventListener('keydown', e => {
          const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
          if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
        });
      });
      this.tabs = tabs; this.selectTab = select;
      this.reset();
    }

    // FLIP: panel rows keep their place on screen and slide to the new layout instead of jumping
    flip(mutate) {
      const rows = [...this.root.querySelectorAll('.vm-dir > *, .vm-stops > *')];
      const k = this.root.getBoundingClientRect().width / 1440 || 1;
      const before = new Map(rows.map(e => [e, e.getBoundingClientRect()]));
      mutate();
      rows.forEach(e => {
        const b = before.get(e), a = e.getBoundingClientRect();
        if (!b.height) return this.enter(e);   // was hidden: it arrives
        if (!a.height) return;
        const dy = (b.top - a.top) / k;
        if (Math.abs(dy) > .5) e.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.23,1,.32,1)' });
      });
    }

    enter(el, delay = 60) {
      const items = el.matches('.vm-shops') ? [...el.children] : [el];
      items.forEach((e, i) => e.animate([{ opacity: 0, transform: 'translateY(10px) scale(.97)' }, { opacity: 1, transform: 'none' }],
        { duration: 320, delay: delay + i * 50, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
    }

    // Flowers: three florists appear in the list and on the map, the detour to Petal & Twine draws itself as a dashed line
    pick(on = true, quiet = false) {
      if (this.root.dataset.added === 'true') return;
      const apply = () => { this.root.dataset.pick = on; this.chip.setAttribute('aria-pressed', on); };
      if (quiet) return apply();
      this.flip(apply);
      if (on) {
        const L = this.reveal.getTotalLength();
        this.reveal.animate([{ strokeDasharray: `0 ${L}` }, { strokeDasharray: `${L} 0` }], { duration: 650, delay: 150, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' });
      }
    }

    // Add stop: the solid route grows along the dashed detour, the pin turns into stop 1 and every time counts up with the line
    addStop(quiet = false) {
      if (this.root.dataset.added === 'true' || this.root.dataset.pick !== 'true') return;
      const apply = () => { this.root.dataset.added = true; };
      if (quiet) { apply(); this.count(1); this.words(1); return; }
      this.flip(apply);
      const shared = this.lengthOf(SHARED);
      this.grow.forEach(p => {
        const L = p.getTotalLength();
        p.style.strokeDasharray = `${L} ${L}`;
        p.animate([{ strokeDashoffset: L - shared }, { strokeDashoffset: 0 }], { duration: GROW, easing: 'cubic-bezier(.65,0,.35,1)' });
      });
      const t0 = performance.now(), run = this.run;
      const step = now => {
        if (run !== this.run) return;
        const p = Math.min(1, (now - t0) / GROW);
        this.count(EASE(p));
        if (p > .6) this.words(1);   // the route description and the friends' note change once the line has passed the stop
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    words(i) {
      Object.entries(TEXT).forEach(([k, v]) => this.root.querySelectorAll(`[data-t="${k}"]`).forEach(e => { if (e.textContent !== v[i]) e.textContent = v[i]; }));
    }

    count(p) {
      Object.entries(DETOUR).forEach(([k, [a, b]]) => {
        const v = FMT[k](Math.round(a + (b - a) * p));
        this.root.querySelectorAll(`[data-n="${k}"]`).forEach(e => { if (e.textContent !== v) e.textContent = v; });
      });
    }

    // the routes are polylines: their length is the sum of the segments
    lengthOf(d) {
      const n = d.match(/-?[\d.]+/g).map(Number);
      let L = 0;
      for (let i = 2; i < n.length; i += 2) L += Math.hypot(n[i] - n[i - 2], n[i + 1] - n[i - 1]);
      return L;
    }

    reset() {
      this.run = (this.run || 0) + 1;
      this.root.getAnimations({ subtree: true }).forEach(a => a.cancel());
      this.root.classList.add('is-instant');
      this.root.dataset.added = false;
      this.selectTab(this.tabs[0]);
      this.pick(false, true);
      this.words(0);
      this.count(0);
      this.root.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => this.root.classList.remove('is-instant')));
    }
  }

  document.querySelectorAll('.vm').forEach(el => { el.mapsApp = new MapsApp(el); });
})();
