/* CodeCrafix shop: live products from Supabase, free downloads and Razorpay checkout.
   Products are managed in /admin. If Supabase cannot be reached the static list in store-data.js is shown instead.
   While the live data loads, the page shows a neutral skeleton, so the old built-in cards never flash before the real ones. */
(function () {
  var CFG = window.CODECRAFIX_CONFIG || {}, SB = CFG.supabase || {};
  if (!SB.url || !SB.anonKey) { return; }
  var BASE = SB.url.replace(/\/$/, ''), REST = BASE + '/rest/v1', FN = BASE + '/functions/v1';
  var HDR = { apikey: SB.anonKey, Authorization: 'Bearer ' + SB.anonKey };
  var CAT = { game: ['🎮', 'Game'], app: ['📱', 'App'], tool: ['🛠️', 'Tool'], prompt: ['✨', 'Prompt'], code: ['💻', 'Code'], other: ['📦', 'Other'] };
  var COLS = 'id,slug,title,category,short_desc,price_inr,compare_price_inr,cover_url,file_format,version,placements,sort_order,created_at';
  var PRODUCTS = [];

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
  function isFree(p) { return !(Number(p.price_inr) > 0); }
  function has(k) { return function (p) { return p.placements && p.placements.indexOf(k) > -1; }; }
  function toast(t) { var d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600); }
  function get(path) { return fetch(REST + path, { headers: HDR }).then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); }); }
  function post(fn, body) {
    return fetch(FN + '/' + fn, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SB.anonKey }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, data: d }; }); });
  }

  /* ---------- no-flash loading state ----------
     Runs as soon as this script loads (before app.js draws the built-in cards). */
  var DOC = document.documentElement;
  var onHome = !!$('#cf-featured-grid'), onStore = !!$('#cf-store-grid');
  var needProducts = onHome || onStore || $('#cf-newsletter') || $('[data-shop-placement]');
  if (onHome || onStore) {
    var sk = document.createElement('style');
    sk.textContent =
      '#cf-featured-grid:not(.cf-live)>*,#cf-store-grid:not(.cf-live)>*{display:none!important}' +
      '#cf-featured-grid:not(.cf-live),#cf-store-grid:not(.cf-live){min-height:340px}' +
      '#cf-featured-grid:not(.cf-live)::before,#cf-featured-grid:not(.cf-live)::after,#cf-store-grid:not(.cf-live)::before,#cf-store-grid:not(.cf-live)::after{content:"";display:block;height:340px;border-radius:18px;border:1px solid rgba(34,197,94,.12);background:linear-gradient(100deg,rgba(255,255,255,.04) 30%,rgba(255,255,255,.11) 50%,rgba(255,255,255,.04) 70%);background-size:200% 100%;animation:cfsk 1.2s linear infinite}' +
      '@keyframes cfsk{to{background-position:-200% 0}}' +
      '#cf-filters:not(.cf-live){visibility:hidden}' +
      'html.cf-pending-home #store .section-head,html.cf-pending-store main>section:first-child .section-head{visibility:hidden}';
    document.head.appendChild(sk);
    DOC.classList.add(onHome ? 'cf-pending-home' : 'cf-pending-store');
  }
  function live() {
    DOC.classList.remove('cf-pending-home', 'cf-pending-store');
    ['cf-featured-grid', 'cf-store-grid', 'cf-filters'].forEach(function (id) { var e = document.getElementById(id); if (e) { e.classList.add('cf-live'); } });
  }

  /* start the network request right away; the page is drawn once app.js is done */
  var PRODUCTS_REQ = needProducts ? get('/products?select=' + COLS + '&is_published=eq.true&order=sort_order.desc,created_at.desc') : null;
  var REVIEWS_REQ = $('#cf-reviews-grid') ? get('/reviews?select=id,name,role,rating,message,created_at&status=eq.approved&order=created_at.desc&limit=30') : null;
  if (PRODUCTS_REQ) { PRODUCTS_REQ.catch(function () {}); }
  if (REVIEWS_REQ) { REVIEWS_REQ.catch(function () {}); }

  /* ---------- product card ---------- */
  function card(p, i) {
    var free = isFree(p), c = CAT[p.category] || CAT.other;
    var thumb = p.cover_url
      ? '<img src="' + esc(p.cover_url) + '" alt="' + esc(p.title) + '" ' + (i < 6 ? 'loading="eager"' : 'loading="lazy"') + ' decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">'
      : '<span aria-hidden="true" style="font-size:3rem">' + c[0] + '</span>';
    var price = free ? 'Free' : money(p.price_inr) + (Number(p.compare_price_inr) > Number(p.price_inr) ? ' <s style="opacity:.65;font-weight:500">' + money(p.compare_price_inr) + '</s>' : '');
    return '<article class="card product-card reveal in" id="' + esc(p.slug) + '"><div class="p-thumb"><span class="p-cat">' + c[1] + '</span><span class="p-price' + (free ? ' free' : '') + '">' + price + '</span>' + thumb + '</div>' +
      '<div class="product-body"><h3>' + esc(p.title) + '</h3><p>' + esc(p.short_desc || '') + '</p>' +
      '<div class="p-meta"><span>' + esc(p.file_format || c[1]) + '</span><span>' + (free ? 'Free' : 'Paid') + (p.version ? ' · ' + esc(p.version) : '') + '</span></div>' +
      '<div class="p-actions"><button type="button" class="btn btn-sm btn-primary" data-shop-act="' + (free ? 'free' : 'buy') + '" data-pid="' + esc(p.id) + '">' + (free ? 'Download Free' : 'Buy ' + money(p.price_inr)) + '</button>' +
      '<button class="p-link" type="button" data-copy="store.html#' + esc(p.slug) + '" aria-label="Copy link">&#128279;</button></div></div></article>';
  }
  function layout(el, n, max) {
    el.style.gridTemplateColumns = 'repeat(auto-fit,minmax(230px,1fr))';
    el.style.maxWidth = (Math.min(Math.max(n, 1), max) * 300) + 'px';
    el.style.margin = '0 auto';
  }
  function section(id, eyebrow, title, list, before) {
    var s = document.createElement('section'); s.className = 'section'; s.id = id; s.style.paddingTop = '10px';
    s.innerHTML = '<div class="container"><div class="section-head"><span class="eyebrow">' + eyebrow + '</span><h2 class="mt-2">' + title + '</h2></div><div class="product-grid">' + list.map(card).join('') + '</div></div>';
    before.parentNode.insertBefore(s, before);
    layout($('.product-grid', s), list.length, 4);
  }

  /* ---------- placements ---------- */
  function render(list) {
    PRODUCTS = list;
    var home = $('#cf-featured-grid');
    if (home) {
      var h = list.filter(has('home')).sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; }).slice(0, 4);
      if (h.length) {
        home.innerHTML = h.map(card).join(''); layout(home, h.length, 4);
        var hd = $('#store .section-head');
        if (hd) { $('h2', hd).textContent = 'New in the store'; $('p', hd).textContent = 'The latest games, apps, tools and code from CodeCrafix — free downloads and premium products.'; }
      }
    }
    var sg = $('#cf-store-grid');
    if (sg) {
      var items = list.filter(has('store')), fb = $('#cf-filters'), nfb = fb;
      if (fb) { nfb = fb.cloneNode(false); fb.parentNode.replaceChild(nfb, fb); }
      var draw = function (f) {
        var l = items.filter(function (p) { return f === 'all' || (f === 'free' && isFree(p)) || (f === 'paid' && !isFree(p)) || p.category === f; });
        sg.innerHTML = l.map(card).join('') || '<div class="empty-state">Nothing here yet.</div>';
      };
      sg.style.gridTemplateColumns = 'repeat(auto-fill,minmax(250px,1fr))'; sg.style.maxWidth = '1100px';
      if (nfb) {
        var f = [['all', '⭐ All']];
        if (items.some(isFree)) { f.push(['free', '🆓 Free']); }
        if (items.some(function (p) { return !isFree(p); })) { f.push(['paid', '💳 Paid']); }
        Object.keys(CAT).forEach(function (k) { if (items.some(function (p) { return p.category === k; })) { f.push([k, CAT[k][0] + ' ' + CAT[k][1]]); } });
        nfb.innerHTML = f.map(function (x, i) { return '<button type="button" class="filter-btn' + (i ? '' : ' active') + '" data-filter="' + x[0] + '">' + x[1] + '</button>'; }).join('');
        nfb.addEventListener('click', function (e) {
          var b = e.target.closest('.filter-btn'); if (!b) { return; }
          Array.prototype.forEach.call(nfb.querySelectorAll('.filter-btn'), function (x) { x.classList.toggle('active', x === b); });
          draw(b.getAttribute('data-filter'));
        });
      }
      draw('all');
      var oldFeat = document.getElementById('cf-shop-featured'); if (oldFeat) { oldFeat.remove(); }
      var fe = list.filter(has('featured'));
      if (fe.length && nfb) {
        var w = document.createElement('div'); w.id = 'cf-shop-featured'; w.style.cssText = 'margin-bottom:36px';
        w.innerHTML = '<h2 style="font-size:1.3rem;text-align:center;margin-bottom:18px">⭐ Featured</h2><div class="product-grid">' + fe.map(card).join('') + '</div>';
        nfb.parentNode.insertBefore(w, nfb); layout($('.product-grid', w), fe.length, 4);
      }
      var h1 = $('h1'); if (h1 && items.length) { h1.innerHTML = 'Games, apps, tools &amp; <span class="grad-text">code</span>'; var sp = h1.parentNode.querySelector('p'); if (sp) { sp.textContent = 'Download free products instantly, or buy premium ones securely. Every card shows clearly if it is free or paid.'; } }
    }
    var news = $('#cf-newsletter'), tut = news && news.closest('section'), tl = list.filter(has('tutorials'));
    var oldTut = document.getElementById('cf-shop-tutorials'); if (oldTut) { oldTut.remove(); }
    if (tut && tl.length) { section('cf-shop-tutorials', 'Free resources', 'Downloads &amp; resources', tl, tut); }
    Array.prototype.forEach.call(document.querySelectorAll('[data-shop-placement]'), function (el) {
      var l = list.filter(has(el.getAttribute('data-shop-placement'))).slice(0, +el.getAttribute('data-limit') || 8);
      el.innerHTML = l.map(card).join(''); layout(el, l.length, 4);
    });
  }

  /* ---------- modal ---------- */
  var st = document.createElement('style');
  st.textContent = '.cfm-ov{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:grid;place-items:center;padding:16px}.cfm{position:relative;width:100%;max-width:420px;background:linear-gradient(180deg,#111c16,#0a120e);border:1px solid rgba(34,197,94,.3);border-radius:20px;padding:26px 22px;box-shadow:0 30px 80px rgba(0,0,0,.6);max-height:92vh;overflow:auto}.cfm h3{font-size:1.2rem;margin-bottom:4px}.cfm .pr{font-size:1.6rem;font-weight:800;color:#4ade80;margin:6px 0 14px}.cfm-x{position:absolute;right:12px;top:10px;background:none;border:0;color:#9db3a6;font-size:1.6rem;cursor:pointer;line-height:1}.cfm .field{margin-bottom:12px}.cfm small{display:block;margin-top:10px;color:#8fa79a;font-size:.78rem}.cfm .ok{font-size:2.4rem}.cfm .linkbox{word-break:break-all;font-size:.78rem;background:#0b120e;border:1px solid rgba(34,197,94,.25);border-radius:10px;padding:10px;margin-top:10px;color:#cfe8d9}';
  document.head.appendChild(st);
  function modal(html) {
    var o = document.createElement('div'); o.className = 'cfm-ov';
    o.innerHTML = '<div class="cfm" role="dialog" aria-modal="true"><button class="cfm-x" type="button" aria-label="Close">×</button><div class="cfm-body">' + html + '</div></div>';
    document.body.appendChild(o);
    o.addEventListener('click', function (e) { if (e.target === o || e.target.classList.contains('cfm-x')) { o.remove(); } });
    return { o: o, set: function (h) { $('.cfm-body', o).innerHTML = h; }, q: function (s) { return $(s, o); } };
  }

  /* ---------- delivery ---------- */
  function deliver(d) {
    if (d.type === 'file') { location.href = d.url; return; }
    var w = window.open(d.url, '_blank', 'noopener'); if (!w) { location.href = d.url; }
  }
  function freeDownload(p, btn) {
    var old = btn.textContent; btn.disabled = true; btn.textContent = 'Preparing…';
    post('get-download', { product_id: p.id }).then(function (r) {
      btn.disabled = false; btn.textContent = old;
      if (r.ok && r.data.url) { deliver(r.data); } else { toast('Download is not available right now. Please try again or contact us.'); }
    }).catch(function () { btn.disabled = false; btn.textContent = old; toast('Network error. Please try again.'); });
  }
  function success(m, p, d) {
    var link = location.origin + '/download?o=' + encodeURIComponent(d.order_id) + '&t=' + encodeURIComponent(d.token);
    m.set('<div class="center"><div class="ok">✅</div><h3>Payment successful</h3><p>Thank you! <b>' + esc(p.title) + '</b> is ready.</p></div>' +
      '<button class="btn btn-primary btn-block" id="cfm-dl" type="button" style="margin-top:16px">Download now</button>' +
      '<small>Save this link to download again later:</small><div class="linkbox">' + esc(link) + '</div>' +
      '<button class="btn btn-outline btn-sm" id="cfm-copy" type="button" style="margin-top:10px">Copy link</button>');
    m.q('#cfm-dl').onclick = function () {
      post('get-download', { order_id: d.order_id, token: d.token }).then(function (r) { if (r.ok && r.data.url) { deliver(r.data); } else { toast('Could not start the download. Use the saved link or contact us.'); } });
    };
    m.q('#cfm-copy').onclick = function () { if (navigator.clipboard) { navigator.clipboard.writeText(link).then(function () { toast('Link copied'); }); } };
  }
  function loadRz() {
    return new Promise(function (res, rej) {
      if (window.Razorpay) { return res(); }
      var s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  function openBuy(p) {
    var m = modal('<h3>' + esc(p.title) + '</h3><div class="pr">' + money(p.price_inr) + '</div>' +
      '<div class="field"><label for="cfm-name">Your name</label><input class="input" id="cfm-name" autocomplete="name" maxlength="80"></div>' +
      '<div class="field"><label for="cfm-email">Email <span class="req">*</span></label><input class="input" id="cfm-email" type="email" autocomplete="email" placeholder="you@example.com"></div>' +
      '<button class="btn btn-primary btn-block" id="cfm-pay" type="button">Pay ' + money(p.price_inr) + ' securely</button>' +
      '<div class="form-msg" id="cfm-msg" hidden></div>' +
      '<small>&#128274; Secure payment by Razorpay (UPI, cards, net banking, wallets). Your download link appears right after payment.</small>');
    var msg = function (t) { var e = m.q('#cfm-msg'); e.hidden = false; e.className = 'form-msg err'; e.textContent = t; };
    m.q('#cfm-pay').onclick = function () {
      var email = m.q('#cfm-email').value.trim(), name = m.q('#cfm-name').value.trim(), btn = m.q('#cfm-pay');
      if (!/^\S+@\S+\.\S{2,}$/.test(email)) { return msg('Please enter a valid email address.'); }
      btn.disabled = true; btn.textContent = 'Please wait…';
      post('create-order', { product_id: p.id, email: email, name: name }).then(function (r) {
        if (r.status === 503) { btn.disabled = false; btn.textContent = 'Pay ' + money(p.price_inr) + ' securely'; return msg('Online payments are being activated. Please contact us at ' + (CFG.contact && CFG.contact.email || 'our email') + ' to buy this now.'); }
        if (!r.ok) { btn.disabled = false; btn.textContent = 'Pay ' + money(p.price_inr) + ' securely'; return msg('Could not start the payment. Please try again.'); }
        var o = r.data;
        return loadRz().then(function () {
          var rz = new window.Razorpay({
            key: o.key_id, amount: o.amount, currency: o.currency, order_id: o.order_id, name: 'CodeCrafix', description: o.product_title,
            prefill: { name: name, email: email }, theme: { color: '#22c55e' },
            handler: function (resp) {
              m.set('<div class="center"><div class="ok">⏳</div><h3>Verifying payment…</h3></div>');
              post('verify-payment', resp).then(function (v) {
                if (v.ok && v.data.token) { success(m, p, v.data); } else { m.set('<h3>We could not confirm the payment</h3><p>If money was deducted, do not worry — email us your Razorpay payment ID <b>' + esc(resp.razorpay_payment_id) + '</b> and we will deliver it.</p>'); }
              });
            },
            modal: { ondismiss: function () { btn.disabled = false; btn.textContent = 'Pay ' + money(p.price_inr) + ' securely'; } }
          });
          rz.open();
        });
      }).catch(function () { btn.disabled = false; btn.textContent = 'Pay ' + money(p.price_inr) + ' securely'; msg('Network error. Please try again.'); });
    };
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-shop-act]'); if (!b) { return; }
    var p = PRODUCTS.filter(function (x) { return x.id === b.getAttribute('data-pid'); })[0]; if (!p) { return; }
    if (b.getAttribute('data-shop-act') === 'free') { freeDownload(p, b); } else { openBuy(p); }
  });

  /* ---------- approved reviews ---------- */
  function stars(n) { return '&#9733;'.repeat(n) + '&#9734;'.repeat(5 - n); }
  function renderReviews(list) {
    var g = $('#cf-reviews-grid'); if (!g || !list.length) { return; }
    g.innerHTML = list.map(function (r) {
      var ini = String(r.name || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
      var dt = ''; try { dt = new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch (e) {}
      return '<article class="card review-card"><div class="review-head"><span class="avatar">' + esc(ini) + '</span><div><b>' + esc(r.name) + '</b><span class="role">' + esc(r.role || 'Customer') + '</span></div></div><div class="stars" aria-label="' + r.rating + ' out of 5">' + stars(r.rating) + '</div><p>' + esc(r.message) + '</p><div class="review-date">' + esc(dt) + '</div></article>';
    }).join('');
    var s = $('#cf-review-summary');
    if (s) { var avg = list.reduce(function (a, r) { return a + r.rating; }, 0) / list.length; s.innerHTML = '<div class="rs-block"><span class="rs-score">' + avg.toFixed(1) + '</span><span class="rs-sub">out of 5</span></div><div class="rs-side"><div class="stars">' + stars(Math.round(avg)) + '</div><span class="tiny muted">Based on ' + list.length + ' review' + (list.length > 1 ? 's' : '') + '</span></div>'; }
  }

  function start() {
    if (PRODUCTS_REQ) {
      var timer = setTimeout(live, 5000); /* safety: never leave the skeleton up if the network is slow */
      PRODUCTS_REQ.then(function (list) { clearTimeout(timer); render(list); live(); })
        .catch(function () { clearTimeout(timer); live(); });
    }
    if (REVIEWS_REQ) { REVIEWS_REQ.then(renderReviews).catch(function () {}); }
  }
  /* run after app.js has drawn the page */
  function boot() { setTimeout(start, 0); }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
