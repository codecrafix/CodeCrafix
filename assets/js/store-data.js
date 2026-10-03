/* Store catalogue, tutorials and guides. Edit the lists below.
   For a product: set `url` to its Amazon Appstore / download link. Empty url shows "Coming soon". */
window.CODECRAFIX_STORE = {
  categories: ['All', 'Games', 'App Source Code', 'Prompt Packs'],
  products: [
    { id: 'game-1', title: 'CodeCrafix Game 1', category: 'Games', price: 0, featured: true,
      image: 'images/project-game-1.webp',
      desc: 'Free mobile game by CodeCrafix. Download on the Amazon Appstore and start playing in seconds.',
      url: '', cta: 'Download Now' },
    { id: 'game-2', title: 'CodeCrafix Game 2', category: 'Games', price: 0, featured: true,
      image: 'images/project-game-2.webp',
      desc: 'Our second free game. No cost, no sign-up, just tap and play.',
      url: '', cta: 'Download Now' }
  ],
  videos: [
    { icon: '📱', title: 'Android app development', desc: 'Build and ship real apps step by step — from setup to Play Store.', url: 'https://youtube.com/@codecrafix' },
    { icon: '🎮', title: 'Unity game development', desc: 'Make 2D mobile games: runners, puzzles and arcade shooters.', url: 'https://youtube.com/@codecrafix' },
    { icon: '🚀', title: 'Publishing & AdMob', desc: 'Store listing, ASO and monetisation without the guesswork.', url: 'https://youtube.com/@codecrafix' }
  ],
  blog: [
    { icon: '🧭', title: 'Publish without a Play Console account', desc: 'How our hosting & publishing plans work, step by step.', url: 'publish-app.html' },
    { icon: '🛠️', title: 'Hire us for a custom build', desc: 'The scoping, quote and delivery process explained.', url: 'custom-dev.html' },
    { icon: '🛒', title: 'Browse the free games', desc: 'Everything currently available in the CodeCrafix store.', url: 'store.html' }
  ]
};
