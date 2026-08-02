import { Theme, ThemeCategory, ThemeMood, AudioPresetId, AnimationEngineId, DeliveryStyle } from "../types";

const CATEGORIES: ThemeCategory[] = [
  'romance', 'proposal', 'birthday', 'achievement', 'family', 'friendship',
  'thank-you', 'apology', 'get-well', 'invitation', 'cultural-asian',
  'cultural-african', 'cultural-western', 'cultural-latin', 'cultural-middle-eastern',
  'cultural-south-asian', 'cultural-oceanian', 'awareness', 'memorial', 'sympathy',
  'wellness', 'wedding', 'funny', 'seasonal', 'sports', 'life-event',
  'professional', 'food-drink', 'travel', 'pet', 'baby', 'religious', 'countdown'
];

const MOODS: ThemeMood[] = [
  'celebratory', 'romantic', 'solemn', 'funny', 'inspirational',
  'nostalgic', 'peaceful', 'energetic', 'mysterious', 'cute'
];

const PALETTES = [
  { primary: "#ec4899", secondary: "#fdf2f8", accent: "#f472b6", background: "#0c0206", text: "#fce7f3", textSecondary: "#f472b6" },
  { primary: "#dc2626", secondary: "#fff5f5", accent: "#f87171", background: "#fef2f2", text: "#111827", textSecondary: "#4b5563" },
  { primary: "#2563eb", secondary: "#eff6ff", accent: "#60a5fa", background: "#0b1329", text: "#dbeafe", textSecondary: "#93c5fd" },
  { primary: "#10b981", secondary: "#ecfdf5", accent: "#34d399", background: "#f0fdf4", text: "#064e3b", textSecondary: "#059669" },
  { primary: "#f59e0b", secondary: "#fffbeb", accent: "#fbbf24", background: "#1c1917", text: "#fef3c7", textSecondary: "#fbbf24" },
  { primary: "#8b5cf6", secondary: "#f5f3ff", accent: "#a78bfa", background: "#faf5ff", text: "#1e1b4b", textSecondary: "#6d28d9" },
  { primary: "#06b6d4", secondary: "#ecfeff", accent: "#22d3ee", background: "#083344", text: "#cffafe", textSecondary: "#22d3ee" },
  { primary: "#4f46e5", secondary: "#e0e7ff", accent: "#818cf8", background: "#faf5ff", text: "#312e81", textSecondary: "#4f46e5" },
  { primary: "#1e293b", secondary: "#f1f5f9", accent: "#64748b", background: "#f8fafc", text: "#0f172a", textSecondary: "#475569" },
  { primary: "#d97706", secondary: "#fef3c7", accent: "#f59e0b", background: "#fffbeb", text: "#78350f", textSecondary: "#d97706" },
  { primary: "#be185d", secondary: "#fdf2f8", accent: "#ec4899", background: "#fdf2f8", text: "#831843", textSecondary: "#db2777" },
  { primary: "#15803d", secondary: "#f0fdf4", accent: "#22c55e", background: "#ecfdf5", text: "#14532d", textSecondary: "#16a34a" },
  { primary: "#4338ca", secondary: "#e0e7ff", accent: "#6366f1", background: "#030712", text: "#e0e7ff", textSecondary: "#a5b4fc" },
  { primary: "#b91c1c", secondary: "#fef2f2", accent: "#ef4444", background: "#7f1d1d", text: "#fee2e2", textSecondary: "#f87171" }
];

const FONTS = [
  { heading: "Cormorant Garamond", body: "Lora" },
  { heading: "Playfair Display", body: "Lora" },
  { heading: "Cinzel Decorative", body: "Inter" },
  { heading: "Righteous", body: "Space Grotesk" },
  { heading: "Fredoka One", body: "Nunito" },
  { heading: "Pacifico", body: "Nunito" },
  { heading: "Bebas Neue", body: "Inter" },
  { heading: "Dancing Script", body: "Caveat" },
  { heading: "Satisfy", body: "Caveat" },
  { heading: "EB Garamond", body: "Lora" },
  { heading: "Outfit", body: "Inter" },
  { heading: "Plus Jakarta Sans", body: "DM Sans" }
];

