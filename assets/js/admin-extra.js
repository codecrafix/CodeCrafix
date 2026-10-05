/* CodeCrafix admin: Dashboard, Tutorials, Blog, Reviews, Subscribers and Settings tabs.
   They sit next to the built-in Products / Orders / Inbox tabs of admin.html, so everything is controlled from one place. */
(function () {
  var C = (window.CODECRAFIX_CONFIG || {}).supabase || {};
  if (!C.url || !C.anonKey) { return; }
  var U = C.url.replace(/\/$/, ''), K = C.anonKey;
  var tabs = document.getElementById('tabs'), view = document.getElementById('view');
  if (!tabs || !view) { return; }

  /* ---------- helpers ---------- */
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); };
  var when = function (d) { try { return new Date(d).toLocaleString(); } catch (e) { return ''; } };
  function sess() { try { return JSON.parse(sessionStorage.getItem('cf_sess') || 'null'); } catch (e) { return null; } }
  function fresh() {
    var S = sess();
    if (!S) { return Promise.reject(new Error('Please sign in again.')); }
    if (Date.now() < S.exp) { return Promise.resolve(S); }
    return fetch(U + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: K, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: S.refresh_token }) })
      .then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) { throw new Error('Session expired. Please sign in again.'); }
          d.exp = Date.now() + d.expires_in * 1000 - 60000;
          try { sessionStorage.setItem('cf_sess', JSON.stringify(d)); } catch (e) {}
          return d;
        });
      });
  }
  function api(path, o) {
    o = o || {};
    return fresh().then(function (S) {
      var h = { apikey: K, Authorization: 'Bearer ' + S.access_token, 'Content-Type': 'application/json' };
      if (o.prefer) { h.Prefer = o.prefer; }
      return fetch(U + path, { method: o.method || 'GET', headers: h, body: o.body ? JSON.stringify(o.body) : undefined });
    }).then(function (r) {
      return r.text().then(function (t) {
        var d = null; try { d = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) { throw new Error((d && (d.message || d.error)) || ('Error ' + r.status)); }
        return d;
      });
    });
  }
  function patch(table, id, body) { return api('/rest/v1/' + table + '?id=eq.' + id, { method: 'PATCH', body: body, prefer: 'return=minimal' }); }
  function add(table, body) { return api('/rest/v1/' + table, { method: 'POST', body: body, prefer: 'return=minimal' }); }
  function root() { view.innerHTML = '<div id="x-root"><div class="empty-state">Loading…</div></div>'; return document.getElementById('x-root'); }
  function fail(r, er) { r.innerHTML = '<div class="form-msg err">' + esc(er.message) + '</div>'; }
  function say(el, t, bad) { el.hidden = false; el.className = 'form-msg' + (bad ? ' err' : ''); el.textContent = t; }
  function alertErr(er) { alert(er.message); }
  function videoId(u) {
    var m = String(u || '').trim().match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  var thumb = function (id) { return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; };
  var isUrl = function (s) { return /^https?:\/\/\S+$/i.test(s); };

  /* one click handler for every list: Edit / Show-Hide / status / Delete */
  function wireList(box, list, table, reload, edit, nameOf) {
    box.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) { return; }
      var id = b.getAttribute('data-id'), act = b.getAttribute('data-a');
      var row = list.filter(function (x) { return x.id === id; })[0]; if (!row) { return; }
      if (act === 'edit') { edit(row); window.scrollTo(0, 0); }
      else if (act === 'pub') { patch(table, id, { is_published: b.getAttribute('data-v') === '1' }).then(reload).catch(alertErr); }
      else if (act === 'st') { patch(table, id, { status: b.getAttribute('data-v') }).then(reload).catch(alertErr); }
      else if (act === 'del' && confirm('Delete “' + nameOf(row) + '”? This cannot be undone.')) { api('/rest/v1/' + table + '?id=eq.' + id, { method: 'DELETE' }).then(reload).catch(alertErr); }
    };
  }
  function actions(id, extra) {
    return '<div class="acts">' + extra + '<button class="btn btn-outline btn-sm" data-a="edit" data-id="' + id + '" type="button">Edit</button><button class="btn btn-danger btn-sm" data-a="del" data-id="' + id + '" type="button">Delete</button></div>';
  }
  function pubBtn(id, on, yes, no) {
    return '<button class="btn btn-outline btn-sm" data-a="pub" data-id="' + id + '" data-v="' + (on ? 0 : 1) + '" type="button">' + (on ? no : yes) + '</button>';
  }
  function clickWhenReady(sel, tries) {
    var e = document.querySelector(sel);
    if (e) { e.click(); return; }
    if ((tries == null ? 25 : tries) > 0) { setTimeout(function () { clickWhenReady(sel, (tries == null ? 25 : tries) - 1); }, 150); }
  }

  /* ---------- tab registry ---------- */
  var BTN = {}, FN = {};
  function activate(k) {
    Array.prototype.forEach.call(tabs.querySelectorAll('.filter-btn'), function (x) { x.classList.toggle('active', x === BTN[k]); });
    FN[k]();
  }
  function go(k, then) {
    if (BTN[k]) { activate(k); }
    else { var n = tabs.querySelector('[data-t="' + k + '"]'); if (n) { n.click(); } }
    if (then) { clickWhenReady(then); }
  }
  [['dash', '&#127968; Dashboard', vDash], ['tut', '&#9654;&#65039; Tutorials', vTut], ['blog', '&#128221; Blog', vBlog], ['rev', '&#11088; Reviews', vRev], ['subs', '&#9993;&#65039; Subscribers', vSubs], ['set', '&#9881;&#65039; Settings', vSet]].forEach(function (t) {
    var b = document.createElement('button');
    b.className = 'filter-btn'; b.type = 'button'; b.innerHTML = t[1]; b.setAttribute('data-x', t[0]);
    BTN[t[0]] = b; FN[t[0]] = t[2];
    b.addEventListener('click', function () { activate(t[0]); });
    tabs.appendChild(b);
  });
  var oldRev = tabs.querySelector('[data-t="reviews"]'); if (oldRev) { oldRev.style.display = 'none'; }
  [['dash'], ['products'], ['tut'], ['blog'], ['rev'], ['orders'], ['inbox'], ['subs'], ['set']].forEach(function (k) {
    var b = BTN[k[0]] || tabs.querySelector('[data-t="' + k[0] + '"]'); if (b) { tabs.appendChild(b); }
  });

  /* ---------- dashboard ---------- */
  function vDash() {
    var r = root();
    var q = function (p) { return api('/rest/v1/' + p).catch(function () { return []; }); };
    Promise.all([q('products?select=id,is_published'), q('orders?select=status,amount_inr'), q('reviews?select=status'), q('contact_messages?select=is_read'), q('custom_orders?select=is_read'), q('app_submissions?select=is_read'), q('tutorials?select=is_published'), q('blog_posts?select=is_published'), q('newsletter_subscribers?select=id')]).then(function (a) {
      var P = a[0], O = a[1], R = a[2], M = a[3].concat(a[4], a[5]), T = a[6], B = a[7], S = a[8];
      var live = function (l) { return l.filter(function (x) { return x.is_published; }).length; };
      var paid = O.filter(function (o) { return o.status === 'paid'; }), rev = paid.reduce(function (s, o) { return s + Number(o.amount_inr); }, 0);
      var pend = R.filter(function (x) { return x.status === 'pending'; }).length, unread = M.filter(function (x) { return !x.is_read; }).length;
      var tile = function (n, label, key) { return '<button type="button" class="card" data-go="' + key + '" style="text-align:left;cursor:pointer;color:inherit;font:inherit"><b>' + n + '</b>' + label + '</button>'; };
      var todo = [];
      if (pend) { todo.push(['&#11088; ' + pend + ' review' + (pend > 1 ? 's' : '') + ' waiting for your approval', 'rev']); }
      if (unread) { todo.push(['&#128236; ' + unread + ' unread message' + (unread > 1 ? 's' : '') + ' in the inbox', 'inbox']); }
      if (!live(P)) { todo.push(['&#128230; No product is live yet — publish one', 'products']); }
      r.innerHTML = '<div class="bar"><h2>Dashboard</h2><a class="btn btn-outline btn-sm" href="/" target="_blank" rel="noopener">View website</a></div>' +
        '<div class="stat">' + tile(live(P) + ' / ' + P.length, 'products live', 'products') + tile(paid.length, 'paid orders', 'orders') + tile(money(rev), 'revenue', 'orders') + tile(pend, 'reviews to approve', 'rev') + tile(unread, 'unread messages', 'inbox') + tile(live(T) + ' / ' + T.length, 'tutorials live', 'tut') + tile(live(B) + ' / ' + B.length, 'blog posts live', 'blog') + tile(S.length, 'subscribers', 'subs') + '</div>' +
        '<div class="card card-flat" style="padding:18px;margin-bottom:16px"><h3>Needs your attention</h3>' +
        (todo.length ? todo.map(function (t) { return '<div class="acts" style="align-items:center"><span>' + t[0] + '</span><button class="btn btn-outline btn-sm" data-go="' + t[1] + '" type="button">Open</button></div>'; }).join('') : '<p class="mt-1">All clear. Nothing is waiting for you. &#9989;</p>') + '</div>' +
        '<div class="card card-flat" style="padding:18px"><h3>Quick add</h3><div class="acts">' +
        '<button class="btn btn-primary btn-sm" data-go="products" data-open="#add" type="button">+ Product</button>' +
        '<button class="btn btn-primary btn-sm" data-go="tut" data-open="#x-add" type="button">+ YouTube tutorial</button>' +
        '<button class="btn btn-primary btn-sm" data-go="blog" data-open="#x-add" type="button">+ Blog post</button>' +
        '<button class="btn btn-primary btn-sm" data-go="rev" data-open="#x-add" type="button">+ Review</button></div></div>';
      r.onclick = function (e) {
        var b = e.target.closest('[data-go]'); if (!b) { return; }
        go(b.getAttribute('data-go'), b.getAttribute('data-open'));
      };
    }).catch(function (er) { fail(r, er); });
  }

  /* ---------- tutorials ---------- */
  function vTut() {
    var r = root();
    api('/rest/v1/tutorials?select=*&order=sort_order.desc,created_at.desc').then(function (list) {
      r.innerHTML = '<div class="bar"><h2>YouTube tutorials (' + list.length + ')</h2><button class="btn btn-primary btn-sm" id="x-add" type="button">+ Add tutorial</button></div><div id="x-form"></div><div id="x-list"></div>';
      var box = document.getElementById('x-list');
      box.innerHTML = list.map(function (t) {
        return '<div class="card item"><img src="' + thumb(esc(t.video_id)) + '" alt="" style="width:128px;height:72px"><div class="grow"><h3>' + esc(t.title) + '</h3><div class="mt-1"><span class="pill2 ' + (t.is_published ? '' : 'bad') + '">' + (t.is_published ? 'Live on Tutorials page' : 'Hidden') + '</span></div><p>' + esc(t.description || '') + '</p><p class="kv">' + esc(t.youtube_url) + '</p>' +
          actions(t.id, pubBtn(t.id, t.is_published, 'Show', 'Hide')) + '</div></div>';
      }).join('') || '<div class="empty-state">No tutorials yet. Click “Add tutorial”.</div>';
      var edit = function (t) { tutForm(t, vTut); };
      document.getElementById('x-add').onclick = function () { edit(null); };
      wireList(box, list, 'tutorials', vTut, edit, function (t) { return t.title; });
    }).catch(function (er) { fail(r, er); });
  }
  function tutForm(t, reload) {
    t = t || {};
    var f = document.getElementById('x-form');
    f.innerHTML = '<form id="x-f" class="card card-flat form-card" style="margin-bottom:22px" novalidate><h2>' + (t.id ? 'Edit tutorial' : 'Add a YouTube tutorial') + '</h2>' +
      '<div class="field"><label>YouTube video link *</label><input class="input" id="tt-url" placeholder="https://youtu.be/xxxxxxxxxxx" value="' + esc(t.youtube_url || '') + '"><div class="hint">Paste any YouTube link (watch, youtu.be, shorts). The thumbnail is taken from YouTube automatically.</div><img class="prev" id="tt-prev" alt=""' + (t.video_id ? ' src="' + thumb(esc(t.video_id)) + '"' : ' hidden') + '></div>' +
      '<div class="field"><label>Title *</label><input class="input" id="tt-title" maxlength="160" value="' + esc(t.title || '') + '"></div>' +
      '<div class="field"><label>Short description (shown under the title)</label><input class="input" id="tt-desc" maxlength="400" value="' + esc(t.description || '') + '"></div>' +
      '<div class="field"><div class="chk"><label><input type="checkbox" id="tt-pub"' + (t.id && !t.is_published ? '' : ' checked') + '> Show on the Tutorials page</label></div></div>' +
      '<div class="acts"><button class="btn btn-primary" type="submit">Save tutorial</button><button class="btn btn-outline" id="x-cancel" type="button">Cancel</button></div><div class="form-msg" id="x-msg" hidden></div></form>';
    var url = document.getElementById('tt-url'), prev = document.getElementById('tt-prev'), title = document.getElementById('tt-title'), msg = document.getElementById('x-msg');
    url.oninput = function () {
      var id = videoId(url.value);
      if (id) {
        prev.src = thumb(id); prev.hidden = false;
        if (!title.value.trim()) {
          fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://youtu.be/' + id)).then(function (x) { return x.json(); })
            .then(function (d) { if (d && d.title && !title.value.trim()) { title.value = d.title; } }).catch(function () {});
        }
      } else { prev.hidden = true; }
    };
    document.getElementById('x-cancel').onclick = function () { f.innerHTML = ''; };
    document.getElementById('x-f').onsubmit = function (e) {
      e.preventDefault();
      var id = videoId(url.value), ttl = title.value.trim();
      if (!id) { return say(msg, 'Please paste a valid YouTube video link.', true); }
      if (ttl.length < 2) { return say(msg, 'Please enter a title.', true); }
      var row = { title: ttl, description: document.getElementById('tt-desc').value.trim(), youtube_url: url.value.trim(), video_id: id, is_published: document.getElementById('tt-pub').checked };
      var sb = document.querySelector('#x-f button[type=submit]'); sb.disabled = true; say(msg, 'Saving…');
      (t.id ? patch('tutorials', t.id, row) : add('tutorials', row)).then(reload)
        .catch(function (er) { sb.disabled = false; say(msg, /duplicate|unique/i.test(er.message) ? 'This video is already added.' : er.message, true); });
    };
  }

  /* ---------- blog ---------- */
  function vBlog() {
    var r = root();
    api('/rest/v1/blog_posts?select=*&order=published_on.desc,created_at.desc').then(function (list) {
      r.innerHTML = '<div class="bar"><h2>Blog posts (' + list.length + ')</h2><button class="btn btn-primary btn-sm" id="x-add" type="button">+ Add blog post</button></div><div id="x-form"></div><div id="x-list"></div>';
      var box = document.getElementById('x-list');
      box.innerHTML = list.map(function (b) {
        return '<div class="card item"><div class="grow"><h3>' + esc(b.title) + '</h3><div class="mt-1"><span class="pill2">' + esc(b.tag) + '</span><span class="pill2 ' + (b.is_published ? '' : 'bad') + '">' + (b.is_published ? 'Live' : 'Hidden') + '</span><span class="tiny muted">' + esc(b.published_on) + '</span></div><p>' + esc(b.description || '') + '</p>' + (b.url ? '<p class="kv">' + esc(b.url) + '</p>' : '') +
          actions(b.id, pubBtn(b.id, b.is_published, 'Show', 'Hide')) + '</div></div>';
      }).join('') || '<div class="empty-state">No blog posts yet.</div>';
      var edit = function (b) { blogForm(b, vBlog); };
      document.getElementById('x-add').onclick = function () { edit(null); };
      wireList(box, list, 'blog_posts', vBlog, edit, function (b) { return b.title; });
    }).catch(function (er) { fail(r, er); });
  }
  function blogForm(b, reload) {
    b = b || {};
    var f = document.getElementById('x-form'), today = new Date().toISOString().slice(0, 10);
    f.innerHTML = '<form id="x-f" class="card card-flat form-card" style="margin-bottom:22px" novalidate><h2>' + (b.id ? 'Edit blog post' : 'Add a blog post') + '</h2>' +
      '<div class="field"><label>Title *</label><input class="input" id="bl-title" maxlength="160" value="' + esc(b.title || '') + '"></div>' +
      '<div class="form-row"><div class="field"><label>Tag</label><input class="input" id="bl-tag" maxlength="40" placeholder="Publishing, Monetisation…" value="' + esc(b.tag || 'General') + '"></div><div class="field"><label>Date</label><input class="input" id="bl-date" type="date" value="' + esc(b.published_on || today) + '"></div></div>' +
      '<div class="field"><label>Short description</label><textarea class="textarea" id="bl-desc" maxlength="400" style="min-height:90px">' + esc(b.description || '') + '</textarea></div>' +
      '<div class="field"><label>Link (optional)</label><input class="input" id="bl-url" placeholder="https://… (the card opens this when clicked)" value="' + esc(b.url || '') + '"></div>' +
      '<div class="field"><div class="chk"><label><input type="checkbox" id="bl-pub"' + (b.id && !b.is_published ? '' : ' checked') + '> Show on the Tutorials page</label></div></div>' +
      '<div class="acts"><button class="btn btn-primary" type="submit">Save post</button><button class="btn btn-outline" id="x-cancel" type="button">Cancel</button></div><div class="form-msg" id="x-msg" hidden></div></form>';
    var msg = document.getElementById('x-msg');
    document.getElementById('x-cancel').onclick = function () { f.innerHTML = ''; };
    document.getElementById('x-f').onsubmit = function (e) {
      e.preventDefault();
      var ttl = document.getElementById('bl-title').value.trim(), url = document.getElementById('bl-url').value.trim();
      if (ttl.length < 2) { return say(msg, 'Please enter a title.', true); }
      if (url && !isUrl(url)) { return say(msg, 'The link must start with https://', true); }
      var row = { title: ttl, tag: document.getElementById('bl-tag').value.trim() || 'General', published_on: document.getElementById('bl-date').value || today, description: document.getElementById('bl-desc').value.trim(), url: url || null, is_published: document.getElementById('bl-pub').checked };
      var sb = document.querySelector('#x-f button[type=submit]'); sb.disabled = true; say(msg, 'Saving…');
      (b.id ? patch('blog_posts', b.id, row) : add('blog_posts', row)).then(reload).catch(function (er) { sb.disabled = false; say(msg, er.message, true); });
    };
  }

  /* ---------- reviews ---------- */
  var revFilter = 'all';
  var REVLABEL = { approved: ['Shown on site', ''], pending: ['Waiting for approval', 'warn'], rejected: ['Hidden', 'bad'] };
  function vRev() {
    var r = root();
    api('/rest/v1/reviews?select=*&order=created_at.desc&limit=300').then(function (all) {
      var cnt = function (s) { return all.filter(function (x) { return x.status === s; }).length; };
      var list = all.filter(function (x) { return revFilter === 'all' || x.status === revFilter; });
      var pills = [['all', 'All (' + all.length + ')'], ['pending', 'Waiting (' + cnt('pending') + ')'], ['approved', 'Shown (' + cnt('approved') + ')'], ['rejected', 'Hidden (' + cnt('rejected') + ')']];
      r.innerHTML = '<div class="bar"><h2>Reviews</h2><button class="btn btn-primary btn-sm" id="x-add" type="button">+ Add review</button></div><div id="x-form"></div>' +
        '<div class="tabs" id="x-pills">' + pills.map(function (p) { return '<button class="filter-btn' + (p[0] === revFilter ? ' active' : '') + '" data-f="' + p[0] + '" type="button">' + p[1] + '</button>'; }).join('') + '</div><div id="x-list"></div>';
      document.getElementById('x-pills').onclick = function (e) { var b = e.target.closest('[data-f]'); if (!b) { return; } revFilter = b.getAttribute('data-f'); vRev(); };
      var box = document.getElementById('x-list');
      box.innerHTML = list.map(function (v) {
        var L = REVLABEL[v.status] || [v.status, ''];
        var btns = (v.status !== 'approved' ? '<button class="btn btn-primary btn-sm" data-a="st" data-id="' + v.id + '" data-v="approved" type="button">Show on site</button>' : '') +
          (v.status !== 'rejected' ? '<button class="btn btn-outline btn-sm" data-a="st" data-id="' + v.id + '" data-v="rejected" type="button">Hide</button>' : '');
        return '<div class="card item"><div class="grow"><h3>' + esc(v.name) + ' &middot; ' + '&#9733;'.repeat(v.rating) + '</h3><div class="mt-1"><span class="pill2 ' + L[1] + '">' + L[0] + '</span></div><p>' + esc(v.message) + '</p><p class="kv">' + esc(v.role || '') + ' ' + esc(v.email || '') + ' &middot; ' + esc(when(v.created_at)) + '</p>' + actions(v.id, btns) + '</div></div>';
      }).join('') || '<div class="empty-state">No reviews here.</div>';
      var edit = function (v) { revForm(v, vRev); };
      document.getElementById('x-add').onclick = function () { edit(null); };
      wireList(box, all, 'reviews', vRev, edit, function (v) { return v.name; });
    }).catch(function (er) { fail(r, er); });
  }
  function revForm(v, reload) {
    v = v || {};
    var f = document.getElementById('x-form'), st = v.status || 'approved', rt = v.rating || 5;
    f.innerHTML = '<form id="x-f" class="card card-flat form-card" style="margin-bottom:22px" novalidate><h2>' + (v.id ? 'Edit review' : 'Add a review') + '</h2>' +
      '<div class="form-row"><div class="field"><label>Name *</label><input class="input" id="rv-n" maxlength="80" value="' + esc(v.name || '') + '"></div><div class="field"><label>Role (optional)</label><input class="input" id="rv-r" maxlength="80" placeholder="e.g. Indie Android Developer" value="' + esc(v.role || '') + '"></div></div>' +
      '<div class="form-row"><div class="field"><label>Rating</label><select class="select" id="rv-s">' + [5, 4, 3, 2, 1].map(function (n) { return '<option value="' + n + '"' + (n === rt ? ' selected' : '') + '>' + n + ' star' + (n > 1 ? 's' : '') + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>Visibility</label><select class="select" id="rv-t"><option value="approved"' + (st === 'approved' ? ' selected' : '') + '>Show on website</option><option value="pending"' + (st === 'pending' ? ' selected' : '') + '>Waiting for approval</option><option value="rejected"' + (st === 'rejected' ? ' selected' : '') + '>Hidden</option></select></div></div>' +
      '<div class="field"><label>Review text *</label><textarea class="textarea" id="rv-m" maxlength="1500">' + esc(v.message || '') + '</textarea></div>' +
      '<div class="acts"><button class="btn btn-primary" type="submit">Save review</button><button class="btn btn-outline" id="x-cancel" type="button">Cancel</button></div><div class="form-msg" id="x-msg" hidden></div></form>';
    var msg = document.getElementById('x-msg');
    document.getElementById('x-cancel').onclick = function () { f.innerHTML = ''; };
    document.getElementById('x-f').onsubmit = function (e) {
      e.preventDefault();
      var name = document.getElementById('rv-n').value.trim(), text = document.getElementById('rv-m').value.trim();
      if (name.length < 2) { return say(msg, 'Please enter a name.', true); }
      if (text.length < 10) { return say(msg, 'The review needs at least 10 characters.', true); }
      var row = { name: name, role: document.getElementById('rv-r').value.trim() || null, rating: +document.getElementById('rv-s').value, message: text, status: document.getElementById('rv-t').value };
      var sb = document.querySelector('#x-f button[type=submit]'); sb.disabled = true; say(msg, 'Saving…');
      (v.id ? patch('reviews', v.id, row) : add('reviews', row)).then(reload).catch(function (er) { sb.disabled = false; say(msg, er.message, true); });
    };
  }

  /* ---------- newsletter subscribers ---------- */
  function vSubs() {
    var r = root();
    api('/rest/v1/newsletter_subscribers?select=*&order=created_at.desc&limit=2000').then(function (list) {
      r.innerHTML = '<div class="bar"><h2>Newsletter subscribers (' + list.length + ')</h2><div class="acts" style="margin:0"><button class="btn btn-outline btn-sm" id="x-copy" type="button">Copy all emails</button><button class="btn btn-outline btn-sm" id="x-csv" type="button">Download CSV</button></div></div><div id="x-list"></div>';
      var box = document.getElementById('x-list');
      box.innerHTML = list.map(function (s) {
        return '<div class="card item"><div class="grow"><h3>' + esc(s.email) + '</h3><p class="kv">' + esc(when(s.created_at)) + '</p><div class="acts"><button class="btn btn-danger btn-sm" data-a="del" data-id="' + s.id + '" type="button">Remove</button></div></div></div>';
      }).join('') || '<div class="empty-state">No subscribers yet. The form on the Tutorials page saves here.</div>';
      wireList(box, list, 'newsletter_subscribers', vSubs, function () {}, function (s) { return s.email; });
      document.getElementById('x-copy').onclick = function () {
        var t = list.map(function (s) { return s.email; }).join(', ');
        if (navigator.clipboard) { navigator.clipboard.writeText(t).then(function () { alert('Copied ' + list.length + ' emails'); }); } else { window.prompt('Copy:', t); }
      };
      document.getElementById('x-csv').onclick = function () {
        var csv = 'email,subscribed_at\n' + list.map(function (s) { return s.email + ',' + s.created_at; }).join('\n');
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'codecrafix-subscribers.csv'; document.body.appendChild(a); a.click(); a.remove();
      };
    }).catch(function (er) { fail(r, er); });
  }

  /* ---------- settings ---------- */
  function vSet() {
    var r = root();
    api('/rest/v1/site_settings?select=key,value').then(function (rows) {
      var s = {}; rows.forEach(function (x) { s[x.key] = x.value; });
      var inp = function (id, label, hint, v, ph) { return '<div class="field"><label for="' + id + '">' + label + '</label><input class="input" id="' + id + '" value="' + esc(v || '') + '" placeholder="' + esc(ph || '') + '"><div class="hint">' + hint + '</div></div>'; };
      r.innerHTML = '<div class="bar"><h2>Site settings</h2></div>' +
        '<form id="x-sf" class="card card-flat form-card" style="margin-bottom:22px" novalidate><h3 style="margin-bottom:14px">Contact &amp; social links</h3>' +
        inp('st-email', 'Contact email', 'Shown in the footer and on the contact page; people write to this address.', s.contact_email, 'you@example.com') +
        inp('st-wa', 'WhatsApp number', 'With country code, digits only, e.g. 919876543210. Leave empty to hide the WhatsApp button.', s.whatsapp, '919876543210') +
        inp('st-yt', 'YouTube channel link', 'Used by the footer and the Subscribe buttons.', s.youtube, 'https://youtube.com/@yourchannel') +
        inp('st-ig', 'Instagram link', 'Used by the footer icon.', s.instagram, 'https://instagram.com/yourpage') +
        '<h3 style="margin:18px 0 14px">Announcement bar</h3>' +
        inp('st-ann', 'Message (optional)', 'A small dismissible bar at the bottom of every page, e.g. a sale or new release. Leave empty for none.', s.announcement, 'New game out now!') +
        '<div class="acts"><button class="btn btn-primary" type="submit">Save settings</button></div><div class="form-msg" id="x-msg" hidden></div></form>' +
        '<form id="x-pf" class="card card-flat form-card" novalidate><h3 style="margin-bottom:14px">Change my admin password</h3>' +
        '<div class="field"><label for="pw-1">New password</label><input class="input" id="pw-1" type="password" autocomplete="new-password"><div class="hint">At least 8 characters.</div></div>' +
        '<div class="field"><label for="pw-2">Repeat new password</label><input class="input" id="pw-2" type="password" autocomplete="new-password"></div>' +
        '<div class="acts"><button class="btn btn-outline" type="submit">Update password</button></div><div class="form-msg" id="x-pmsg" hidden></div></form>';
      document.getElementById('x-sf').onsubmit = function (e) {
        e.preventDefault();
        var msg = document.getElementById('x-msg'), v = function (id) { return document.getElementById(id).value.trim(); };
        var email = v('st-email'), wa = v('st-wa').replace(/\D/g, ''), yt = v('st-yt'), ig = v('st-ig');
        if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { return say(msg, 'Please enter a valid email.', true); }
        if (wa && (wa.length < 8 || wa.length > 15)) { return say(msg, 'WhatsApp number should be 8 to 15 digits with country code.', true); }
        if ((yt && !isUrl(yt)) || (ig && !isUrl(ig))) { return say(msg, 'YouTube and Instagram links must start with https://', true); }
        var now = new Date().toISOString();
        var body = [['contact_email', email], ['whatsapp', wa], ['youtube', yt], ['instagram', ig], ['announcement', v('st-ann')]].map(function (p) { return { key: p[0], value: p[1], updated_at: now }; });
        var sb = document.querySelector('#x-sf button[type=submit]'); sb.disabled = true; say(msg, 'Saving…');
        api('/rest/v1/site_settings?on_conflict=key', { method: 'POST', body: body, prefer: 'resolution=merge-duplicates,return=minimal' })
          .then(function () { sb.disabled = false; say(msg, 'Saved. The website picks it up on the next page load.'); })
          .catch(function (er) { sb.disabled = false; say(msg, er.message, true); });
      };
      document.getElementById('x-pf').onsubmit = function (e) {
        e.preventDefault();
        var msg = document.getElementById('x-pmsg'), a = document.getElementById('pw-1').value, b = document.getElementById('pw-2').value;
        if (a.length < 8) { return say(msg, 'Use at least 8 characters.', true); }
        if (a !== b) { return say(msg, 'The two passwords do not match.', true); }
        say(msg, 'Updating…');
        fresh().then(function (S) {
          return fetch(U + '/auth/v1/user', { method: 'PUT', headers: { apikey: K, Authorization: 'Bearer ' + S.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: a }) });
        }).then(function (x) { return x.json().then(function (d) { if (!x.ok) { throw new Error(d.msg || d.message || 'Could not update the password'); } }); })
          .then(function () { document.getElementById('pw-1').value = ''; document.getElementById('pw-2').value = ''; say(msg, 'Password updated.'); })
          .catch(function (er) { say(msg, er.message, true); });
      };
    }).catch(function (er) { fail(r, er); });
  }
})();
