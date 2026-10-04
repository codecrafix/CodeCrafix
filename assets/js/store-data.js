/* Store catalogue, tutorials and blog cards. Edit the lists below.
   Product fields: id, title, category, price (0 = Free), emoji, desc, format, version,
   url (payment / download link; empty = the button opens an email to you), featured (show on home).
   `sample: true` items are demo content and are hidden when showSampleContent is false in config.js. */
window.CODECRAFIX_STORE = {
  categories: ['All', 'Games', 'Apps'],
  products: [
    { id: 'neon-runner', sample: true, title: 'Neon Runner — 2D Endless Runner Template', category: 'Games', price: 0, emoji: '🎮', featured: true,
      desc: 'Production-ready endless runner with procedural levels, coin economy, power-ups and mobile touch controls.',
      format: 'Unity Package (.unitypackage)', version: 'v2.1', url: '' },
    { id: 'puzzle-blast', sample: true, title: 'Puzzle Blast — Match-3 Game Kit', category: 'Games', price: 29, emoji: '🎮', featured: true,
      desc: 'Complete match-3 engine with 120 levels, boosters, level editor and AdMob integration ready to ship.',
      format: 'Unity + Android build', version: 'v1.6', url: '' },
    { id: 'space-shooter-pro', sample: true, title: 'Space Shooter Pro — Full Source', category: 'Games', price: 49, emoji: '🎮', featured: true,
      desc: 'Arcade space shooter with wave system, boss fights, upgrade shop, leaderboards and reskin-friendly art.',
      format: 'Unity Project (full source)', version: 'v3.0', url: '' },
    { id: 'smart-notes', sample: true, title: 'Smart Notes — Offline Notes App Template', category: 'Apps', price: 0, emoji: '📝', featured: true,
      desc: 'Offline-first notes app with room database, tags, dark mode, biometric lock and full Material 3 UI.',
      format: 'Android Studio Project (Kotlin)', version: 'v2.4', url: '' }
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
