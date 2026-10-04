/* CodeCrafix site script: header/footer, store, reviews, forms, admin, guide checklist */
(function () {
  'use strict';
  var CFG = window.CODECRAFIX_CONFIG || {};
  var C = CFG.contact || {};
  var STORE = window.CODECRAFIX_STORE || { products: [], videos: [], blog: [], categories: ['All'] };
  var SEED = window.CODECRAFIX_REVIEWS || [];
  document.documentElement.classList.add('js');
  if (!document.querySelector('link[href*="theme-v2.css"]')) { var lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = 'assets/css/theme-v2.css?v=20261004d'; document.head.appendChild(lk); }
  /* tweaks: cover badges above the poster, social icon sizing */
  var fx = document.createElement('style');
  fx.textContent = '.p-thumb{overflow:hidden}.p-thumb img{z-index:0}.p-cat,.p-price{z-index:2}' +
    '.social a{text-decoration:none;color:#d8f5e3}.social svg{width:16px;height:16px;display:block}';
  document.head.appendChild(fx);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function page() { var p = location.pathname.split('/').pop(); return p || 'index.html'; }
  function ls(k, v) { try { if (v === undefined) { return JSON.parse(localStorage.getItem(k)); } localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function msg(el, text, err) { if (!el) { return; } el.hidden = false; el.textContent = text; el.className = 'form-msg' + (err ? ' err' : ''); }

  /* ---------- header + footer ---------- */
  var NAV = [['index.html', 'Home'], ['store.html', 'Store'], ['custom-dev.html', 'Custom Dev'], ['publish-app.html', 'Publish App'], ['tutorials.html', 'Tutorials']];
  var LOGO = '<img src="assets/img/logo.svg" alt="" width="36" height="36">';
  var IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
  function renderChrome() {
    var h = $('#cf-header');
    if (h) {
      h.innerHTML = '<div class="nav"><a class="brand" href="index.html" aria-label="CodeCrafix home">' + LOGO + '<span>Code<b>Crafix</b></span></a>' +
        '<nav class="nav-links" aria-label="Main">' + NAV.map(function (n) { return '<a href="' + n[0] + '"' + (page() === n[0] ? ' class="active"' : '') + '>' + n[1] + '</a>'; }).join('') + '</nav>' +
        '<a class="btn btn-primary btn-sm nav-cta" href="store.html">Explore Store</a></div>';
    }
    var f = $('#cf-footer');
    if (f) {
      var S = C.social || {}, soc = '';
      var IG = S.instagram || 'https://www.instagram.com/codecrafix?stkn=MTF4ejJqc3VmcHZzMg==';
      if (C.youtube) { soc += '<a href="' + esc(C.youtube) + '" target="_blank" rel="noopener" aria-label="YouTube">&#9654;</a>'; }
      soc += '<a href="' + esc(IG) + '" target="_blank" rel="noopener" aria-label="Instagram">' + IG_ICON + '</a>';
      if (C.whatsapp) { soc += '<a href="https://wa.me/' + esc(C.whatsapp) + '" target="_blank" rel="noopener" aria-label="WhatsApp">&#128172;</a>'; }
      var legal = [['terms.html', 'Terms & Conditions'], ['privacy.html', 'Privacy Policy'], ['refund-policy.html', 'Refund Policy'], ['return-policy.html', 'Return Policy'], ['cancellation-policy.html', 'Cancellation Policy']];
      f.innerHTML = '<div class="foot">' +
        '<div><a class="foot-logo" href="index.html">' + LOGO.replace('width="36" height="36"', 'width="64" height="64"') + '<span>Code<b>Crafix</b></span></a><p class="foot-about">An independent tech studio building apps, games and dev tools &mdash; and helping creators ship them to the world.</p><div class="social">' + soc + '</div></div>' +
        '<div><h4>Explore</h4><a href="store.html">Digital Store</a><a href="custom-dev.html">Custom Development</a><a href="publish-app.html">Publish Your App</a><a href="tutorials.html">Tutorials</a></div>' +
        '<div><h4>Company</h4><a href="index.html#about">About</a><a href="index.html#services">Services</a><a href="index.html#reviews">Reviews</a><a href="custom-dev.html#hire">Start a project</a></div>' +
        '<div><h4>Legal</h4>' + legal.map(function (l) { return '<a href="' + l[0] + '">' + l[1].replace('&', '&amp;') + '</a>'; }).join('') + '</div></div>' +
        '<div class="foot-bottom"><span>&copy; ' + new Date().getFullYear() + ' CodeCrafix. All rights reserved. Code. Create. Scale.</span><div class="foot-legal">' + legal.map(function (l) { return '<a href="' + l[0] + '">' + l[1].replace('&', '&amp;') + '</a>'; }).join('') + '</div></div>';
    }
  }

  /* ---------- scroll reveal ---------- */
  function reveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .08 });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () { els.forEach(function (e) { e.classList.add('in'); }); }, 2500);
  }

  /* ---------- store ---------- */
  var SHOW_SAMPLE = CFG.showSampleContent !== false;
  function visibleProducts() { return STORE.products.filter(function (p) { return !p.sample || SHOW_SAMPLE; }); }
  function productCard(p) {
    var free = !(p.price > 0);
    var price = free ? 'Free' : '&#8377;' + Number(p.price).toLocaleString('en-IN');
    var label = p.cta || (free ? 'Download Now' : 'Buy Now');
    var cls = 'btn btn-sm btn-primary';
    var href = p.url ? ' href="' + esc(p.url) + '" target="_blank" rel="noopener"'
      : ' href="mailto:' + esc(C.email) + '?subject=' + encodeURIComponent((free ? 'Download request' : 'Purchase request') + ' - ' + p.title) + '"';
    return '<article class="card product-card reveal" id="' + esc(p.id) + '"><div class="p-thumb"><span class="p-cat">' + esc(p.category) + '</span><span class="p-price' + (free ? ' free' : '') + '">' + price + '</span><span aria-hidden="true">' + (p.emoji || '&#127918;') + '</span></div>' +
      '<div class="product-body"><h3>' + esc(p.title) + '</h3><p>' + esc(p.desc) + '</p>' +
      '<div class="p-meta"><span>' + esc(p.format || '') + '</span><span>' + esc(p.version || '') + '</span></div>' +
      '<div class="p-actions"><a class="' + cls + '"' + href + '>' + esc(label) + '</a><button class="p-link" type="button" data-copy="store.html#' + esc(p.id) + '" aria-label="Copy link to ' + esc(p.title) + '">&#128279;</button></div></div></article>';
  }
  function toast(t) { var d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1600); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]'); if (!b) { return; }
    var url = new URL(b.getAttribute('data-copy'), location.href).href;
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { toast('Link copied'); }, function () { window.prompt('Copy this link:', url); }); }
    else { window.prompt('Copy this link:', url); }
  });
  function renderStore() {
    var all = visibleProducts();
    var fg = $('#cf-featured-grid');
    if (fg) { fg.innerHTML = all.filter(function (p) { return p.featured; }).map(productCard).join('') || '<div class="empty-state">New products landing soon.</div>'; }
    var sg = $('#cf-store-grid'), fb = $('#cf-filters');
    if (!sg) { return; }
    function draw(cat) {
      var list = all.filter(function (p) { return cat === 'All' || p.category === cat; });
      sg.innerHTML = list.map(productCard).join('') || '<div class="empty-state">Nothing in this category yet.</div>';
      $$('.reveal', sg).forEach(function (e) { e.classList.add('in'); });
    }
    if (fb) {
      var cats = ['All'].concat(STORE.categories.filter(function (c) { return c !== 'All' && all.some(function (p) { return p.category === c; }); }));
      fb.innerHTML = cats.map(function (c, i) { return '<button type="button" class="filter-btn' + (i === 0 ? ' active' : '') + '" data-filter="' + esc(c) + '">' + (c === 'All' ? '&#11088; ' : '&#127918; ') + esc(c) + '</button>'; }).join('');
      fb.addEventListener('click', function (e) { var b = e.target.closest('.filter-btn'); if (!b) { return; } $$('.filter-btn', fb).forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); draw(b.getAttribute('data-filter')); });
    }
    draw('All');
  }

  /* ---------- tutorials / blog ---------- */
  function mediaCard(m, label) {
    var ext = /^https?:/.test(m.url) ? ' target="_blank" rel="noopener"' : '';
    return '<article class="card media-card reveal"><div class="media-thumb">' + m.icon + '</div><div class="media-body"><h3>' + esc(m.title) + '</h3><p>' + esc(m.desc) + '</p><a class="more" href="' + esc(m.url) + '"' + ext + '>' + label + ' &rarr;</a></div></article>';
  }
  function renderTutorials() {
    var v = $('#cf-videos'); if (v) { v.innerHTML = STORE.videos.map(function (m) { return mediaCard(m, 'Watch on YouTube'); }).join(''); }
    var b = $('#cf-blog'); if (b) { b.innerHTML = STORE.blog.map(function (m) { return mediaCard(m, 'Read more'); }).join(''); }
    var nl = $('#cf-newsletter');
    if (nl) { nl.addEventListener('submit', function (e) { e.preventDefault(); var em = $('input', nl).value.trim(); if (!/^\S+@\S+\.\S+$/.test(em)) { $('input', nl).focus(); return; } location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Newsletter signup') + '&body=' + encodeURIComponent('Please subscribe me: ' + em); }); }
  }

  /* ---------- submit helper (Supabase if configured, else mailto) ---------- */
  function submit(table, row, subject, msgEl, okText) {
    var S = CFG.supabase || {};
    var mail = function () {
      var body = Object.keys(row).map(function (k) { return k + ': ' + row[k]; }).join('\n');
      location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      msg(msgEl, 'Opening your email app with the details filled in. Press Send to complete your request.');
    };
    if (!S.url || !S.anonKey) { return mail(); }
    fetch(S.url.replace(/\/$/, '') + '/rest/v1/' + table, { method: 'POST', headers: { apikey: S.anonKey, Authorization: 'Bearer ' + S.anonKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(row) })
      .then(function (r) { if (!r.ok) { throw new Error(r.status); } msg(msgEl, okText); })
      .catch(function () { mail(); });
  }
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function ok(re, s) { return re.test(s); }
  var EMAIL = /^\S+@\S+\.\S+$/;

  function initCustomDev() {
    var f = $('#cf-customdev-form'); if (!f) { return; }
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var m = $('#cf-cd-msg');
      var row = { name: val('cd-name'), email: val('cd-email'), project_type: val('cd-type'), budget: val('cd-budget'), description: val('cd-desc') };
      if (!row.name || !ok(EMAIL, row.email) || !row.project_type || row.description.length < 10) { return msg(m, 'Please fill name, a valid email, project type and a short description.', true); }
      submit('custom_orders', row, 'Custom project inquiry — ' + row.name, m, 'Thanks! Your inquiry is received. We will reply within 24 hours.');
    });
  }
  function initPublish() {
    var f = $('#cf-publish-form'); if (!f) { return; }
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var m = $('#cf-pub-msg');
      var row = { app_title: val('pub-title'), package_name: val('pub-package'), build_link: val('pub-link'), email: val('pub-email'), plan: val('pub-plan'), admob: val('pub-admob'), notes: val('pub-notes') };
      if (!row.app_title || !/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(row.package_name) || !/^https?:\/\//.test(row.build_link) || !ok(EMAIL, row.email)) { return msg(m, 'Please enter the app title, a valid package name (like com.codecrafix.app), a build link starting with https:// and your email.', true); }
      submit('app_submissions', row, 'App publishing request — ' + row.app_title, m, 'Submitted! We will review your build and reply within 48 hours.');
    });
  }
  function initWhatsApp() {
    if (!C.whatsapp) { $$('[data-wa]').forEach(function (a) { a.style.display = 'none'; }); }
  }

  /* ---------- reviews ---------- */
  var KEY = 'cf_reviews_v1';
  function stored() { return ls(KEY) || []; }
  function stars(n) { return '&#9733;'.repeat(n) + '&#9734;'.repeat(5 - n); }
  function fmtDate(r) { if (r.date) { return r.date; } try { return new Date(r.created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch (e) { return ''; } }
  function initials(n) { return String(n || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join(''); }
  function approved() {
    var seed = SEED.filter(function (r) { return !r.sample || SHOW_SAMPLE; });
    return seed.concat(stored().filter(function (r) { return r.status === 'approved'; }));
  }
  function renderReviews() {
    var g = $('#cf-reviews-grid'); if (!g) { return; }
    var list = approved(), sum = $('#cf-review-summary');
    if (!list.length) { g.innerHTML = '<div class="empty-state">No public reviews yet &mdash; be the first to share your experience below.</div>'; if (sum) { sum.innerHTML = ''; } return; }
    g.innerHTML = list.map(function (r) { return '<article class="card review-card"><div class="review-head"><span class="avatar">' + esc(initials(r.name)) + '</span><div><b>' + esc(r.name) + '</b><span class="role">' + esc(r.role || 'Verified customer') + '</span></div></div><div class="stars" aria-label="' + r.rating + ' out of 5">' + stars(r.rating) + '</div><p>' + esc(r.message) + '</p><div class="review-date">' + esc(fmtDate(r)) + '</div></article>'; }).join('');
    if (sum) { var avg = list.reduce(function (a, r) { return a + r.rating; }, 0) / list.length; sum.innerHTML = '<div class="rs-block"><span class="rs-score">' + avg.toFixed(1) + '</span><span class="rs-sub">out of 5</span></div><div class="rs-side"><div class="stars">' + stars(Math.round(avg)) + '</div><span class="tiny muted">Based on ' + list.length + ' verified review' + (list.length > 1 ? 's' : '') + '</span></div>'; }
  }
  function initReviewForm() {
    var f = $('#cf-review-form'); if (!f) { return; }
    var pick = $('#cf-rating-picker'), hid = $('#rv-rating'), out = $('.rating-val', pick);
    pick.addEventListener('click', function (e) { var b = e.target.closest('.star'); if (!b) { return; } var v = +b.getAttribute('data-v'); hid.value = v; $$('.star', pick).forEach(function (s) { s.classList.toggle('sel', +s.getAttribute('data-v') <= v); }); out.textContent = v + ' / 5'; });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var m = $('#cf-review-msg');
      var row = { id: 'r' + Date.now(), name: val('rv-name'), email: val('rv-email'), role: val('rv-role'), rating: +hid.value || 5, message: val('rv-message'), status: 'pending', created: new Date().toISOString() };
      if (!row.name || row.message.length < 10 || (row.email && !ok(EMAIL, row.email))) { return msg(m, 'Please add your name and a review of at least 10 characters (and a valid email if you add one).', true); }
      var all = stored(); all.push(row); ls(KEY, all);
      var S = CFG.supabase || {};
      if (S.url && S.anonKey) { fetch(S.url.replace(/\/$/, '') + '/rest/v1/reviews', { method: 'POST', headers: { apikey: S.anonKey, Authorization: 'Bearer ' + S.anonKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ name: row.name, email: row.email, role: row.role, rating: row.rating, message: row.message, status: 'pending' }) }).catch(function () {}); }
      f.reset(); msg(m, 'Thank you! Your review is saved as pending and will appear once our team approves it.');
    });
  }

  /* ---------- admin (client-side moderation; see note in README) ---------- */
  function sha256(s) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }); }
  function initAdmin() {
    var login = $('#cf-admin-login'); if (!login) { return; }
    var panel = $('#cf-admin-panel'), filter = 'pending';
    function show(on) { login.hidden = on; panel.hidden = !on; if (on) { draw(); } }
    function draw() {
      var all = stored(), c = { pending: 0, approved: 0, rejected: 0 };
      all.forEach(function (r) { c[r.status] = (c[r.status] || 0) + 1; });
      $('#cf-admin-stats').innerHTML = ['pending', 'approved', 'rejected'].map(function (k) { return '<div class="card card-flat"><b>' + (c[k] || 0) + '</b><span>' + k + '</span></div>'; }).join('') + '<div class="card card-flat"><b>' + all.length + '</b><span>total</span></div>';
      var list = all.filter(function (r) { return filter === 'all' || r.status === filter; }).reverse();
      $('#cf-admin-list').innerHTML = list.map(function (r) { return '<div class="card card-flat admin-item"><div class="row wrap"><b>' + esc(r.name) + '</b><span class="stars">' + stars(r.rating) + '</span><span class="status-pill ' + (r.status === 'rejected' ? 'danger' : r.status === 'pending' ? 'warn' : '') + '">' + r.status + '</span></div><p style="margin-top:8px">' + esc(r.message) + '</p><p class="tiny muted mt-1">' + esc(r.email || 'no email') + '</p><div class="admin-actions"><button class="btn btn-primary btn-sm" data-a="approved" data-id="' + esc(r.id) + '">Approve</button><button class="btn btn-outline btn-sm" data-a="rejected" data-id="' + esc(r.id) + '">Reject</button><button class="btn btn-danger btn-sm" data-a="delete" data-id="' + esc(r.id) + '">Delete</button></div></div>'; }).join('') || '<div class="empty-state">No reviews in this view.</div>';
    }
    $('#cf-admin-list').addEventListener('click', function (e) { var b = e.target.closest('[data-a]'); if (!b) { return; } var all = stored(), id = b.getAttribute('data-id'), a = b.getAttribute('data-a'); all = a === 'delete' ? all.filter(function (r) { return r.id !== id; }) : all.map(function (r) { if (r.id === id) { r.status = a; } return r; }); ls(KEY, all); draw(); });
    $('#cf-admin-filters').addEventListener('click', function (e) { var b = e.target.closest('.filter-btn'); if (!b) { return; } filter = b.getAttribute('data-filter'); $$('#cf-admin-filters .filter-btn').forEach(function (x) { x.classList.toggle('active', x === b); }); draw(); });
    $('#cf-admin-logout').addEventListener('click', function () { sessionStorage.removeItem('cf_admin'); show(false); });
    $('#cf-admin-login-form').addEventListener('submit', function (e) {
      e.preventDefault(); var m = $('#cf-admin-msg'), want = (CFG.admin || {}).passwordHash;
      if (!want) { return msg(m, 'Admin is locked. Set admin.passwordHash in assets/js/config.js first.', true); }
      sha256($('#cf-admin-pw').value).then(function (h) { if (h === want) { sessionStorage.setItem('cf_admin', '1'); show(true); } else { msg(m, 'Wrong passphrase.', true); } });
    });
    if (sessionStorage.getItem('cf_admin') === '1') { show(true); }
  }

  /* ---------- deploy guide checklist ---------- */
  function initGuide() {
    var boxes = $$('.gd-check input'); if (!boxes.length) { return; }
    var K = 'cf_guide_v1', st = ls(K) || {};
    function upd() { var d = boxes.filter(function (b) { return b.checked; }).length; $('#gd-progress-bar').style.width = (d / boxes.length * 100) + '%'; $('#gd-progress-text').textContent = d + ' / ' + boxes.length + ' steps done'; }
    boxes.forEach(function (b) { b.checked = !!st[b.getAttribute('data-id')]; b.addEventListener('change', function () { st[b.getAttribute('data-id')] = b.checked; ls(K, st); upd(); }); });
    $('#gd-reset').addEventListener('click', function () { st = {}; ls(K, st); boxes.forEach(function (b) { b.checked = false; }); upd(); });
    upd();
  }

  function init() {
    renderChrome(); renderStore(); renderTutorials(); renderReviews(); initReviewForm();
    initCustomDev(); initPublish(); initWhatsApp(); initAdmin(); initGuide(); reveal();
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
