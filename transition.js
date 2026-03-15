/**
 * CONSHAUNERY // ELEVATOR TRANSITION
 * Drop <script src="./transition.js"></script> into every page.
 * Doors close on navigate, doors open on arrival. That's it.
 */
(function () {

    /* ── NEON COLOUR (change to taste) ───────────────────────────── */
    var NEON    = '#00ffcc';
    var NEON2   = '#cc00ff';
    var DARK    = '#000408';
    var SEAM    = '#00ffcc';

    /* ── INJECT CSS ──────────────────────────────────────────────── */
    var style = document.createElement('style');
    style.textContent = [

        '/* ── ELEVATOR OVERLAY ── */',
        '#elev-overlay {',
        '  position: fixed; inset: 0; z-index: 99999;',
        '  pointer-events: none;',
        '  font-family: "Courier New", monospace;',
        '}',

        /* Left door */
        '#elev-L {',
        '  position: absolute; top: 0; left: 0;',
        '  width: 50%; height: 100%;',
        '  background: ' + DARK + ';',
        '  border-right: 2px solid ' + SEAM + ';',
        '  box-shadow: inset -1px 0 0 rgba(0,255,200,0.15), 4px 0 40px rgba(0,255,200,0.35);',
 '  transform: translateX(-100%);',
 '  will-change: transform;',
 '  overflow: hidden;',
 '}',

 /* Right door */
 '#elev-R {',
 '  position: absolute; top: 0; right: 0;',
 '  width: 50%; height: 100%;',
 '  background: ' + DARK + ';',
 '  border-left: 2px solid ' + SEAM + ';',
 '  box-shadow: inset 1px 0 0 rgba(0,255,200,0.15), -4px 0 40px rgba(0,255,200,0.35);',
 '  transform: translateX(100%);',
 '  will-change: transform;',
 '  overflow: hidden;',
 '}',

 /* Door panel texture lines */
 '#elev-L::before, #elev-R::before {',
 '  content: "";',
 '  position: absolute; inset: 0;',
 '  background: repeating-linear-gradient(',
 '    to bottom,',
 '    rgba(255,255,255,0.012) 0px,',
 '    rgba(255,255,255,0.012) 1px,',
 '    transparent 1px,',
 '    transparent 6px',
 '  );',
 '}',

 /* Vertical panel grooves */
 '#elev-L::after {',
 '  content: "";',
 '  position: absolute; top: 0; bottom: 0;',
 '  right: 18%; width: 1px;',
 '  background: linear-gradient(to bottom, transparent, rgba(0,255,200,0.12) 20%, rgba(0,255,200,0.12) 80%, transparent);',
 '}',
 '#elev-R::after {',
 '  content: "";',
 '  position: absolute; top: 0; bottom: 0;',
 '  left: 18%; width: 1px;',
 '  background: linear-gradient(to bottom, transparent, rgba(0,255,200,0.12) 20%, rgba(0,255,200,0.12) 80%, transparent);',
 '}',

 /* Floor indicator panel */
 '#elev-hud {',
 '  position: absolute;',
 '  top: 50%; left: 50%;',
 '  transform: translate(-50%, -50%);',
 '  width: 90px;',
 '  background: #000;',
 '  border: 1px solid ' + NEON + ';',
 '  box-shadow: 0 0 16px rgba(0,255,200,0.4), inset 0 0 10px rgba(0,255,200,0.05);',
 '  padding: 8px 10px 10px;',
 '  text-align: center;',
 '  pointer-events: none;',
 '  opacity: 0;',
 '  z-index: 100000;',
 '  transition: opacity 0.2s;',
 '}',

 '#elev-hud .hud-arrows {',
 '  font-size: 10px;',
 '  color: ' + NEON2 + ';',
 '  letter-spacing: 6px;',
 '  text-shadow: 0 0 8px ' + NEON2 + ';',
 '  margin-bottom: 4px;',
 '}',

 '#elev-floor {',
 '  font-size: 32px;',
 '  color: ' + NEON + ';',
 '  text-shadow: 0 0 14px ' + NEON + ', 0 0 30px rgba(0,255,200,0.4);',
 '  font-family: "VT323", "Courier New", monospace;',
 '  line-height: 1;',
 '  letter-spacing: 2px;',
 '}',

 '#elev-hud .hud-label {',
 '  font-size: 7px;',
 '  color: rgba(0,255,200,0.4);',
 '  letter-spacing: 2px;',
 '  text-transform: uppercase;',
 '  margin-top: 4px;',
 '}',

 /* Neon seam glow between doors */
 '#elev-seam {',
 '  position: absolute;',
 '  top: 0; bottom: 0;',
 '  left: 50%;',
 '  width: 2px;',
 '  transform: translateX(-50%);',
 '  background: ' + SEAM + ';',
 '  box-shadow: 0 0 12px 4px ' + SEAM + ', 0 0 40px 8px rgba(0,255,200,0.3);',
 '  opacity: 0;',
 '  pointer-events: none;',
 '}',

 /* Warning stripes bottom of each door */
 '#elev-L .elev-stripe, #elev-R .elev-stripe {',
 '  position: absolute; bottom: 0; left: 0; right: 0;',
 '  height: 28px;',
 '  background: repeating-linear-gradient(',
 '    -45deg,',
 '    rgba(0,255,200,0.07) 0px, rgba(0,255,200,0.07) 8px,',
 '    transparent 8px, transparent 16px',
 '  );',
 '  border-top: 1px solid rgba(0,255,200,0.15);',
 '}',

 /* Close animation (doors slide to center) */
 '.elev-closing #elev-L {',
 '  transition: transform 0.55s cubic-bezier(0.55, 0, 0.75, 0.05);',
 '  transform: translateX(0);',
 '}',
 '.elev-closing #elev-R {',
 '  transition: transform 0.55s cubic-bezier(0.55, 0, 0.75, 0.05);',
 '  transform: translateX(0);',
 '}',
 '.elev-closing #elev-seam { opacity: 0; transition: opacity 0s 0.5s; }',
 '.elev-closing #elev-hud  { opacity: 1 !important; }',

 /* Open animation (doors slide outward) */
 '.elev-opening #elev-L {',
 '  transform: translateX(0); /* starts here, JS adds transition then removes */',
 '}',
 '.elev-opening #elev-R {',
 '  transform: translateX(0);',
 '}',
 '.elev-opening #elev-seam {',
 '  opacity: 1;',
 '  transition: opacity 0.1s;',
 '}',

 /* Pointer events while active */
 '#elev-overlay.elev-closing,',
 '#elev-overlay.elev-opening {',
 '  pointer-events: all;',
 '}',

    ].join('\n');
    document.head.appendChild(style);

    /* ── BUILD DOM ───────────────────────────────────────────────── */
    var overlay = document.createElement('div');
    overlay.id = 'elev-overlay';
    overlay.innerHTML = [
        '<div id="elev-L"><div class="elev-stripe"></div></div>',
        '<div id="elev-R"><div class="elev-stripe"></div></div>',
        '<div id="elev-seam"></div>',
        '<div id="elev-hud">',
        '  <div class="hud-arrows">▲ ▼</div>',
        '  <div id="elev-floor">--</div>',
        '  <div class="hud-label">FLOOR</div>',
        '</div>',
    ].join('');
    document.body.appendChild(overlay);

    var doorL    = document.getElementById('elev-L');
    var doorR    = document.getElementById('elev-R');
    var hud      = document.getElementById('elev-hud');
    var floorEl  = document.getElementById('elev-floor');
    var seam     = document.getElementById('elev-seam');

    /* ── FLOOR NAMES (map page filenames → floor labels) ─────────── */
    var FLOORS = {
        'home':      'G',
 'index':     'G',
 'about':     '01',
 'terminal':  '02',
 'pics':      '03',
 'dreams':    '04',
 'vids':      '05',
 'streams':   '06',
 'faq':       '07',
 'downloads': '08',
 'leave':     '??',
    };

    function getFloor(href) {
        if (!href) return '--';
        var base = href.split('/').pop().replace('.html','').toLowerCase().split('?')[0].split('#')[0];
        return FLOORS[base] || '??';
    }

    function currentFloor() {
        return getFloor(window.location.pathname);
    }

    /* ── OPEN (on page load) ─────────────────────────────────────── */
    function openDoors() {
        /* Doors start closed, seam visible */
        doorL.style.transform = 'translateX(0)';
        doorR.style.transform = 'translateX(0)';
        seam.style.opacity    = '1';
        hud.style.opacity     = '1';
        floorEl.textContent   = currentFloor();
        overlay.classList.add('elev-opening');
        overlay.style.pointerEvents = 'all';

        /* Small pause so user sees the doors, then slide open */
        setTimeout(function () {
            doorL.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.55, 0.35, 1.0)';
            doorR.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.55, 0.35, 1.0)';
            doorL.style.transform  = 'translateX(-100%)';
            doorR.style.transform  = 'translateX(100%)';
            seam.style.transition  = 'opacity 0.1s 0.25s';
            seam.style.opacity     = '0';
            hud.style.transition   = 'opacity 0.3s 0.1s';
            hud.style.opacity      = '0';
        }, 320);

        setTimeout(function () {
            overlay.classList.remove('elev-opening');
            overlay.style.pointerEvents = 'none';
            doorL.style.transition = '';
            doorR.style.transition = '';
            seam.style.transition  = '';
            hud.style.transition   = '';
        }, 1050);
    }

    /* ── CLOSE then NAVIGATE ─────────────────────────────────────── */
    function closeThenGo(href) {
        if (overlay.style.pointerEvents === 'all') return; /* already animating */
            overlay.style.pointerEvents = 'all';

        var floor = getFloor(href);

        /* Start closing */
        doorL.style.transition = 'transform 0.5s cubic-bezier(0.55, 0, 0.75, 0.05)';
        doorR.style.transition = 'transform 0.5s cubic-bezier(0.55, 0, 0.75, 0.05)';
        doorL.style.transform  = 'translateX(0)';
        doorR.style.transform  = 'translateX(0)';

        /* Seam appears as doors meet */
        setTimeout(function () {
            seam.style.transition = 'opacity 0.12s';
            seam.style.opacity    = '1';
        }, 380);

        /* Show floor indicator */
        setTimeout(function () {
            hud.style.transition  = 'opacity 0.15s';
            hud.style.opacity     = '1';
            floorEl.textContent   = floor;
            /* Brief floor counter flicker */
            var ticks = 0;
            var ti = setInterval(function () {
                floorEl.textContent = ticks % 2 === 0 ? floor : currentFloor();
                ticks++;
                if (ticks > 5) { clearInterval(ti); floorEl.textContent = floor; }
            }, 60);
        }, 420);

        /* Navigate after doors fully closed */
        setTimeout(function () {
            window.location.href = href;
        }, 720);
    }

    /* ── INTERCEPT ALL LOCAL LINKS ───────────────────────────────── */
    document.addEventListener('click', function (e) {
        var el = e.target;
        /* Walk up to find anchor */
        while (el && el.tagName !== 'A') el = el.parentElement;
        if (!el) return;

        var href = el.getAttribute('href');
        if (!href) return;

        /* Skip external, hash-only, mailto, or JS links */
        if (href.startsWith('http') ||
            href.startsWith('mailto') ||
            href.startsWith('javascript') ||
            href === '#' ||
            href.startsWith('#')) return;

        e.preventDefault();
        closeThenGo(href);
    });

    /* ── FIRE OPEN ON LOAD ───────────────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', openDoors);
    } else {
        openDoors();
    }

    /* ── BACK/FORWARD (popstate) ─────────────────────────────────── */
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            /* Page loaded from bfcache, re-open doors */
            doorL.style.transition = '';
            doorR.style.transition = '';
            doorL.style.transform  = 'translateX(0)';
            doorR.style.transform  = 'translateX(0)';
            hud.style.opacity      = '1';
            floorEl.textContent    = currentFloor();
            seam.style.opacity     = '1';
            setTimeout(openDoors, 50);
        }
    });

})();
