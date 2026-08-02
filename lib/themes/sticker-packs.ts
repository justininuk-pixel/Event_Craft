export interface StickerMetadata {
  id: string;
  name: string;
  filePath: string;
}

export interface StickerPack {
  id: string;
  name: string;
  emoji: string;
  stickers: StickerMetadata[];
}

export const STICKER_PACKS: StickerPack[] = [
  {
    id: "hearts",
    name: "Hearts & Love",
    emoji: "💖",
    stickers: [
      { id: "heart-classic", name: "Classic Heart", filePath: "/stickers/hearts/heart-classic.svg" },
      { id: "heart-outline", name: "Outline Heart", filePath: "/stickers/hearts/heart-outline.svg" },
      { id: "heart-sparkle", name: "Sparkle Heart", filePath: "/stickers/hearts/heart-sparkle.svg" },
      { id: "heart-arrow", name: "Cupid's Arrow", filePath: "/stickers/hearts/heart-arrow.svg" },
      { id: "heart-envelope", name: "Love Letter", filePath: "/stickers/hearts/heart-envelope.svg" },
      { id: "heart-ribbon", name: "Gift Heart", filePath: "/stickers/hearts/heart-ribbon.svg" },
      { id: "heart-broken", name: "Broken Heart", filePath: "/stickers/hearts/heart-broken.svg" },
      { id: "heart-double", name: "Double Hearts", filePath: "/stickers/hearts/heart-double.svg" },
    ],
  },
  {
    id: "stars",
    name: "Stars & Celestial",
    emoji: "⭐",
    stickers: [
      { id: "star-classic", name: "Classic Star", filePath: "/stickers/stars/star-classic.svg" },
      { id: "star-outline", name: "Outline Star", filePath: "/stickers/stars/star-outline.svg" },
      { id: "star-sparkle", name: "Sparkle Star", filePath: "/stickers/stars/star-sparkle.svg" },
      { id: "star-shooting", name: "Shooting Star", filePath: "/stickers/stars/star-shooting.svg" },
      { id: "star-burst", name: "Starburst", filePath: "/stickers/stars/star-burst.svg" },
      { id: "star-crescent", name: "Crescent Moon", filePath: "/stickers/stars/star-crescent.svg" },
      { id: "star-badge", name: "Sheriff Badge", filePath: "/stickers/stars/star-badge.svg" },
      { id: "star-group", name: "Constellation", filePath: "/stickers/stars/star-group.svg" },
    ],
  },
  {
    id: "flowers",
    name: "Flowers & Nature",
    emoji: "🌸",
    stickers: [
      { id: "flower-rose", name: "Red Rose", filePath: "/stickers/flowers/flower-rose.svg" },
      { id: "flower-sakura", name: "Cherry Blossom", filePath: "/stickers/flowers/flower-sakura.svg" },
      { id: "flower-sunflower", name: "Sunflower", filePath: "/stickers/flowers/flower-sunflower.svg" },
      { id: "flower-tulip", name: "Tulip", filePath: "/stickers/flowers/flower-tulip.svg" },
      { id: "flower-daisy", name: "Daisy", filePath: "/stickers/flowers/flower-daisy.svg" },
      { id: "flower-bouquet", name: "Bouquet", filePath: "/stickers/flowers/flower-bouquet.svg" },
      { id: "flower-leaf", name: "Monstera Leaf", filePath: "/stickers/flowers/flower-leaf.svg" },
      { id: "flower-hibiscus", name: "Hibiscus", filePath: "/stickers/flowers/flower-hibiscus.svg" },
    ],
  },
  {
    id: "ribbons",
    name: "Ribbons & Awards",
    emoji: "🎗️",
    stickers: [
      { id: "ribbon-gift", name: "Gift Wrap", filePath: "/stickers/ribbons/ribbon-gift.svg" },
      { id: "ribbon-award", name: "Award Ribbon", filePath: "/stickers/ribbons/ribbon-award.svg" },
      { id: "ribbon-corner", name: "Corner Ribbon", filePath: "/stickers/ribbons/ribbon-corner.svg" },
      { id: "ribbon-banner", name: "Banner Ribbon", filePath: "/stickers/ribbons/ribbon-banner.svg" },
      { id: "ribbon-bow", name: "Bow Ribbon", filePath: "/stickers/ribbons/ribbon-bow.svg" },
      { id: "ribbon-wreath", name: "Laurel Wreath", filePath: "/stickers/ribbons/ribbon-wreath.svg" },
    ],
  },
  {
    id: "food",
    name: "Food & Drinks",
    emoji: "🍰",
    stickers: [
      { id: "food-cake", name: "Birthday Cake", filePath: "/stickers/food/food-cake.svg" },
      { id: "food-cupcake", name: "Cupcake", filePath: "/stickers/food/food-cupcake.svg" },
      { id: "food-pizza", name: "Pizza Slice", filePath: "/stickers/food/food-pizza.svg" },
      { id: "food-burger", name: "Burger", filePath: "/stickers/food/food-burger.svg" },
      { id: "food-coffee", name: "Coffee Mug", filePath: "/stickers/food/food-coffee.svg" },
      { id: "food-icecream", name: "Ice Cream", filePath: "/stickers/food/food-icecream.svg" },
      { id: "food-cookie", name: "Cookie", filePath: "/stickers/food/food-cookie.svg" },
      { id: "food-cheers", name: "Cheers Glasses", filePath: "/stickers/food/food-cheers.svg" },
    ],
  },
  {
    id: "animals",
    name: "Animals",
    emoji: "🐶",
    stickers: [
      { id: "animal-cat", name: "Cute Cat", filePath: "/stickers/animals/animal-cat.svg" },
      { id: "animal-dog", name: "Cute Dog", filePath: "/stickers/animals/animal-dog.svg" },
      { id: "animal-bear", name: "Teddy Bear", filePath: "/stickers/animals/animal-bear.svg" },
      { id: "animal-rabbit", name: "White Rabbit", filePath: "/stickers/animals/animal-rabbit.svg" },
      { id: "animal-panda", name: "Panda Bear", filePath: "/stickers/animals/animal-panda.svg" },
      { id: "animal-fox", name: "Cute Fox", filePath: "/stickers/animals/animal-fox.svg" },
      { id: "animal-lion", name: "Little Lion", filePath: "/stickers/animals/animal-lion.svg" },
      { id: "animal-paw", name: "Paw Print", filePath: "/stickers/animals/animal-paw.svg" },
    ],
  },
  {
    id: "celebration",
    name: "Party & Celebration",
    emoji: "🎉",
    stickers: [
      { id: "celebration-balloon", name: "Balloons", filePath: "/stickers/celebration/celebration-balloon.svg" },
      { id: "celebration-popper", name: "Party Popper", filePath: "/stickers/celebration/celebration-popper.svg" },
      { id: "celebration-hat", name: "Party Hat", filePath: "/stickers/celebration/celebration-hat.svg" },
      { id: "celebration-champagne", name: "Champagne Bottle", filePath: "/stickers/celebration/celebration-champagne.svg" },
      { id: "celebration-gift", name: "Gift Box", filePath: "/stickers/celebration/celebration-gift.svg" },
      { id: "celebration-trophy", name: "Gold Trophy", filePath: "/stickers/celebration/celebration-trophy.svg" },
      { id: "celebration-fireworks", name: "Fireworks", filePath: "/stickers/celebration/celebration-fireworks.svg" },
      { id: "celebration-disco", name: "Disco Ball", filePath: "/stickers/celebration/celebration-disco.svg" },
    ],
  },
  {
    id: "emoji",
    name: "Styled Emojis",
    emoji: "😎",
    stickers: [
      { id: "emoji-smile", name: "Smiling Face", filePath: "/stickers/emoji/emoji-smile.svg" },
      { id: "emoji-love", name: "Heart Eyes", filePath: "/stickers/emoji/emoji-love.svg" },
      { id: "emoji-laugh", name: "Tears of Joy", filePath: "/stickers/emoji/emoji-laugh.svg" },
      { id: "emoji-cry", name: "Loudly Crying", filePath: "/stickers/emoji/emoji-cry.svg" },
      { id: "emoji-party", name: "Partying Face", filePath: "/stickers/emoji/emoji-party.svg" },
      { id: "emoji-mindblown", name: "Exploding Head", filePath: "/stickers/emoji/emoji-mindblown.svg" },
      { id: "emoji-sunglasses", name: "Cool Sunglasses", filePath: "/stickers/emoji/emoji-sunglasses.svg" },
      { id: "emoji-wink", name: "Winking Face", filePath: "/stickers/emoji/emoji-wink.svg" },
    ],
  },
  {
    id: "religious",
    name: "Religious & Spiritual",
    emoji: "🙏",
    stickers: [
      { id: "religious-cross", name: "Holy Cross", filePath: "/stickers/religious/religious-cross.svg" },
      { id: "religious-crescent", name: "Star and Crescent", filePath: "/stickers/religious/religious-crescent.svg" },
      { id: "religious-star-david", name: "Star of David", filePath: "/stickers/religious/religious-star-david.svg" },
      { id: "religious-om", name: "Om Sacred Symbol", filePath: "/stickers/religious/religious-om.svg" },
      { id: "religious-lotus", name: "Sacred Lotus Flower", filePath: "/stickers/religious/religious-lotus.svg" },
      { id: "religious-dove", name: "Peace Dove", filePath: "/stickers/religious/religious-dove.svg" },
      { id: "religious-candle", name: "Blessing Candle", filePath: "/stickers/religious/religious-candle.svg" },
      { id: "religious-prayer-hands", name: "Prayer Hands", filePath: "/stickers/religious/religious-prayer-hands.svg" },
    ],
  },
  {
    id: "weather",
    name: "Weather & Seasons",
    emoji: "🌤️",
    stickers: [
      { id: "weather-sun", name: "Sunny Day", filePath: "/stickers/weather/weather-sun.svg" },
      { id: "weather-cloud", name: "Fluffy Cloud", filePath: "/stickers/weather/weather-cloud.svg" },
      { id: "weather-rainbow", name: "Happy Rainbow", filePath: "/stickers/weather/weather-rainbow.svg" },
      { id: "weather-snowflake", name: "Snow Crystal", filePath: "/stickers/weather/weather-snowflake.svg" },
      { id: "weather-lightning", name: "Lightning Bolt", filePath: "/stickers/weather/weather-lightning.svg" },
      { id: "weather-umbrella", name: "Rainy Umbrella", filePath: "/stickers/weather/weather-umbrella.svg" },
      { id: "weather-moon", name: "Dreamy Moon", filePath: "/stickers/weather/weather-moon.svg" },
      { id: "weather-wind", name: "Breezy Wind", filePath: "/stickers/weather/weather-wind.svg" },
    ],
  },
];
