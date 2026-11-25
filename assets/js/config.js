/* Responsive fix: some pages still declare <meta viewport content="width=1200">, which forces the desktop layout on phones.
   Switch every public page to a real device-width viewport and load the shared responsive rules. */
(function () {
  if (/admin/.test(location.pathname)) return;
  try {
    var VP = 'width=device-width, initial-scale=1, minimum-scale=1';
    var olds = document.querySelectorAll('meta[name="viewport"]');
    for (var i = 0; i < olds.length; i++) { olds[i].parentNode.removeChild(olds[i]); }
    var m = document.createElement('meta'); m.name = 'viewport'; m.content = VP; document.head.appendChild(m);
    if (!document.getElementById('cf-responsive-css')) {
      var l = document.createElement('link'); l.id = 'cf-responsive-css'; l.rel = 'stylesheet'; l.href = '/assets/css/responsive.css?v=20261125b'; document.head.appendChild(l);
    }
  } catch (e) {}

  /* Safety net (phones only, <=640px): a text-heavy multi-column grid whose columns are too narrow becomes one column. Desktop is never touched. */
  function cfGrid() {
    try {
      var narrow = window.innerWidth <= 640;
      var els = document.querySelectorAll('main div, main ul, main ol, main form, main section');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.hasAttribute('data-cf-g')) {
          if (!narrow) { el.style.removeProperty('grid-template-columns'); el.removeAttribute('data-cf-g'); }
          continue;
        }
        if (!narrow) continue;
        if (el.matches('.counters,.rating-picker')) continue;
        var cs = getComputedStyle(el);
        if (cs.display !== 'grid') continue;
        var cols = cs.gridTemplateColumns.split(' ').length;
        if (cols < 2 || !el.children.length) continue;
        if (el.clientWidth / cols > 190) continue;
        if ((el.textContent || '').length / el.children.length < 30) continue;
        el.style.setProperty('grid-template-columns', 'minmax(0,1fr)', 'important');
        el.setAttribute('data-cf-g', '1');
      }
    } catch (e) {}
  }
  var gt;
  function cfGridSoon() { clearTimeout(gt); gt = setTimeout(cfGrid, 150); }
  document.addEventListener('DOMContentLoaded', function () {
    cfGrid(); setTimeout(cfGrid, 700); setTimeout(cfGrid, 2000);
    var mn = document.querySelector('main');
    if (mn && window.MutationObserver) { new MutationObserver(cfGridSoon).observe(mn, { childList: true, subtree: true }); }
  });
  window.addEventListener('load', cfGrid);
  window.addEventListener('resize', cfGridSoon);
  window.addEventListener('orientationchange', cfGridSoon);

  /* Login page: make the official Google button fit the card width on small phones. */
  if (/login/.test(location.pathname)) {
    var tries = 0, timer = setInterval(function () {
      var g = window.google && google.accounts && google.accounts.id;
      if (g || ++tries > 150) {
        clearInterval(timer);
        try {
          if (g && !g.__cfw) {
            g.__cfw = 1;
            var orig = g.renderButton;
            g.renderButton = function (el, o) {
              try {
                var w = el && el.parentNode ? el.parentNode.clientWidth : 0;
                if (o && w && o.width && w < o.width) { o.width = Math.max(200, Math.floor(w)); }
              } catch (e) {}
              return orig.call(g, el, o);
            };
          }
        } catch (e) {}
      }
    }, 40);
  }
})();

/* CodeCrafix site config — edit values here, no other file needs to change */
window.CODECRAFIX_CONFIG = {
  brand: { name: 'CodeCrafix', tagline: 'Build, Code & Scale' },
  contact: {
    email: 'codecrafix.official@gmail.com',
    whatsapp: '916262262913',            // e.g. '919876543210' (country code + number, no +). Leave blank to hide
    whatsappText: 'Hi CodeCrafix! I would like to discuss a project.',
    youtube: 'https://youtube.com/@codecrafix'
  },
  social: { instagram: 'https://www.instagram.com/codecrafix?stkn=MTF4ejJqc3VmcHZzMg==' },
  /* true = show the demo products and demo reviews. Keep false: real reviews now come from Supabase. */
  showSampleContent: false,
  /* false (now) = clicking Buy on a paid product sends the visitor straight to that product's
     "Download / redirect URL" from the admin panel (no name/email form, no online payment).
     Set to true once a payment gateway is approved to bring back the in-site checkout. */
  paymentsLive: false,
  /* Supabase project "CodeCrafix". The anon key is public by design; all data is protected by Row Level Security. */
  supabase: {
    url: 'https://luccpfzrxhsezzmnbzsg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1Y2NwZnpyeGhzZXp6bW5ienNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzQ3NTYsImV4cCI6MjEwNjc1MDc1Nn0._ANGPdu_V3R4SdnurJpTz4OtHMK7R8rbK5fUw9n5I0s'
  },
  admin: { passwordHash: '' }
};

/* Mobile menu + live shop (Supabase products, downloads, Razorpay) + live tutorials, blog, settings and newsletter.
   Loaded synchronously so the header is styled before it is drawn. */
(function () {
  if (/admin/.test(location.pathname)) {
    /* admin page: Dashboard, Tutorials, Blog, Reviews, Subscribers and Settings tabs + product form guard */
    try { document.write('<script src="/assets/js/admin-extra.js?v=20261005a"><\/script><script src="/assets/js/admin-guard.js?v=20261016a"><\/script>'); } catch (e) {}
    return;
  }
  try {
    document.write('<script src="/assets/js/menu.js?v=20261004n"><\/script><script src="/assets/js/shop.js?v=20261016b"><\/script><script src="/assets/js/tutorials.js?v=20261005a"><\/script><script src="/assets/js/site-extras.js?v=20261005a"><\/script>');
  } catch (e) {
    ['menu.js?v=20261004n', 'shop.js?v=20261016b', 'tutorials.js?v=20261005a', 'site-extras.js?v=20261005a'].forEach(function (f) {
      var s = document.createElement('script'); s.src = '/assets/js/' + f; document.head.appendChild(s);
    });
  }
})();
