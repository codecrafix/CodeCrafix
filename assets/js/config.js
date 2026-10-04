/* CodeCrafix site config — edit values here, no other file needs to change */
window.CODECRAFIX_CONFIG = {
  brand: { name: 'CodeCrafix', tagline: 'Build, Code & Scale' },
  contact: {
    email: 'codecrafix.official@gmail.com',
    whatsapp: '',            // e.g. '919876543210' (country code + number, no +). Leave blank to hide
    whatsappText: 'Hi CodeCrafix! I would like to discuss a project.',
    youtube: 'https://youtube.com/@codecrafix'
  },
  social: { instagram: '' },  // add your Instagram URL to show its icon in the footer
  /* true = show the demo products and demo reviews. Set to false before real customers rely on the site. */
  showSampleContent: true,
  /* Optional: Supabase. If both are filled, form submissions are POSTed to your tables
     (reviews, custom_orders, app_submissions). If empty, forms open the visitor's email app instead. */
  supabase: { url: '', anonKey: '' },
  /* Admin: SHA-256 hex of your passphrase. Empty = admin console stays locked. */
  admin: { passwordHash: '' }
};
