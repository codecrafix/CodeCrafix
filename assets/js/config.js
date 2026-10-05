/* CodeCrafix site config — edit values here, no other file needs to change */
window.CODECRAFIX_CONFIG = {
  brand: { name: 'CodeCrafix', tagline: 'Build, Code & Scale' },
  contact: {
    email: 'codecrafix.official@gmail.com',
    whatsapp: '',            // e.g. '919876543210' (country code + number, no +). Leave blank to hide
    whatsappText: 'Hi CodeCrafix! I would like to discuss a project.',
    youtube: 'https://youtube.com/@codecrafix'
  },
  social: { instagram: 'https://www.instagram.com/codecrafix?stkn=MTF4ejJqc3VmcHZzMg==' },
  /* true = show the demo products and demo reviews. Keep false: real reviews now come from Supabase. */
  showSampleContent: false,
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
    /* admin page: Dashboard, Tutorials, Blog, Reviews, Subscribers and Settings tabs */
    try { document.write('<script src="/assets/js/admin-extra.js?v=20261005a"><\/script>'); } catch (e) {}
    return;
  }
  try {
    document.write('<script src="/assets/js/menu.js?v=20261004n"><\/script><script src="/assets/js/shop.js?v=20261005b"><\/script><script src="/assets/js/tutorials.js?v=20261005a"><\/script><script src="/assets/js/site-extras.js?v=20261005a"><\/script>');
  } catch (e) {
    ['menu.js?v=20261004n', 'shop.js?v=20261005b', 'tutorials.js?v=20261005a', 'site-extras.js?v=20261005a'].forEach(function (f) {
      var s = document.createElement('script'); s.src = '/assets/js/' + f; document.head.appendChild(s);
    });
  }
})();
