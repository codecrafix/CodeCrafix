/* Store catalogue, tutorials and blog cards. Edit the lists below.
   Product fields: id, title, category, price (0 = Free), emoji, desc, format, version,
   url (payment / download link; empty = the button opens an email to you), featured (show on home).
   `emoji` holds the cover <img>. It loads assets/img/<name>.png (your real poster) and
   falls back to assets/img/<name>.svg if the PNG has not been uploaded yet.
   `sample: true` items are demo content and are hidden when showSampleContent is false in config.js. */
function cfCover(name, alt) {
  return '<img src="assets/img/' + name + '.png" alt="' + alt + '" loading="lazy" ' +
    'onerror="this.onerror=null;this.src=\'assets/img/' + name + '.svg\'" ' +
    'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">';
}
window.CODECRAFIX_STORE = {
  categories: ['All', 'Games'],
  products: [
    { id: 'dino-runner', title: 'Dino Runner — Classic T-Rex Game', category: 'Games', price: 0, featured: true,
      emoji: cfCover('dino-runner', 'Dino Runner cover'),
      desc: 'Relive the classic Chrome Dino Runner! Dodge obstacles, beat your high score and enjoy endless offline fun. Free to download on the Amazon Appstore.',
      format: 'Amazon Appstore', version: 'v1.0', url: 'https://www.amazon.com/dp/B0DXLCH91F/ref=apps_sf_sta' },
    { id: 'bubble-shooter', title: 'Bubble Shooter — Pop & Blast', category: 'Games', price: 0, featured: true,
      emoji: cfCover('bubble-shooter', 'Bubble Shooter cover'),
      desc: 'A colourful puzzle game where you match and pop 3 or more bubbles. Simple controls, fun animation and classic arcade action. Free to download on the Amazon Appstore.',
      format: 'Amazon Appstore', version: 'v1.0', url: 'https://www.amazon.com/gp/product/B0FFGW6GQB' }
  ],
  videos: [
    { icon: '📱', title: 'Android app development', desc: 'Build and ship real apps step by step — from setup to Play Store.', url: 'https://youtube.com/@codecrafix' },
    { icon: '🎮', title: 'Unity game development', desc: 'Make 2D mobile games: runners, puzzles and arcade shooters.', url: 'https://youtube.com/@codecrafix' },
    { icon: '🚀', title: 'Publishing & AdMob', desc: 'Store listing, ASO and monetisation without the guesswork.', url: 'https://youtube.com/@codecrafix' }
  ],
  blog: [
    { icon: '🧭', title: 'Publish without a Play Console account', desc: 'How our hosting & publishing plans work, step by step.', url: 'publish-app.html' },
    { icon: '🛠️', title: 'Hire us for a custom build', desc: 'The scoping, quote and delivery process explained.', url: 'custom-dev.html' },
    { icon: '🛒', title: 'Browse the store', desc: 'Everything currently available in the CodeCrafix store.', url: 'store.html' }
  ]
};
