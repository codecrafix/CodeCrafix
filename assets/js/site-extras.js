/* CodeCrafix public site extras, all managed from /admin:
   - blog posts on the Tutorials page
   - contact email, WhatsApp, YouTube, Instagram and the announcement bar (Settings)
   - newsletter sign-ups saved to Supabase */
(function () {
  var CFG = window.CODECRAFIX_CONFIG || {}, SB = CFG.supabase || {};
  if (!SB.url || !SB.anonKey) { return; }
  var REST = SB.url.replace(/\/$/, '') + '/rest/v1', HDR = { apikey: SB.anonKey, Authorization: 'Bearer ' + SB.anonKey };
  var qa = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function get(p) { return fetch(REST + p, { headers: HDR }).then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); }); }
  /* run after app.js has drawn the page */
  function after(fn) {
    var go = function () { setTimeout(fn, 0); };
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', go); } else { go(); }
  }

  /* ---------- newsletter ---------- */
  function note(f, t, bad) {
    var m = document.getElementById('cf-nl-msg');
    if (!m) { m = document.createElement('p'); m.id = 'cf-nl-msg'; m.style.cssText = 'margin-top:12px;font-size:.86rem;width:100%;text-align:center'; f.parentNode.insertBefore(m, f.nextSibling); }
    m.style.color = bad ? '#fca5a5' : '#4ade80'; m.textContent = t;
  }
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f || f.id !== 'cf-newsletter') { return; }
    e.preventDefault(); e.stopImmediatePropagation();
    var inp = f.querySelector('input'), em = ((inp && inp.value) || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(em)) { if (inp) { inp.focus(); } return note(f, 'Please enter a valid email address.', true); }
    var btn = f.querySelector('button[type=submit]'); if (btn) { btn.disabled = true; }
    fetch(REST + '/newsletter_subscribers', { method: 'POST', headers: { apikey: SB.anonKey, Authorization: 'Bearer ' + SB.anonKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ email: em }) })
      .then(function (r) { if (r.ok || r.status === 409) { note(f, 'Thanks! You are subscribed.'); f.reset(); } else { throw new Error(r.status); } })
      .catch(function () { note(f, 'Could not subscribe right now. Please try again in a moment.', true); })
      .then(function () { if (btn) { btn.disabled = false; } });
  }, true);

  /* ---------- blog posts ---------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  function fmt(d) { var p = String(d || '').split('-'); return p.length === 3 ? p[2] + '-' + MON[+p[1] - 1] + '-' + p[0] : ''; }
  function blogCard(b) {
    var inner = '<div class="blog-top"><span class="blog-tag">' + esc(b.tag) + '</span><span class="blog-date">' + esc(fmt(b.published_on)) + '</span></div><h3>' + esc(b.title) + '</h3><p>' + esc(b.description || '') + '</p>';
    return /^https?:\/\//i.test(b.url || '')
      ? '<a class="card blog-card" style="color:inherit" href="' + esc(b.url) + '" target="_blank" rel="noopener">' + inner + '</a>'
      : '<article class="card blog-card">' + inner + '</article>';
  }
  if (document.getElementById('cf-blog-list')) {
    get('/blog_posts?select=title,tag,description,url,published_on&is_published=eq.true&order=published_on.desc,created_at.desc')
      .then(function (rows) { var l = document.getElementById('cf-blog-list'); if (l && rows && rows.length) { l.innerHTML = rows.map(blogCard).join(''); } })
      .catch(function () {});
  }

  /* ---------- site settings ---------- */
  function replaceEmail(a, b) {
    qa('a[href*="mailto:"]').forEach(function (x) { x.setAttribute('href', x.getAttribute('href').split(a).join(b)); });
    qa('[title],[aria-label]').forEach(function (x) {
      ['title', 'aria-label'].forEach(function (k) { var v = x.getAttribute(k); if (v && v.indexOf(a) > -1) { x.setAttribute(k, v.split(a).join(b)); } });
    });
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n, hit = [];
    while ((n = w.nextNode())) { if (n.nodeValue.indexOf(a) > -1) { hit.push(n); } }
    hit.forEach(function (t) { t.nodeValue = t.nodeValue.split(a).join(b); });
  }
  function banner(t) {
    try { if (sessionStorage.getItem('cf_ann') === t) { return; } } catch (e) {}
    var d = document.createElement('div'); d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:90;max-width:640px;margin:0 auto;background:#0f1c16;border:1px solid rgba(34,197,94,.45);color:#d8f5e3;border-radius:14px;padding:10px 40px 10px 14px;font-size:.84rem;box-shadow:0 10px 30px rgba(0,0,0,.5)';
    d.textContent = t;
    var x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', 'Close');
    x.style.cssText = 'position:absolute;right:8px;top:4px;background:none;border:0;color:#9db3a6;font-size:1.3rem;cursor:pointer';
    x.onclick = function () { d.remove(); try { sessionStorage.setItem('cf_ann', t); } catch (e) {} };
    d.appendChild(x); document.body.appendChild(d);
  }
  function apply(s) {
    CFG.contact = CFG.contact || {};
    var oldEmail = CFG.contact.email || '';
    if (s.contact_email && oldEmail && s.contact_email !== oldEmail) { replaceEmail(oldEmail, s.contact_email); }
    if (s.contact_email) { CFG.contact.email = s.contact_email; }
    var wa = String(s.whatsapp || '').replace(/\D/g, '');
    if (wa.length >= 8) {
      CFG.contact.whatsapp = wa;
      var link = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(CFG.contact.whatsappText || 'Hi CodeCrafix!');
      qa('[data-wa]').forEach(function (a) { a.href = link; a.style.display = ''; });
    }
    if (s.youtube) { qa('a[href*="youtube.com/@codecrafix"]').forEach(function (a) { a.href = s.youtube; }); }
    if (s.instagram) { qa('a[href*="instagram.com/codecrafix"]').forEach(function (a) { a.href = s.instagram; }); }
    if (s.announcement) { banner(s.announcement); }
  }
  get('/site_settings?select=key,value').then(function (rows) {
    var s = {}; rows.forEach(function (r) { s[r.key] = r.value; });
    after(function () { try { apply(s); } catch (e) {} });
  }).catch(function () {});
})();
