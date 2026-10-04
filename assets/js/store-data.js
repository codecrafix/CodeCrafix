/* Store catalogue, tutorials and blog cards. Edit the lists below.
   Product fields: id, title, category, price (0 = Free), emoji, desc, format, version,
   url (payment / download link; empty = the button opens an email to you), featured (show on home).
   `emoji` holds the cover <img>. Upload your real poster as assets/img/<n>.png (or .jpg / .jpeg / .webp)
   and it is used automatically; until then the built-in assets/img/<n>.svg illustration is shown.
   `sample: true` items are demo content and are hidden when showSampleContent is false in config.js. */
function cfCover(name, alt) {
  return '<img src="assets/img/' + name + '.png" alt="' + alt + '" loading="lazy" data-n="' + name + '" ' +
    'onerror="var e=[\'jpg\',\'jpeg\',\'webp\',\'svg\'],i=+(this.dataset.i||0);if(i>=e.length){this.onerror=null;return;}this.dataset.i=i+1;this.src=\'assets/img/\'+this.dataset.n+\'.\'+e[i]" ' +
    'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">';
}
window.CODECRAFIX_STORE = {
  categories: ['All', 'Games'],
  products: [
    { id: 'dino-runner', title: 'Dino Runner — Classic T-Rex Game', category: 'Games', price: 0, featured: true,
      emoji: cfCover('dino-runner', 'Dino Runner cover'),
      desc: 'Relive the classic Chrome Dino Runner! Dodge obstacles, beat your high score and enjoy endless offline fun. Free to download on the Amazon Appstore.',
      format: 'Amazon Appstore', version: 'v1.0', url: 'https://www.amazon.com/dp/B0DXLCH91F/ref=apps_sf_sta' },
    { id: 'bubble-shooter', title: 'Bubble Shooter — Pop & Blast', category: 'Games', price: 0, featured: true,
      emoji: cfCover('bubble-shooter', 'Bubble Shooter cover'),
      desc: 'A colourful puzzle game where you match and pop 3 or more bubbles. Simple controls, fun animation and classic arcade action. Free to download on the Amazon Appstore.',
      format: 'Amazon Appstore', version: 'v1.0', url: 'https://www.amazon.com/gp/product/B0FFGW6GQB' }
  ],
  /* Tutorials: videos only play on YouTube. The site shows thumbnail + title + link. */
  videos: [
    { id: '6eaQUQS88XY', icon: '▶', url: 'https://youtu.be/6eaQUQS88XY?si=srL7_Zzly9ZdQLr8',
      title: '💰 Earn from Card Game Created with ChatGPT! #ai',
      desc: 'Turn a ChatGPT-built card game into a real source of income.' },
    { id: 'Kc2Ru8XF-yU', icon: '▶', url: 'https://youtu.be/Kc2Ru8XF-yU?si=C-176XffrIhQHk_X',
      title: '🔥 Make Dino Game with ChatGPT — Secret Level UNLOCKED #chatgpt',
      desc: 'Build the classic dino runner from scratch and unlock a hidden level.' },
    { id: 'fqMYwYDq4YI', icon: '▶', url: 'https://youtu.be/fqMYwYDq4YI?si=VDZaKVwB-SOVOLce',
      title: '🔥 Convert PUBG-Style Game into Mobile App — No Coding Needed!',
      desc: 'Turn a PUBG-style project into a publishable mobile app, no coding.' },
    { id: 'eD5b_4mKygI', icon: '▶', url: 'https://youtu.be/eD5b_4mKygI?si=MbtXQ9Oub38aZAjM',
      title: 'I Built a Bubble Shooter Game with ChatGPT',
      desc: 'A complete bubble shooter game built end to end with ChatGPT.' }
  ],
  blog: [
    { icon: '', url: '', tag: 'Publishing', date: '22-Sept-2026',
      title: 'Do You Really Need a Play Console Account?',
      desc: 'Publishing without the paperwork — what is possible, what is not, and how to stay compliant.' },
    { icon: '', url: '', tag: 'Monetisation', date: '12-Sept-2026',
      title: 'AdMob in 2026: What Changed for Indie Devs',
      desc: 'Updated policy notes, eCPM expectations and the ad formats worth your time.' },
    { icon: '', url: '', tag: 'Development', date: '30-Aug-2026',
      title: 'Reskinning a Template Without Breaking It',
      desc: 'A practical checklist for swapping art, audio and config in a purchased template.' }
  ]
};

/* ---- site-wide helpers (this file loads on every page) ---- */
(function () {
  /* favicon on every page */
  try {
    var ic = document.createElement('link'); ic.rel = 'icon'; ic.type = 'image/svg+xml'; ic.href = 'assets/img/logo.svg';
    document.head.appendChild(ic);
  } catch (e) {}
  /* hero images: use your real photo if uploaded (webp/jpg/png), otherwise the built-in illustration */
  function pick(img, base, order) {
    var i = 0;
    (function next() {
      if (i >= order.length) { return; }
      var src = 'images/' + base + '.' + order[i++], p = new Image();
      p.onload = function () { img.onerror = null; img.src = src; };
      p.onerror = next;
      p.src = src;
    })();
  }
  document.addEventListener('DOMContentLoaded', function () {
    var jobs = [['img[alt^="Custom app, game"]', 'custom-dev', ['jpg', 'webp', 'png', 'svg']], ['img[alt*="ublish"]', 'publish', ['webp', 'jpg', 'png', 'svg']]];
    jobs.forEach(function (j) {
      Array.prototype.slice.call(document.querySelectorAll(j[0])).forEach(function (img) { pick(img, j[1], j[2]); });
    });
  });
})();