const AUDIO_PRESETS: AudioPresetId[] = [
  "romantic-piano", "upbeat-celebration", "gentle-acoustic", "epic-orchestral",
  "lofi-chill", "jazz-smooth", "ambient-nature", "retro-synthwave",
  "traditional-chinese", "bollywood-festive", "african-drums", "celtic-harp",
  "japanese-koto", "arabic-oud", "latin-guitar", "solemn-strings",
  "music-box", "chiptune-8bit", "cinematic-tension"
];

const ANIMATION_ENGINES: AnimationEngineId[] = [
  "particles", "fireworks", "snow", "rain", "audio-visualiser", "css-only"
];

const PARTICLE_PRESETS = [
  "ROSE_PETALS", "SAKURA", "STARS", "BUBBLES", "FIREFLIES", "CONFETTI_STREAM"
];

const DELIVERY_STYLES: DeliveryStyle[] = [
  "envelope", "scroll", "gift-box", "letter", "book", "paper-airplane", "bottle", "telegram", "hologram", "portal", "polaroid", "none"
];

const CATEGORY_META: Record<ThemeCategory, { emojis: string[], subcategories: string[], titles: string[], bodies: string[] }> = {
  romance: {
    emojis: ["💖", "💞", "💌", "👩‍❤️‍💋‍👨", "💘"],
    subcategories: ["Affection", "Anniversary", "Just Because"],
    titles: ["Forever & Always", "A Token of My Love", "To My Special One", "Deeply in Love with You"],
    bodies: ["Every day spent with you is a blessing. You are my sunshine and my happiness. Happy celebration!", "Thinking of you makes my heart swell. You bring out the best in me, and I am so grateful to have you."]
  },
  proposal: {
    emojis: ["💍", "💒", "💎", "🥂", "🤵"],
    subcategories: ["Surprise Proposal", "Classic Proposal"],
    titles: ["Will You Marry Me?", "A Lifelong Journey Together", "Start of Forever", "Co-sign Our Future"],
    bodies: ["You are my absolute everything. I want to build a life and a future with you. Will you do me the honour of marrying me?", "Let's make this official. Let's spend the rest of our days side by side. Will you marry me?"]
  },
  birthday: {
    emojis: ["🎂", "🎈", "🎁", "🥳", "🍰"],
    subcategories: ["Milestone Birthday", "General Birthday", "Youth Birthday"],
    titles: ["Happy Birthday!", "Cheers to Another Year!", "Have a Spectacular Birthday!", "Wishing You the Best Day!"],
    bodies: ["May this new chapter of your life be filled with love, laughter, and endless adventure. Happy Birthday!", "Wishing you a day as special as you are. May all your dreams come true this year!"]
  },
  achievement: {
    emojis: ["🏆", "🎓", "🌟", "🎖️", "📈"],
    subcategories: ["Graduation", "Promotion", "Milestone"],
    titles: ["Congratulations on Your Success!", "You Did It!", "Outstanding Achievement!", "A Proud Milestone!"],
    bodies: ["Your hard work, perseverance, and dedication have truly paid off. Wishing you all the success in your next venture!", "So proud of your accomplishments. This is just the beginning of great things to come. Congratulations!"]
  },
  family: {
    emojis: ["🏠", "👨‍👩‍👧‍👦", "👵", "👶", "👵"],
    subcategories: ["Mother's Day", "Father's Day", "Family Reunion"],
    titles: ["With Love to My Family", "Best Mom Ever", "To a Wonderful Dad", "Home is Where Family Is"],
    bodies: ["Thank you for always being my pillar of strength and support. Family is everything.", "Grateful for the warm memories, laughter, and unconditional love that keeps our family close."]
  },
  friendship: {
    emojis: ["🤗", "🤝", "🍕", "🍹", "🛹"],
    subcategories: ["Best Friends", "Appreciation", "Reconnecting"],
    titles: ["To a Truly Great Friend", "Thanks for Being You", "Friends Forever", "Cheers to Friendship"],
    bodies: ["No matter the distance, our friendship never fades. Thank you for always being there for me.", "Grateful for the long conversations, the inside jokes, and the wonderful memories we share."]
  },
  'thank-you': {
    emojis: ["🙏", "💐", "💌", "💝", "🌟"],
    subcategories: ["Gratitude", "Professional Thanks", "Helpful Gesture"],
    titles: ["Sincere Thank You", "Deeply Grateful", "Thanks a Million!", "Your Kindness is Appreciated"],
    bodies: ["I wanted to express my heartfelt gratitude for your support and assistance. You made a huge difference!", "Thank you for going above and beyond. I truly appreciate your help and kindness."]
  },
  apology: {
    emojis: ["🥺", "🙏", "💔", "🥀", "💬"],
    subcategories: ["Sincere Apology", "Forgiveness", "Making Amends"],
    titles: ["I'm Truly Sorry", "Please Forgive Me", "Hoping We Can Reconnect", "A Heartfelt Apology"],
    bodies: ["I deeply regret my actions and any hurt I have caused you. I value our connection more than words can say.", "Please accept my apologies. I hope we can move forward and rebuild our trust."]
  },
  'get-well': {
    emojis: ["🩹", "🩺", "🥣", "🍵", "🌱"],
    subcategories: ["Recovery", "Comfort", "Speedy Healing"],
    titles: ["Wishing You a Speedy Recovery", "Get Well Soon!", "Thinking of You & Sending Strength", "Rest & Heal Up"],
    bodies: ["Sending you warm wishes for a fast recovery. Take all the time you need to rest and heal.", "Hoping you feel stronger and better with each passing day. Get well soon!"]
  },
  invitation: {
    emojis: ["✉️", "🥂", "📅", "🎪", "🏷️"],
    subcategories: ["Party Invitation", "Dinner Invite", "Gathering"],
    titles: ["You Are Cordially Invited", "Save the Date!", "Join Us for a Celebration", "Let's Get Together"],
    bodies: ["We request the pleasure of your company to celebrate a special occasion. Please RSVP to let us know if you can make it!", "We are hosting a gathering and would love to have you there. Join us for food, drinks, and great times."]
  },
  'cultural-asian': {
    emojis: ["🏮", "🧧", "🌸", "🎏", "🐉"],
    subcategories: ["Lunar New Year", "Mid-Autumn", "Spring Festival"],
    titles: ["Happy Spring Festival", "Lunar New Year Greetings", "Mid-Autumn Blessings", "Wishes of Prosperity"],
    bodies: ["Wishing you and your family abundance, joy, and good health in this auspicious season.", "May the bright full moon bring unity, peace, and prosperity to your home. Happy festival!"]
  },
  'cultural-african': {
    emojis: ["🦁", "🌍", "🪘", "🏺", "🦒"],
    subcategories: ["Heritage Celebration", "Cultural Gathering"],
    titles: ["Cultural Pride Celebration", "African Heritage Tribute", "Rhythms of Celebration", "Unity & Prosperity"],
    bodies: ["Celebrating our rich history, vibrant rhythms, and the strong community that binds us together.", "May the ancestral spirits bless your home with health, wisdom, and endless happiness."]
  },
  'cultural-western': {
    emojis: ["🎃", "🎅", "🗽", "🤠", "🍁"],
    subcategories: ["Autumn Feast", "Holiday Vibe", "Classic Western"],
    titles: ["Cozy Winter Holiday", "Harvest Festival Greetings", "Happy Festivities!", "Western Holiday Vibe"],
    bodies: ["Wishing you a magical and warm holiday season surrounded by those who matter most.", "May the harvest season bring warmth, gratitude, and a table full of joy."]
  },
  'cultural-latin': {
    emojis: ["🪅", "💃", "🌮", "🌵", "🎸"],
    subcategories: ["Fiesta", "Day of the Dead", "Carnival"],
    titles: ["Viva la Fiesta!", "Carnival Vibes", "Traditional Celebration", "Feliz Celebración"],
    bodies: ["Let the music play, the colours shine, and the dance continue. Wishing you a festive day!", "Honouring tradition with love, remembrance, and a colorful tribute. Happy celebration!"]
  },
  'cultural-middle-eastern': {
    emojis: ["🕌", "🌙", "🌴", "🪕", "🐪"],
    subcategories: ["Ramadan Greetings", "Eid Mubarak", "Traditional Oud"],
    titles: ["Eid Mubarak!", "Ramadan Kareem", "Blessings of Peace", "Middle Eastern Traditions"],
    bodies: ["May this holy season bring peace, forgiveness, and spiritual growth to you and your loved ones.", "Wishing you a joyous Eid filled with sweet memories, community warmth, and blessings."]
  },
  'cultural-south-asian': {
    emojis: ["🪔", "🐘", "🪷", "🕌", "🍢"],
    subcategories: ["Diwali", "Holi", "South Asian Wedding"],
    titles: ["Happy Diwali!", "Festival of Colours", "Subh Deepavali", "Festive Blessings"],
    bodies: ["May the light of a thousand diyas illuminate your path with joy, prosperity, and health.", "Wishing you a vibrant Holi filled with laughter, friendship, and beautiful colors of happiness."]
  },
  'cultural-oceanian': {
    emojis: ["🌊", "🐚", "🌴", "🪵", "🛶"],
    subcategories: ["Island Vibe", "Oceania Heritage", "Pacific Tribute"],
    titles: ["Oceania Breeze", "Aloha Spirit Celebration", "Pacific Heritage Blessings", "Island Reunion"],
    bodies: ["Guided by the waves and the stars, we celebrate our deep connection to the land and ocean.", "Sending warm island vibes, strength, and blessings of abundance to your family."]
  },
  awareness: {
    emojis: ["🎗️", "🧩", "💚", "🏳️‍🌈", "🦋"],
    subcategories: ["Mental Health", "Pride Month", "Awareness Campaign"],
    titles: ["Stand Together in Support", "Pride & Unity", "Hope & Healing", "Spread the Awareness"],
    bodies: ["Raising our voices to support, educate, and empower. Together, we can make a difference.", "Celebrating diversity, love, and inclusion. Everyone deserves to be seen, heard, and valued."]
  },
  memorial: {
    emojis: ["🕯️", "🕊️", "☁️", "🤍", "🥀"],
    subcategories: ["In Loving Memory", "Tribute", "Anniversary of Loss"],
    titles: ["Celebrating a Beautiful Life", "In Loving Memory", "Forever in Our Hearts", "A Dignified Tribute"],
    bodies: ["Though you are no longer with us, your memory shines bright in our hearts every single day.", "Remembering the warmth, the laughter, and the beautiful impact you had on all of our lives."]
  },
  sympathy: {
    emojis: ["🤍", "🕊️", "🫂", "🌸", "🤝"],
    subcategories: ["Condolences", "Bereavement Support"],
    titles: ["With Deepest Sympathy", "Thinking of You in Your Loss", "Our Thoughts Are With You", "Sending Comfort & Care"],
    bodies: ["We are deeply saddened by your loss. Sending you strength, love, and comfort during this difficult time.", "May you find peace and solace in the warm memories of your loved one. With sincere condolences."]
  },
  wellness: {
    emojis: ["🧘", "🌿", "🍵", "🏔️", "🕯️"],
    subcategories: ["Self Care", "Mindfulness", "Zen Vibe"],
    titles: ["A Moment of Calm", "Mindful Self-Care", "Breathe & Reset", "Wellness & Harmony"],
    bodies: ["Take a deep breath, relax your shoulders, and enjoy a moment of complete peace. You deserve it.", "Wishing you a balanced, tranquil, and healthy day. Prioritize your peace and wellness."]
  },
  wedding: {
    emojis: ["💍", "🥂", "💒", "👰", "🤵"],
    subcategories: ["Classic Wedding", "Reception Invite", "Anniversary"],
    titles: ["The Wedding Celebration", "Happy Wedding Anniversary!", "Union of Two Hearts", "Toast to the Newlyweds"],
    bodies: ["Two lives, two hearts, joined together in friendship and love. Wishing you a lifetime of happiness!", "May your wedding day be filled with sweet memories and your future be bright and prosperous. Congratulations!"]
  },
  funny: {
    emojis: ["🤪", "🤡", "🍕", "🎮", "💩"],
    subcategories: ["Meme Card", "Playful Evade", "Jokes"],
    titles: ["Warning: Extreme Fun Ahead", "You've Been Selected!", "Are You Ready for This?", "Highly Scientific Card"],
    bodies: ["Research shows that opening this card makes you 99% more likely to have a fantastic day. It's science!", "I tried to write something profound, but instead you get this weird interactive card. Enjoy!"]
  },
  seasonal: {
    emojis: ["❄️", "🌸", "☀️", "🍂", "⛄"],
    subcategories: ["Spring Vibe", "Summer Solstice", "Autumn Equinox", "Winter Solstice"],
    titles: ["Greetings of the Season", "Winter Wonderland Vibe", "Summer Sunshine!", "Warm Autumn Wishes"],
    bodies: ["Embracing the change of seasons and sending you cozy vibes for the days ahead.", "May the sunshine brighten your day and fill your week with productivity and relaxation."]
  },
  sports: {
    emojis: ["⚽", "🏀", "🏆", "🛹", "🚴"],
    subcategories: ["Game Day", "Victory Celebration", "Athletic Milestone"],
    titles: ["Game Day Celebration!", "Victory & Success", "Keep Pushing the Limits", "Athletic Achievement"],
    bodies: ["Congratulations on an incredible game! Your training, skill, and teamwork truly paid off.", "Wishing you the best of luck for the upcoming season. Play hard, stay focused, and win!"]
  },
  'life-event': {
    emojis: ["🗝️", "🏡", "🚗", "👶", "💍"],
    subcategories: ["Housewarming", "Retirement", "New Adventure"],
    titles: ["New Home, New Beginnings", "Happy Retirement!", "Welcome to Your New Adventure", "A Major Life Event!"],
    bodies: ["May your new home be filled with laughter, love, and beautiful memories. Congratulations!", "Wishing you a relaxing, fun, and fulfilling retirement. Thank you for your years of dedication!"]
  },
  professional: {
    emojis: ["💼", "📊", "📈", "🤝", "🚀"],
    subcategories: ["Project Shipped", "Work Anniversary", "Corporate Thanks"],
    titles: ["Project Shipped Successfully!", "Happy Work Anniversary!", "A Milestone for Our Team", "Professional Appreciation"],
    bodies: ["A massive thank you to everyone involved in shipping this project. Excellent work and coordination!", "Thank you for your valuable contributions to our team. Wishing you a happy work anniversary!"]
  },
  'food-drink': {
    emojis: ["🍕", "🍔", "🍣", "🍹", "☕"],
    subcategories: ["Dinner Party", "Brunch Invite", "Coffee Chats"],
    titles: ["Let's Feast!", "Brunch & Mimosas", "Dinner & Great Conversations", "Coffee Date Awaits"],
    bodies: ["I'd love to invite you for a culinary adventure. Good food is sweeter when shared with friends!", "Let's grab a cozy table and enjoy some warm drinks and delicious treats. Are you free?"]
  },
  travel: {
    emojis: ["✈️", "🗺️", "🧳", "🏝️", "🏔️"],
    subcategories: ["Adventure", "Bon Voyage", "Road Trip"],
    titles: ["Bon Voyage!", "Adventure Awaits", "Wanderlust Vibe", "Safe Travels!"],
    bodies: ["Wishing you a safe, exciting, and unforgettable journey. Explore, discover, and have fun!", "The world is wide and full of wonders. Enjoy every moment of your upcoming travel adventure!"]
  },
  pet: {
    emojis: ["🐶", "🐱", "🐾", "🐹", "🦜"],
    subcategories: ["Pet Birthday", "Adoptanniversary", "New Pet Welcome"],
    titles: ["Happy Pet Birthday!", "Welcome to the Family!", "Paws & Play time", "Celebrating Our Furry Friend"],
    bodies: ["Wishing the goodest boy/girl a day full of treats, play, and endless belly rubs!", "We are so happy to welcome a new companion to our home. Sending paws-itive vibes!"]
  },
  baby: {
    emojis: ["👶", "🍼", "🧸", "🎈", "👶"],
    subcategories: ["Baby Shower", "Newborn Welcome", "Christening"],
    titles: ["Welcome Sweet Baby", "Baby Shower Celebration", "Congratulations on the New Arrival!", "A Precious Gift"],
    bodies: ["So thrilled to hear the wonderful news! Wishing your growing family endless love, health, and sleep.", "Welcoming your little one to the world with warm hearts, hugs, and blessings of a beautiful future."]
  },
  religious: {
    emojis: ["🙏", "🕊️", "📖", "🕯️", "⭐"],
    subcategories: ["Blessings", "Religious Festival", "Sermon Invite"],
    titles: ["Divine Blessings", "Wishes of Faith & Peace", "Spiritual Celebration", "Faithful Gathering"],
    bodies: ["May the divine grace fill your heart with peace, hope, and unwavering faith. Blessings to your family.", "Celebrating this holy occasion with prayers, gratitude, and warm community fellowship."]
  },
  countdown: {
    emojis: ["⏳", "⏰", "📅", "⏳", "🔔"],
    subcategories: ["Event Countdown", "Launch Countdown"],
    titles: ["The Countdown Has Begun!", "Days Until Forever", "Launching Soon...", "Tick Tock!"],
    bodies: ["Get ready! We are counting down the seconds until our grand event. We can't wait to celebrate with you.", "The clock is ticking. Keep an eye on this space for the big reveal!"]
  }
};

