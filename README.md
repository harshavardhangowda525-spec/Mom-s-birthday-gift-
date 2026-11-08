# The Magic of You 🎁

An interactive, cinematic birthday experience made for Mom, built with Next.js (App Router), React, TypeScript, Tailwind CSS v4, Motion and Lucide.

The journey has eight chapters:

1. **The Mysterious Gift**: a glowing gift box unties, opens, releases butterflies and pulls you into the world.
2. **The Enchanted Garden**: a parallax garden with sun rays, fireflies, petals and a golden path.
3. **The Three Magical Doors**: Your Smile · Our Memories · The Love You Give. Each door holds a golden heart to collect.
4. **The Universe of Memories**: family photos as a constellation. Tap, swipe or use the arrow keys, then gather them into a heart.
5. **The Magical Wishing Tree**: golden leaves unfold into handwritten wishes.
6. **Make a Wish, Mom**: blow out the candles for fireworks and a music-box "Happy Birthday".
7. **The Grand Finale**: a ~84-second memory film (play / pause / replay / skip), a constellation heart around Mom's portrait, and a golden celebration.
8. **A Little Piece of Forever**: a keepsake card (save as PNG, or print / PDF), a personal letter, a hidden heart, and *Relive the magic*.

## Personalise it

Everything personal lives in **`src/config/birthday.ts`**: names, date, photo captions, door messages, wishes, the letter and the keepsake text.

- **Photos** go in `public/images/family/`. Add a file, then add an entry to `photos` in the config.
- **Wishes**: the wishing-tree messages are placeholders (`placeholder: true`). Replace them with real messages from family, e.g. `{ from: "Dad", message: "..." }`.
- **Music**: put a licensed instrumental at `public/audio/birthday-music.mp3`. If it's missing, the site plays an original music-box melody generated in the browser. Music only starts after the first tap, and the top-right controls pause, mute and replay it.
- **Film**: scene order, photos and timings are in `SCENES` in `src/components/finale/CinematicFilm.tsx`.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Deploy

Import the repository on [Vercel](https://vercel.com/new). There are no environment variables, database or backend, so the default Next.js settings work as they are.
