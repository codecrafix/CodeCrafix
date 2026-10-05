/* CodeCrafix admin: Tutorials tab. Paste a YouTube link, the thumbnail is picked up automatically. */
(function () {
  var C = (window.CODECRAFIX_CONFIG || {}).supabase || {};
  if (!C.url || !C.anonKey) { return; }
  var U = C.url.replace(/\/$/, ''), K = C.anonKey;
  var tabs = document.getElementById('tabs'); if (!tabs) { return; }

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
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
  function videoId(u) {
    var m = String(u || '').trim().match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  var thumb = function (id) { return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; };

  /* tab button (no data-t, so the admin's own tab handler ignores it) */
  var btn = document.createElement('button');
  btn.className = 'filter-btn'; btn.type = 'button'; btn.id = 'tt-tab'; btn.innerHTML = '&#9654;&#65039; Tutorials';
  tabs.appendChild(btn);
  btn.addEventListener('click', function () {
    Array.prototype.forEach.call(tabs.querySelectorAll('.filter-btn'), function (x) { x.classList.toggle('active', x === btn); });
    render();
  });

  function render() {
    var v = document.getElementById('view');
    v.innerHTML = '<div id="tt-root"><div class="empty-state">Loading…</div></div>';
    var root = document.getElementById('tt-root');
    api('/rest/v1/tutorials?select=*&order=sort_order.desc,created_at.desc').then(function (list) {
      root.innerHTML = '<div class="bar"><h2>YouTube tutorials (' + list.length + ')</h2><button class="btn btn-primary btn-sm" id="tt-add" type="button">+ Add tutorial</button></div><div id="tt-form"></div><div id="tt-list"></div>';
      document.getElementById('tt-add').onclick = function () { form(root, list, null); };
      document.getElementById('tt-list').innerHTML = list.map(function (t) {
        return '<div class="card item"><img src="' + thumb(esc(t.video_id)) + '" alt="" style="width:128px;height:72px">' +
          '<div class="grow"><h3>' + esc(t.title) + '</h3><div class="mt-1"><span class="pill2 ' + (t.is_published ? '' : 'bad') + '">' + (t.is_published ? 'Live on Tutorials page' : 'Hidden') + '</span></div>' +
          '<p>' + esc(t.description || '') + '</p><p class="kv">' + esc(t.youtube_url) + '</p>' +
          '<div class="acts"><button class="btn btn-outline btn-sm" data-e="' + t.id + '" type="button">Edit</button>' +
          '<button class="btn btn-outline btn-sm" data-pub="' + t.id + '" data-v="' + (t.is_published ? 0 : 1) + '" type="button">' + (t.is_published ? 'Hide' : 'Show') + '</button>' +
          '<button class="btn btn-danger btn-sm" data-d="' + t.id + '" type="button">Delete</button></div></div></div>';
      }).join('') || '<div class="empty-state">No tutorials yet. Click “Add tutorial”.</div>';
      document.getElementById('tt-list').onclick = function (e) {
        var b = e.target.closest('button'); if (!b) { return; }
        var id = b.getAttribute('data-e') || b.getAttribute('data-pub') || b.getAttribute('data-d');
        var t = list.filter(function (x) { return x.id === id; })[0]; if (!t) { return; }
        if (b.hasAttribute('data-e')) { form(root, list, t); window.scrollTo(0, 0); }
        else if (b.hasAttribute('data-pub')) { api('/rest/v1/tutorials?id=eq.' + id, { method: 'PATCH', body: { is_published: b.getAttribute('data-v') === '1' } }).then(render).catch(function (er) { alert(er.message); }); }
        else if (b.hasAttribute('data-d') && confirm('Delete “' + t.title + '” from the site?')) { api('/rest/v1/tutorials?id=eq.' + id, { method: 'DELETE' }).then(render).catch(function (er) { alert(er.message); }); }
      };
    }).catch(function (er) { root.innerHTML = '<div class="form-msg err">' + esc(er.message) + '</div>'; });
  }

  function form(root, list, t) {
    t = t || {};
    var f = document.getElementById('tt-form');
    f.innerHTML = '<form id="tt-f" class="card card-flat form-card" style="margin-bottom:22px" novalidate><h2>' + (t.id ? 'Edit tutorial' : 'Add a YouTube tutorial') + '</h2>' +
      '<div class="field"><label>YouTube video link *</label><input class="input" id="tt-url" placeholder="https://youtu.be/xxxxxxxxxxx" value="' + esc(t.youtube_url || '') + '"><div class="hint">Paste any YouTube link (watch, youtu.be, shorts). The thumbnail is taken from YouTube automatically.</div>' +
      '<img class="prev" id="tt-prev" alt=""' + (t.video_id ? ' src="' + thumb(esc(t.video_id)) + '"' : ' hidden') + '></div>' +
      '<div class="field"><label>Title *</label><input class="input" id="tt-title" maxlength="160" value="' + esc(t.title || '') + '"></div>' +
      '<div class="field"><label>Short description (shown under the title)</label><input class="input" id="tt-desc" maxlength="400" value="' + esc(t.description || '') + '"></div>' +
      '<div class="field"><div class="chk"><label><input type="checkbox" id="tt-pub"' + (t.id && !t.is_published ? '' : ' checked') + '> Show on the Tutorials page</label></div></div>' +
      '<div class="acts"><button class="btn btn-primary" type="submit">Save tutorial</button><button class="btn btn-outline" id="tt-cancel" type="button">Cancel</button></div><div class="form-msg" id="tt-msg" hidden></div></form>';
    var url = document.getElementById('tt-url'), prev = document.getElementById('tt-prev'), title = document.getElementById('tt-title');
    var msg = document.getElementById('tt-msg'), say = function (x, bad) { msg.hidden = false; msg.className = 'form-msg' + (bad ? ' err' : ''); msg.textContent = x; };
    url.oninput = function () {
      var id = videoId(url.value);
      if (id) {
        prev.src = thumb(id); prev.hidden = false;
        if (!title.value.trim()) {
          fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://youtu.be/' + id)).then(function (r) { return r.json(); })
            .then(function (d) { if (d && d.title && !title.value.trim()) { title.value = d.title; } }).catch(function () {});
        }
      } else { prev.hidden = true; }
    };
    document.getElementById('tt-cancel').onclick = function () { f.innerHTML = ''; };
    document.getElementById('tt-f').onsubmit = function (e) {
      e.preventDefault();
      var id = videoId(url.value), ttl = title.value.trim();
      if (!id) { return say('Please paste a valid YouTube video link.', true); }
      if (ttl.length < 2) { return say('Please enter a title.', true); }
      var row = { title: ttl, description: document.getElementById('tt-desc').value.trim(), youtube_url: url.value.trim(), video_id: id, is_published: document.getElementById('tt-pub').checked };
      var sb = document.querySelector('#tt-f button[type=submit]'); sb.disabled = true; say('Saving…');
      (t.id ? api('/rest/v1/tutorials?id=eq.' + t.id, { method: 'PATCH', body: row, prefer: 'return=minimal' }) : api('/rest/v1/tutorials', { method: 'POST', body: row, prefer: 'return=minimal' }))
        .then(render)
        .catch(function (er) { sb.disabled = false; say(/duplicate|unique/i.test(er.message) ? 'This video is already added.' : er.message, true); });
    };
  }
})();
