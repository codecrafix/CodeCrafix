/* CodeCrafix mobile menu: 3-line toggle, slide-down panel, scrim, hover effects. Loaded on every page via config.js */
(function () {
  var root = document.documentElement;
  var css = '' +
  '.cf-burger,.cf-scrim,.cf-menu-cta{display:none}' +
  '#cf-header .nav-links a{transition:color .2s,background-color .2s,transform .2s,box-shadow .2s}' +
  '#cf-header .nav-links a:hover{color:#4ade80;transform:translateY(-1px)}' +
  '@keyframes cfIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}' +
  '@media(max-width:820px){' +
  '#cf-header .nav{position:relative;flex-wrap:nowrap;gap:10px;padding:10px 16px}' +
  '#cf-header .nav-cta{display:none}' +
  '.cf-burger{display:inline-flex;flex-direction:column;justify-content:center;align-items:center;gap:5px;width:46px;height:46px;margin-left:auto;padding:0;border-radius:14px;border:1px solid rgba(34,197,94,.28);background:rgba(34,197,94,.08);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background-color .25s,border-color .25s,box-shadow .25s,transform .15s}' +
  '.cf-burger span{display:block;width:22px;height:2.5px;border-radius:2px;background:#e9f2ed;transition:transform .3s cubic-bezier(.4,0,.2,1),opacity .2s,width .25s,background-color .2s}' +
  '.cf-burger span:nth-child(2){width:15px;align-self:flex-end;margin-right:12px}' +
  '.cf-burger:hover{border-color:#22c55e;background:rgba(34,197,94,.16);box-shadow:0 0 0 4px rgba(34,197,94,.10),0 8px 22px rgba(34,197,94,.2)}' +
  '.cf-burger:hover span{background:#4ade80}.cf-burger:hover span:nth-child(2){width:22px}' +
  '.cf-burger:active{transform:scale(.94)}' +
  '.cf-burger:focus-visible{outline:2px solid #4ade80;outline-offset:3px}' +
  '#cf-header.cf-open .cf-burger{border-color:#22c55e;background:rgba(34,197,94,.18)}' +
  '#cf-header.cf-open .cf-burger span:nth-child(1){transform:translateY(7.5px) rotate(45deg);background:#4ade80}' +
  '#cf-header.cf-open .cf-burger span:nth-child(2){opacity:0;width:0}' +
  '#cf-header.cf-open .cf-burger span:nth-child(3){transform:translateY(-7.5px) rotate(-45deg);background:#4ade80}' +
  '#cf-header .nav-links{display:flex!important;flex-direction:column;gap:6px;position:absolute;top:calc(100% + 10px);left:12px;right:12px;width:auto!important;margin:0!important;order:0;padding:12px;overflow:visible;border-radius:20px;background:linear-gradient(180deg,rgba(15,28,22,.98),rgba(7,13,10,.98));border:1px solid rgba(34,197,94,.22);box-shadow:0 24px 60px rgba(0,0,0,.6),0 0 0 1px rgba(34,197,94,.06);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-10px) scale(.98);transform-origin:top right;transition:opacity .25s,transform .25s,visibility 0s .25s}' +
  '#cf-header.cf-open .nav-links{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition-delay:0s}' +
  '#cf-header .nav-links a{display:block;padding:14px 16px;font-size:1rem;font-weight:500;border-radius:12px;color:#d6e6dd}' +
  '#cf-header.cf-open .nav-links a{animation:cfIn .35s ease backwards;animation-delay:calc(var(--i,0)*45ms + 60ms)}' +
  '#cf-header .nav-links a:hover{background:rgba(34,197,94,.12);color:#4ade80;transform:translateX(5px);box-shadow:inset 3px 0 0 #22c55e}' +
  '#cf-header .nav-links a.active{background:rgba(34,197,94,.14);color:#4ade80;box-shadow:inset 3px 0 0 #22c55e}' +
  '#cf-header .nav-links a.cf-menu-cta{display:flex;justify-content:center;margin-top:6px;padding:14px 18px;font-weight:700;color:#03120a;background:linear-gradient(135deg,#10b981,#22c55e);border-radius:999px;box-shadow:0 8px 24px rgba(34,197,94,.3)}' +
  '#cf-header .nav-links a.cf-menu-cta:hover,#cf-header .nav-links a.cf-menu-cta.active{color:#03120a;background:linear-gradient(135deg,#10b981,#22c55e);transform:translateY(-2px);box-shadow:0 12px 30px rgba(34,197,94,.45)}' +
  '.cf-scrim{display:block;position:fixed;left:0;top:0;right:0;bottom:0;z-index:40;background:rgba(0,0,0,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .25s,visibility 0s .25s}' +
  '.cf-scrim.on{opacity:1;visibility:visible;pointer-events:auto;transition-delay:0s}' +
  'html.cf-lock{overflow:hidden}' +
  '}' +
  /* while the screen switches between desktop and mobile layout, freeze every transition/animation so nothing flashes or slides */
  'html.cf-switching #cf-header,html.cf-switching #cf-header *,html.cf-switching .cf-scrim{transition:none!important;animation:none!important}' +
  '@media(prefers-reduced-motion:reduce){#cf-header .nav-links,#cf-header .nav-links a,.cf-burger span{transition:none!important;animation:none!important}}';

  /* inject immediately (before the header is drawn) so mobile never flashes the old menu row */
  var st = document.createElement('style'); st.id = 'cf-menu-css'; st.textContent = css;
  (document.head || root).appendChild(st);

  var MQ = window.matchMedia ? window.matchMedia('(max-width:820px)') : null;
  var freezeTimer;
  function freeze() {
    root.classList.add('cf-switching');
    clearTimeout(freezeTimer);
    freezeTimer = setTimeout(function () { root.classList.remove('cf-switching'); }, 220);
  }

  var done = false;
  function build() {
    if (done) { return true; }
    var h = document.getElementById('cf-header');
    if (!h) { return false; }
    var nav = h.querySelector('.nav'), links = h.querySelector('.nav-links');
    if (!nav || !links) { return false; }
    done = true;
    document.head.appendChild(st); /* keep our rules last so they win the cascade */
    links.id = 'cf-menu';
    var cta = document.createElement('a'); cta.className = 'cf-menu-cta'; cta.href = 'store.html'; cta.innerHTML = 'Explore Store &rarr;'; links.appendChild(cta);
    Array.prototype.forEach.call(links.querySelectorAll('a'), function (a, i) { a.style.setProperty('--i', i); });
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'cf-burger'; b.setAttribute('aria-label', 'Open menu'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'cf-menu');
    b.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(b);
    var scrim = document.createElement('div'); scrim.className = 'cf-scrim'; document.body.appendChild(scrim);
    function set(open) {
      h.classList.toggle('cf-open', open); scrim.classList.toggle('on', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false'); b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      root.classList.toggle('cf-lock', open);
    }
    b.addEventListener('click', function () { set(!h.classList.contains('cf-open')); });
    scrim.addEventListener('click', function () { set(false); });
    links.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) { set(false); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); } });
    function onSwitch() { freeze(); if (!MQ || !MQ.matches) { set(false); } }
    if (MQ) { if (MQ.addEventListener) { MQ.addEventListener('change', onSwitch); } else if (MQ.addListener) { MQ.addListener(onSwitch); } }
    window.addEventListener('resize', function () { if (window.innerWidth > 820 && h.classList.contains('cf-open')) { freeze(); set(false); } });
    window.addEventListener('orientationchange', freeze);
    return true;
  }

  /* build the moment the header is drawn (before first paint), with safe fallbacks */
  if (!build()) {
    var obs = null;
    if (window.MutationObserver) {
      obs = new MutationObserver(function () { if (build()) { obs.disconnect(); } });
      obs.observe(root, { childList: true, subtree: true });
    }
    document.addEventListener('DOMContentLoaded', function () { setTimeout(function () { if (build() && obs) { obs.disconnect(); } }, 0); });
    window.addEventListener('load', function () { build(); });
  }
})();