/* ---- clean URLs + SEO (runs on the live domain only) ----
   /store instead of /store.html, / instead of /index.html, canonical + Open Graph + JSON-LD on every page. */
(function () {
  var ORIGIN = 'https://codecrafix.shop';
  if (!/(^|\.)codecrafix\.shop$/.test(location.hostname)) { return; }

  function cleanHref(href) {
    if (!href || /^(https?:|mailto:|tel:|#|javascript:|\/\/)/i.test(href)) { return null; }
    var h = href.indexOf('#'), hash = h >= 0 ? href.slice(h) : '', rest = h >= 0 ? href.slice(0, h) : href;
    var q = rest.indexOf('?'), query = q >= 0 ? rest.slice(q) : '', path = q >= 0 ? rest.slice(0, q) : rest;
    if (!/^\/?[A-Za-z0-9_-]+\.html$/.test(path)) { return null; }
    var name = path.replace(/^\//, '').replace(/\.html$/, '');
    return (name === 'index' ? '/' : '/' + name) + query + hash;
  }
  function cleanPath() {
    var p = location.pathname.replace(/index\.html$/, '').replace(/\.html$/, '');
    if (!p) { p = '/'; }
    if (p.length > 1) { p = p.replace(/\/$/, ''); }
    return p;
  }
  function setMeta(attr, key, val) {
    if (!val) { return; }
    var e = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (!e) { e = document.createElement('meta'); e.setAttribute(attr, key); document.head.appendChild(e); }
    if (!e.getAttribute('content')) { e.setAttribute('content', val); }
  }
  function ld(obj) {
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  }
  function seo(cur) {
    var url = ORIGIN + (cur === '/' ? '/' : cur);
    var CFG = window.CODECRAFIX_CONFIG || {}, C = CFG.contact || {}, S = CFG.social || {};
    var can = document.head.querySelector('link[rel="canonical"]');
    if (!can) { can = document.createElement('link'); can.rel = 'canonical'; document.head.appendChild(can); }
    can.href = url;
    var title = document.title || 'CodeCrafix';
    var dEl = document.head.querySelector('meta[name="description"]');
    if (!dEl || !dEl.getAttribute('content')) { setMeta('name', 'description', 'CodeCrafix is an independent tech studio in India building mobile apps, games and dev tools, with free tutorials, custom development and app publishing help.'); dEl = document.head.querySelector('meta[name="description"]'); }
    var desc = dEl.getAttribute('content');
    var img = ORIGIN + '/images/hero-mockup.webp';
    var noindex = (cur === '/admin' || cur === '/deploy-guide');
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
    if (noindex) { var r = document.head.querySelector('meta[name="robots"]'); r.setAttribute('content', 'noindex,nofollow'); }
    setMeta('property', 'og:type', 'website'); setMeta('property', 'og:site_name', 'CodeCrafix');
    setMeta('property', 'og:url', url); setMeta('property', 'og:title', title); setMeta('property', 'og:description', desc); setMeta('property', 'og:image', img);
    setMeta('property', 'og:locale', 'en_IN');
    setMeta('name', 'twitter:card', 'summary_large_image'); setMeta('name', 'twitter:title', title); setMeta('name', 'twitter:description', desc); setMeta('name', 'twitter:image', img);
    var og = document.head.querySelector('meta[property="og:url"]'); if (og) { og.setAttribute('content', url); }
    if (noindex) { return; }
    var sameAs = [C.youtube, S.instagram].filter(Boolean);
    if (cur === '/') {
      ld({ '@context': 'https://schema.org', '@type': 'Organization', name: 'CodeCrafix', url: ORIGIN + '/', logo: ORIGIN + '/assets/img/logo.svg', email: C.email, founder: { '@type': 'Person', name: 'Vivek Barman' }, sameAs: sameAs });
      ld({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'CodeCrafix', url: ORIGIN + '/' });
    } else {
      ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN + '/' },
        { '@type': 'ListItem', position: 2, name: title.split(' | ')[0].split(' — ')[0], item: url }] });
    }
    if (cur === '/store') {
      var P = (window.CODECRAFIX_STORE || {}).products || [];
      ld({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: P.filter(function (p) { return !p.sample; }).map(function (p, i) {
        return { '@type': 'ListItem', position: i + 1, item: { '@type': 'SoftwareApplication', name: p.title, description: p.desc, applicationCategory: 'GameApplication', operatingSystem: 'Android', url: p.url || url, offers: { '@type': 'Offer', price: String(p.price || 0), priceCurrency: 'USD' } } };
      }) });
    }
  }
  function run() {
    var cur = cleanPath();
    Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (a) {
      var c = cleanHref(a.getAttribute('href')); if (c) { a.setAttribute('href', c); }
    });
    Array.prototype.forEach.call(document.querySelectorAll('.nav-links a'), function (a) {
      a.classList.toggle('active', a.getAttribute('href') === cur);
    });
    try {
      if (cur !== location.pathname) { history.replaceState(null, '', cur + location.search + location.hash); }
    } catch (e) {}
    try { seo(cur); } catch (e) {}
  }
  if (document.readyState === 'complete') { run(); } else { window.addEventListener('load', run); }
})();