const themesArr: Theme[] = [];

// For each category, generate 14 themes to reach 33 * 14 = 462 themes.
// 50 existing themes + 462 generated themes = 512 total themes.
CATEGORIES.forEach((cat) => {
  const meta = CATEGORY_META[cat] || CATEGORY_META['romance'];

  for (let i = 0; i < 14; i++) {
    const id = `gen-${cat}-${i}`;
    const palette = PALETTES[(CATEGORIES.indexOf(cat) * 14 + i) % PALETTES.length];
    const font = FONTS[(CATEGORIES.indexOf(cat) * 14 + i) % FONTS.length];
    const audio = AUDIO_PRESETS[(CATEGORIES.indexOf(cat) * 14 + i) % AUDIO_PRESETS.length];
    const engine = ANIMATION_ENGINES[(CATEGORIES.indexOf(cat) * 14 + i) % ANIMATION_ENGINES.length];
    const delivery = DELIVERY_STYLES[(CATEGORIES.indexOf(cat) * 14 + i) % DELIVERY_STYLES.length];
    const emoji = meta.emojis[i % meta.emojis.length];
    const sub = meta.subcategories[i % meta.subcategories.length];
    const title = meta.titles[i % meta.titles.length];
    const body = meta.bodies[i % meta.bodies.length];
    const mood = MOODS[(CATEGORIES.indexOf(cat) * 14 + i) % MOODS.length];

    const themeObj: Theme = {
      id,
      name: `${emoji} ${sub} Theme ${i + 1}`,
      description: `A customized template for your ${cat} celebrations, featuring a distinct ${mood} mood with custom ${font.heading} typography.`,
      emoji,
      category: cat,
      subcategory: sub,
      mood,
      tags: [cat, sub.toLowerCase(), mood, "custom", "celebrationcraft", "event"],
      culture: "Universal",
      language: "en",
      visual: {
        palette,
        backgroundType: i % 2 === 0 ? "solid" : "mesh-gradient",
        fonts: {
          heading: font.heading,
          body: font.body
        },
        borderRadius: i % 3 === 0 ? "lg" : i % 3 === 1 ? "xl" : "none",
        layout: "centered",
        animationEngine: engine,
        animationConfig: engine === "particles" ? { preset: PARTICLE_PRESETS[i % PARTICLE_PRESETS.length] } : {}
      },
      content: {
        title,
        subtitle: `A custom greeting card from the heart`,
        body,
        recipientLabel: "recipient",
        senderLabel: "sender",
        supportsMedia: i % 2 === 0,
        supportsVoice: i % 3 === 0,
        supportsHandwriting: i % 4 === 0,
        supportsCollage: false
      },
      audio: {
        defaultPreset: audio,
        volume: 0.5,
        autoplay: true,
        loop: true
      },
      delivery: {
        defaultStyle: delivery,
        allowedStyles: [delivery, "none"],
        deliveryDuration: 2500
      },
      editable: {
        title: true,
        subtitle: true,
        body: true,
        recipient: true,
        sender: true,
        palette: true,
        fonts: true,
        animationSpeed: true,
        media: i % 2 === 0,
        voice: i % 3 === 0,
        handwriting: i % 4 === 0,
        ctaText: false,
        deliveryStyle: true,
        audioPreset: true,
        countdownTarget: cat === "countdown",
        stickers: true
      },
      seo: {
        ogTitle: `${title} for {recipient}`,
        ogDescription: `Open this card to view your special greeting from {sender}.`
      }
    };

    // For funny category or specific layouts, we can inject interactive properties
    if (cat === "funny" || i === 0) {
      themeObj.interactive = {
        type: "shrinking-no",
        desktopConfig: { shrinkFactor: 0.5, growFactor: 1.5 },
        mobile: {
          strategy: "shrinking-target",
          permissionRequired: false,
          fallbackStrategy: "instant-swap",
          config: {}
        }
      };
      themeObj.content.cta = {
        yesText: "Yes! 👍",
        noText: "No... 👎",
        promptText: "Are you ready?"
      };
    }

    themesArr.push(themeObj);
  }
});

export const GENERATED_THEMES: Theme[] = themesArr;
