/* CodeCrafix site script: header/footer, store, reviews, forms, admin, guide checklist */
(function () {
  'use strict';
  var CFG = window.CODECRAFIX_CONFIG || {};
  var C = CFG.contact || {};
  var STORE = window.CODECRAFIX_STORE || { products: [], videos: [], blog: [], categories: ['All'] };
  var SEED = window.CODECRAFIX_REVIEWS || [];
  document.documentElement.classList.add('js');

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function page() { var p = location.pathname.split('/').pop(); return p || 'index.html'; }
  function ls(k, v) { try { if (v === undefined) { return JSON.parse(localStorage.getItem(k)); } localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function msg(el, text, err) { if (!el) { return; } el.hidden = false; el.textContent = text; el.className = 'form-msg' + (err ? ' err' : ''); }

  /* ---------- header + footer ---------- */
  var NAV = [['index.html', 'Home'], ['store.html', 'Store'], ['custom-dev.html', 'Custom Dev'], ['publish-app.html', 'Publish App'], ['tutorials.html', 'Tutorials']];
  function renderChrome() {
    var h = $('#cf-header');
    if (h) {
      h.innerHTML = '<div class="nav"><a class="brand" href="index.html" aria-label="CodeCrafix home"><img src="assets/img/logo.svg" alt="" width="34" height="34"><span>Code<b>Crafix</b></span></a>' +
        '<nav class="nav-links" aria-label="Main">' + NAV.map(function (n) { return '<a href="' + n[0] + '"' + (page() === n[0] ? ' class="active"' : '') + '>' + n[1] + '</a>'; }).join('') + '</nav>' +
        '<a class="btn btn-primary btn-sm nav-cta" href="store.html">Explore Store</a></div>';
    }
    var f = $('#cf-footer');
    if (f) {
      var yr = new Date().getFullYear();
      f.innerHTML = '<div class="foot"><div><a class="brand" href="index.html"><img src="assets/img/logo.svg" alt="" width="34" height="34"><span>Code<b>Crafix</b></span></a>' +
        '<p>Independent tech studio in India building apps, games and tools. Code. Create. Scale.</p></div>' +
        '<div><h4>Explore</h4><a href="store.html">Store</a><a href="custom-dev.html">Custom Dev</a><a href="publish-app.html">Publish App</a><a href="tutorials.html">Tutorials</a></div>' +
        '<div><h4>Legal</h4><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms &amp; Conditions</a><a href="refund-policy.html">Refund Policy</a><a href="return-policy.html">Return Policy</a><a href="cancellation-policy.html">Cancellation Policy</a></div>' +
        '<div><h4>Contact</h4><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a><a href="' + esc(C.youtube) + '" target="_blank" rel="noopener">YouTube</a><a href="custom-dev.html#hire">Start a project</a></div></div>' +
        '<div class="foot-bottom"><span>&copy; ' + yr + ' CodeCrafix. All rights reserved.</span><span>Made by Vivek Barman &middot; Satna, India</span></div>';
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
  function productCard(p) {
    var price = p.price > 0 ? '&#8377;' + Number(p.price).toLocaleString('en-IN') : 'Free';
    var btn = p.url ? '<a class="btn btn-primary btn-sm" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.cta || 'Get it') + '</a>'
      : '<span class="status-pill warn">Coming soon</span>';
    return '<article class="card product-card reveal"><img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy"><div class="product-body">' +
      '<span class="tag" style="align-self:flex-start">' + esc(p.category) + '</span><h3>' + esc(p.title) + '</h3><p>' + esc(p.desc) + '</p>' +
      '<div class="product-meta"><span class="price">' + price + '</span>' + btn + '</div></div></article>';
  }
  function renderStore() {
    var fg = $('#cf-featured-grid');
    if (fg) { fg.innerHTML = STORE.products.filter(function (p) { return p.featured; }).map(productCard).join('') || '<div class="empty-state">New products landing soon.</div>'; }
    var sg = $('#cf-store-grid'), fb = $('#cf-filters');
    if (!sg) { return; }
    function draw(cat) {
      var list = STORE.products.filter(function (p) { return cat === 'All' || p.category === cat; });
      sg.innerHTML = list.map(productCard).join('') || '<div class="empty-state">Nothing in this category yet.</div>';
      $$('.reveal', sg).forEach(function (e) { e.classList.add('in'); });
    }
    if (fb) {
      fb.innerHTML = STORE.categories.map(function (c, i) { return '<button type="button" class="filter-btn' + (i === 0 ? ' active' : '') + '" data-filter="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
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
  function stars(n) { return '&#9733;'.repeat(n) + '<span style="color:#2a3a31">' + '&#9733;'.repeat(5 - n) + '</span>'; }
  function approved() { return SEED.concat(stored()).filter(function (r) { return r.status === 'approved' || (!r.status && SEED.indexOf(r) > -1); }); }
  function renderReviews() {
    var g = $('#cf-reviews-grid'); if (!g) { return; }
    var list = approved(), sum = $('#cf-review-summary');
    if (!list.length) { g.innerHTML = '<div class="empty-state">No public reviews yet — be the first to share your experience below.</div>'; if (sum) { sum.innerHTML = ''; } return; }
    g.innerHTML = list.map(function (r) { return '<article class="card review-card"><div class="stars">' + stars(r.rating) + '</div><p>' + esc(r.message) + '</p><div class="review-by"><span class="avatar">' + esc((r.name || '?').charAt(0).toUpperCase()) + '</span><div><b>' + esc(r.name) + '</b><span>' + esc(r.role || 'Verified customer') + '</span></div></div></article>'; }).join('');
    if (sum) { var avg = list.reduce(function (a, r) { return a + r.rating; }, 0) / list.length; sum.innerHTML = '<span class="rs-score">' + avg.toFixed(1) + '</span><div><div class="stars">' + stars(Math.round(avg)) + '</div><span class="tiny muted">' + list.length + ' verified review' + (list.length > 1 ? 's' : '') + '</span></div>'; }
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
