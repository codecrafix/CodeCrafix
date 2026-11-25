/* CodeCrafix auth — Supabase session via REST (no library), header login button,
   login guards. Contact + Review forms stay public; everything else needs login. */
(function () {
  var CFG = window.CODECRAFIX_CONFIG || {}, SB = CFG.supabase || {};
  var BASE = (SB.url || '').replace(/\/$/, ''), KEY = SB.anonKey;
  var SKEY = 'cf_auth_v1';

  function getSession() { try { return JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { return null; } }
  function setSession(s) { if (s) { localStorage.setItem(SKEY, JSON.stringify(s)); } else { localStorage.removeItem(SKEY); } }
  function curUser() { var s = getSession(); return s && s.user ? s.user : null; }
  function isExpired(s) { return !s || !s.expires_at || (Date.now() / 1000) > (s.expires_at - 60); }
  function refresh() {
    var s = getSession(); if (!s || !s.refresh_token) { return Promise.resolve(null); }
    return fetch(BASE + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.access_token) { d.expires_at = Math.floor(Date.now() / 1000) + (d.expires_in || 3600); if (!d.user) { d.user = s.user; } setSession(d); return d; } setSession(null); return null; })
      .catch(function () { return s; });
  }
  function ensure() { var s = getSession(); if (!s) { return Promise.resolve(null); } if (isExpired(s)) { return refresh(); } return Promise.resolve(s); }
  function headers() { var s = getSession(); return { apikey: KEY, Authorization: 'Bearer ' + (s && s.access_token ? s.access_token : KEY), 'Content-Type': 'application/json' }; }
  function displayName(u) { if (!u) { return 'Account'; } var m = u.user_metadata || {}; return m.full_name || m.name || (u.email ? u.email.split('@')[0] : 'Account'); }
  function signOut() { setSession(null); }

  /* Capture an OAuth / email-confirm return: #access_token=... in the URL hash.
     Runs IMMEDIATELY when auth.js loads (not just on DOMContentLoaded): the user is
     decoded synchronously from the JWT so pages that check the session at parse time
     (dashboard, booking) see the login before they can bounce to login.html. */
  var captured = false;
  function jwtPayload(token) {
    try {
      var b = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b.length % 4) { b += '='; }
      return JSON.parse(decodeURIComponent(escape(atob(b))));
    } catch (e) { return null; }
  }
  function captureHash() {
    if (captured) { return; }
    if (!location.hash || location.hash.indexOf('access_token=') === -1) { return; }
    var p = new URLSearchParams(location.hash.slice(1));
    var at = p.get('access_token'); if (!at) { return; }
    captured = true;
    var pl = jwtPayload(at);
    var sess = { access_token: at, refresh_token: p.get('refresh_token') || '', expires_at: Math.floor(Date.now() / 1000) + (parseInt(p.get('expires_in') || '3600', 10)) };
    if (pl) { sess.user = { id: pl.sub, email: pl.email || '', user_metadata: pl.user_metadata || {} }; }
    setSession(sess);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    fetch(BASE + '/auth/v1/user', { headers: { apikey: KEY, Authorization: 'Bearer ' + at } })
      .then(function (r) { return r.json(); })
      .then(function (u) { if (u && u.id) { sess.user = u; setSession(sess); paintHeader(); if (window.CF_ON_AUTH) { window.CF_ON_AUTH(u); } } })
      .catch(function () {});
  }

  /* Header: add a Login / account button next to the store CTA (visual addition only) */
  var css = '#cf-auth-btn{border:1.5px solid rgba(255,255,255,.75);color:#ffffff;background:transparent;border-radius:10px;padding:7px 16px;font-weight:600;font-size:.86rem;white-space:nowrap;text-decoration:none}' +
    '#cf-auth-btn:hover{background:rgba(255,255,255,.12);color:#ffffff}' +
    '#cf-auth-btn.cf-logged{border-color:#22c55e;color:#4ade80}';
  function paintHeader() {
    var nav = document.querySelector('#cf-header .nav'); if (!nav) { return; }
    if (!document.getElementById('cf-auth-css')) { var st = document.createElement('style'); st.id = 'cf-auth-css'; st.textContent = css; document.head.appendChild(st); }
    var old = document.getElementById('cf-auth-btn'); if (old) { old.remove(); }
    var u = curUser(), a = document.createElement('a'); a.id = 'cf-auth-btn';
    if (u) { a.href = 'dashboard.html'; a.className = 'cf-logged'; a.textContent = displayName(u); a.title = 'My dashboard'; }
    else { a.href = 'login.html'; a.textContent = 'Login'; }
    var cta = nav.querySelector('.nav-cta'); nav.insertBefore(a, cta || null);
  }

  function goLogin(next) { location.href = 'login.html?next=' + encodeURIComponent(next || (location.pathname.split('/').pop() || 'index.html')); }

  /* Guards: custom-dev enquiry + store actions need login. Contact/Review untouched. */
  function guardForms() {
    document.addEventListener('submit', function (e) {
      var f = e.target; if (!f || !f.id) { return; }
      if (f.id === 'cf-customdev-form' && !curUser()) { e.preventDefault(); e.stopPropagation(); goLogin('custom-dev.html'); }
    }, true);
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('#cf-store-grid a, #cf-store-grid button, [data-shop-placement] a, [data-shop-placement] button') : null;
      if (t && !curUser()) { e.preventDefault(); e.stopPropagation(); goLogin('store.html'); }
    }, true);
  }

  window.CF_AUTH = { getSession: getSession, setSession: setSession, user: curUser, ensure: ensure, headers: headers, signOut: signOut, base: BASE, key: KEY, displayName: displayName, goLogin: goLogin };

  captureHash();
  document.addEventListener('DOMContentLoaded', function () { captureHash(); paintHeader(); guardForms(); ensure().then(paintHeader); });
})();
