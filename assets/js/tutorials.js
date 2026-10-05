/* CodeCrafix tutorials: live YouTube video cards from Supabase (managed in /admin > Tutorials).
   If Supabase cannot be reached, the static cards already in tutorials.html stay visible. */
(function () {
  var CFG = window.CODECRAFIX_CONFIG || {}, SB = CFG.supabase || {};
  if (!SB.url || !SB.anonKey) { return; }
  var REST = SB.url.replace(/\/$/, '') + '/rest/v1';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function card(t) {
    var thumb = 'https://i.ytimg.com/vi/' + encodeURIComponent(t.video_id) + '/hqdefault.jpg';
    var href = /^https?:\/\//i.test(t.youtube_url) ? t.youtube_url : 'https://youtu.be/' + t.video_id;
    return '<a class="card vid-card" href="' + esc(href) + '" target="_blank" rel="noopener" aria-label="Watch on YouTube: ' + esc(t.title) + '">' +
      '<div class="vid-thumb"><img src="' + thumb + '" alt="' + esc(t.title) + '" width="480" height="360" loading="lazy" decoding="async">' +
      '<span class="vid-play" aria-hidden="true">&#9654;</span><span class="vid-badge">&#9654; YOUTUBE</span></div>' +
      '<div class="vid-body"><h3>' + esc(t.title) + '</h3><p>' + esc(t.description || '') + '</p></div></a>';
  }

  function start() {
    var list = document.getElementById('cf-video-list');
    if (!list) { return; }
    fetch(REST + '/tutorials?select=id,title,description,youtube_url,video_id&is_published=eq.true&order=sort_order.desc,created_at.desc', {
      headers: { apikey: SB.anonKey, Authorization: 'Bearer ' + SB.anonKey }
    }).then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); })
      .then(function (rows) { if (rows && rows.length) { list.innerHTML = rows.map(card).join(''); } })
      .catch(function () {});
  }
  function boot() { setTimeout(start, 0); }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
