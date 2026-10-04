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
  /* true = show the demo products and demo reviews. Set to false before real customers rely on the site. */
  showSampleContent: false,
  /* Optional: Supabase. If both are filled, form submissions are POSTed to your tables
     (reviews, custom_orders, app_submissions). If empty, forms open the visitor's email app instead. */
  supabase: { url: '', anonKey: '' },
  /* Admin: SHA-256 hex of your passphrase. Empty = admin console stays locked. */
  admin: { passwordHash: '' }
};

/* Mobile menu (3-line toggle) — loads on every page */
(function () {
  try {
    var s = document.createElement('script');
    s.src = '/assets/js/menu.js?v=20261004m';
    s.async = true;
    document.head.appendChild(s);
  } catch (e) {}
})();
