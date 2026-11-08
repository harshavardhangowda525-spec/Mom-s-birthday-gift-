/**
 * ─────────────────────────────────────────────────────────────
 *  THE MAGIC OF YOU — the ONE file to personalise the experience
 * ─────────────────────────────────────────────────────────────
 *  • Photos live in  public/images/family/
 *    Add a new photo there, then add an entry to `photos` below.
 *  • Music: drop a licensed instrumental at public/audio/birthday-music.mp3
 *    (any path works — change `music.src`). If the file is missing, a gentle
 *    music-box melody generated in the browser plays instead.
 *  • Wishes marked `placeholder: true` are stand-ins — replace them with the
 *    real words from family members and delete the flag.
 */

export type FamilyPhoto = {
  id: string;
  src: string;
  alt: string;
  /** Short caption shown when the photo is opened. Edit freely. */
  caption: string;
  /** CSS object-position, so faces stay in frame when cropped. */
  focus?: string;
};

export type FamilyWish = {
  from: string;
  message: string;
  placeholder?: boolean;
};

export const birthday = {
  momName: "Yashaswini",
  /** What the site calls her in headings. */
  momTitle: "Mom",
  senderName: "your dear son",
  /** Shown as the signature on letters & the keepsake. */
  senderSignature: "Your dear son",
  birthdayDate: "2026-11-08",
  birthdayDateLabel: "8 November 2026",

  music: {
    /** Optional user-supplied, properly licensed instrumental track. */
    src: "/audio/birthday-music.mp3",
    /** Play a generated music-box melody if the file above is missing. */
    generatedFallback: true,
  },

  photos: [
    {
      id: "portrait",
      src: "/images/family/mom-portrait-saree.webp",
      alt: "Mom smiling in a black and gold saree",
      caption: "Graceful, strong and beautiful — always.",
      focus: "50% 25%",
    },
    {
      id: "cafe",
      src: "/images/family/mom-son-cafe-selfie.webp",
      alt: "Mom and her son smiling together in a selfie",
      caption: "Your smile next to mine — my favourite kind of photo.",
      focus: "55% 40%",
    },
    {
      id: "temple",
      src: "/images/family/mom-son-temple-selfie.webp",
      alt: "Mom in a yellow saree with her son on a sunny day out",
      caption: "Side by side with you, every place feels like a blessing.",
      focus: "45% 35%",
    },
    {
      id: "family",
      src: "/images/family/family-morning-selfie.webp",
      alt: "The whole family together in a morning selfie",
      caption: "All of us together, under one wide sky.",
      focus: "50% 35%",
    },
    {
      id: "tea",
      src: "/images/family/mom-tea-time.webp",
      alt: "Mom sipping tea on the sofa at home",
      caption: "A quiet cup of tea — and that thoughtful look I know so well.",
      focus: "50% 30%",
    },
    {
      id: "together",
      src: "/images/family/mom-dad-together.webp",
      alt: "Mom in a yellow silk saree standing with family",
      caption: "Smiling bright, side by side.",
      focus: "50% 30%",
    },
    {
      id: "family-2",
      src: "/images/family/family-morning-selfie-2.webp",
      alt: "The family smiling together outdoors",
      caption: "The people who love you most, all in one frame.",
      focus: "50% 35%",
    },
  ] satisfies FamilyPhoto[],

  /** The most beautiful photo of Mom — used for the finale & keepsake. */
  portraitId: "portrait",

  doors: {
    smile: {
      title: "Your Smile",
      photoIds: ["portrait", "cafe", "tea"],
      message: "Your smile has made more of my days beautiful than you'll ever know.",
    },
    memories: {
      title: "Our Memories",
      photoIds: ["family", "temple", "together", "family-2"],
      message: "The smallest moments with you have become some of my greatest treasures.",
    },
    love: {
      title: "The Love You Give",
      lines: [
        "Thank you for your love — the kind that never asks for anything back.",
        "Thank you for your patience, on every day I tested it.",
        "Thank you for your encouragement, which made me braver than I am.",
        "Thank you for your care, in a thousand ways no one else ever sees.",
        "Everything good in me began with you.",
      ],
    },
  },

  /**
   * Wishing-tree leaves. Replace these placeholders with real messages from
   * family — e.g. { from: "Dad", message: "..." } — and remove `placeholder`.
   */
  wishes: [
    {
      from: "With love",
      message: "Happy birthday! May this year bring you as much joy as you bring to everyone around you.",
      placeholder: true,
    },
    {
      from: "With love",
      message: "Thank you for being the warmth of our home. Wishing you health, laughter and peace always.",
      placeholder: true,
    },
    {
      from: "With love",
      message: "May every day of this new year be gentle, bright and full of the little things you love.",
      placeholder: true,
    },
    {
      from: "With love",
      message: "You make every celebration special. Today, we celebrate you. Happy birthday!",
      placeholder: true,
    },
    {
      from: "With love",
      message: "Wishing you a year of beautiful surprises, quiet cups of tea and endless smiles.",
      placeholder: true,
    },
  ] satisfies FamilyWish[],

  letter: {
    greeting: "Dear Mom,",
    paragraphs: [
      "I built this little world because I wanted you to feel, even for a few minutes, how magical you make everything around you.",
      "Thank you for every early morning, every hug, every word of encouragement, and every time you believed in me before I believed in myself.",
      "You have given me more love than I could ever put into words — so I put it into stars, flowers and light instead.",
      "I hope this birthday is as beautiful as your heart. I am so lucky to be your son.",
    ],
    signoff: "With all my love, forever,",
  },

  keepsakeMessage:
    "May your year be filled with happiness, love and beautiful moments — just like the ones you have given us.",

  hiddenMessage: "In every lifetime, I'd still choose you as my mom.",

  /**
   * The last surprise: love coupons Mom can scratch and redeem.
   * These are promises from the sender. Edit them to ones you'll keep!
   * icon: coffee | home | film | heart | walk | flower
   */
  coupons: [
    { icon: "coffee", title: "Breakfast in Bed", detail: "One breakfast, made and served by me. You just relax." },
    { icon: "home", title: "A Day Off from Chores", detail: "One whole day where I do all the housework. No arguments!" },
    { icon: "film", title: "Movie Night, Your Pick", detail: "Your movie, your snacks, and my full attention. No phone." },
    { icon: "heart", title: "Unlimited Hugs", detail: "Redeemable anytime, anywhere. This coupon never expires." },
    { icon: "walk", title: "A Walk, Just Us Two", detail: "As long as you like, talking about everything and nothing." },
    { icon: "flower", title: "Head Massage & Chai", detail: "A relaxing head massage, followed by chai made by me." },
  ],

  /**
   * The locked gift: a real present that unlocks on a future date.
   * The date is in Mom's local time. Before it, the chest stays locked with a countdown.
   * Preview the unlocked version by adding ?unlock=1 to the site's URL.
   */
  lockedGift: {
    unlockAt: "2026-12-01T00:00:00",
    unlockLabel: "1 December 2026",
    unlockedTitle: "It’s time. Come find me",
    unlockedMessage: "Your real gift is ready, and it’s waiting for you. Go find your son!",
  },

  lanternMessage: "No matter how big I grow, I'll always be your little one.",
};

export type BirthdayConfig = typeof birthday;

export const photoById = (id: string): FamilyPhoto | undefined =>
  birthday.photos.find((p) => p.id === id);

export const portraitPhoto = (): FamilyPhoto | undefined =>
  photoById(birthday.portraitId) ?? birthday.photos[0];
