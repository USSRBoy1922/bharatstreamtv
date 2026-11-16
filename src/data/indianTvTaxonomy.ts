import type { EpgProgram, IndianLanguage, SpotlightItem, TvCategory, TvChannel } from '../types/tv';

export interface LanguageMeta {
  id: IndianLanguage;
  label: string;
  nativeLabel: string;
  region: string;
}

export const INDIAN_LANGUAGES: LanguageMeta[] = [
  { id: 'All', label: 'All Languages', nativeLabel: 'भारत', region: 'Pan-India' },
  { id: 'Hindi', label: 'Hindi', nativeLabel: 'हिन्दी', region: 'National & North' },
  { id: 'English', label: 'English', nativeLabel: 'English', region: 'National & Global' },
  { id: 'Tamil', label: 'Tamil', nativeLabel: 'தமிழ்', region: 'Tamil Nadu' },
  { id: 'Telugu', label: 'Telugu', nativeLabel: 'తెలుగు', region: 'Andhra & Telangana' },
  { id: 'Malayalam', label: 'Malayalam', nativeLabel: 'മലയാളം', region: 'Kerala' },
  { id: 'Kannada', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', region: 'Karnataka' },
  { id: 'Marathi', label: 'Marathi', nativeLabel: 'मराठी', region: 'Maharashtra' },
  { id: 'Bengali', label: 'Bengali', nativeLabel: 'বাংলা', region: 'West Bengal' },
  { id: 'Gujarati', label: 'Gujarati', nativeLabel: 'ગુજરાતી', region: 'Gujarat' },
  { id: 'Punjabi', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { id: 'Odia', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { id: 'Assamese', label: 'Assamese', nativeLabel: 'অসমীয়া', region: 'Assam & North-East' },
  { id: 'Bhojpuri', label: 'Bhojpuri', nativeLabel: 'भोजपुरी', region: 'Bihar & UP' },
  { id: 'Urdu', label: 'Urdu', nativeLabel: 'اردو', region: 'National' },
];

export interface CategoryMeta {
  id: TvCategory;
  label: string;
  description: string;
  accentImage?: string;
}

export const TV_CATEGORIES: CategoryMeta[] = [
  {
    id: 'All',
    label: 'All Categories',
    description: 'Complete Indian live television directory across every genre',
    accentImage: '/src/assets/images/hero_india_broadcast_1794841367057.jpg',
  },
  {
    id: 'News',
    label: 'News',
    description: '24x7 national bulletins, state newsrooms, and parliamentary broadcasts',
    accentImage: '/src/assets/images/spotlight_news_studio_1794841367511.jpg',
  },
  {
    id: 'Entertainment',
    label: 'Entertainment',
    description: 'General entertainment networks, daily serials, and cultural programming',
    accentImage: '/src/assets/images/hero_india_broadcast_1794841367057.jpg',
  },
  {
    id: 'Movies',
    label: 'Movies',
    description: 'Hindi and regional cinema channels streaming round the clock',
    accentImage: '/src/assets/images/spotlight_cinema_music_1794841369441.jpg',
  },
  {
    id: 'Sports',
    label: 'Sports',
    description: 'Cricket, kabaddi, athletics, and national stadium coverage',
    accentImage: '/src/assets/images/spotlight_cricket_arena_1794841386136.jpg',
  },
  {
    id: 'Music',
    label: 'Music',
    description: 'Bollywood hits, regional playlists, and Indian classical concerts',
    accentImage: '/src/assets/images/spotlight_cinema_music_1794841369441.jpg',
  },
  {
    id: 'Devotional',
    label: 'Devotional',
    description: 'Live aarti, spiritual discourses, bhajans, and yoga broadcasts',
    accentImage: '/src/assets/images/spotlight_cinema_music_1794841369441.jpg',
  },
  {
    id: 'Kids',
    label: 'Kids',
    description: 'Animated series, educational shows, and family-friendly programming',
    accentImage: '/src/assets/images/hero_india_broadcast_1794841367057.jpg',
  },
  {
    id: 'Infotainment',
    label: 'Infotainment',
    description: 'Science, heritage documentaries, travel, and educational television',
    accentImage: '/src/assets/images/hero_india_broadcast_1794841367057.jpg',
  },
  {
    id: 'Business',
    label: 'Business',
    description: 'Sensex, Nifty market hours, corporate earnings, and policy analysis',
    accentImage: '/src/assets/images/spotlight_news_studio_1794841367511.jpg',
  },
  {
    id: 'Regional',
    label: 'Regional',
    description: 'State Doordarshan Kendras and local cultural networks across India',
    accentImage: '/src/assets/images/hero_india_broadcast_1794841367057.jpg',
  },
];

export const SPOTLIGHT_ITEMS: SpotlightItem[] = [
  {
    id: 'national-broadcast',
    title: 'Public & National Television',
    subtitle: 'Free-to-air Doordarshan networks, parliamentary proceedings, and prime-time national news across India.',
    category: 'News',
    language: 'Hindi',
    image: '/src/assets/images/hero_india_broadcast_1794841367057.jpg',
    featuredChannelNames: ['DD National', 'DD News', 'Sansad TV', 'Aaj Tak'],
  },
  {
    id: 'live-newsrooms',
    title: '24x7 News Desks in Every Language',
    subtitle: 'Instant breaking coverage from Delhi, Mumbai, Chennai, Hyderabad, Bengaluru, and Kolkata.',
    category: 'News',
    language: 'English',
    image: '/src/assets/images/spotlight_news_studio_1794841367511.jpg',
    featuredChannelNames: ['DD India', 'WION', 'NDTV 24x7', 'ABP News'],
  },
  {
    id: 'stadium-sports',
    title: 'Sports & Stadium Action',
    subtitle: 'National sporting events, domestic cricket, kabaddi leagues, and live match analysis.',
    category: 'Sports',
    language: 'Hindi',
    image: '/src/assets/images/spotlight_cricket_arena_1794841386136.jpg',
    featuredChannelNames: ['DD Sports', 'DD National', 'Sports18'],
  },
  {
    id: 'music-cinema-arts',
    title: 'Cinema, Music & Classical Arts',
    subtitle: 'Round-the-clock Hindi & regional film hits, youth music charts, and classical culture.',
    category: 'Music',
    language: 'Hindi',
    image: '/src/assets/images/spotlight_cinema_music_1794841369441.jpg',
    featuredChannelNames: ['9XM', 'B4U Music', 'DD Bharati', 'Mastiii'],
  },
];

const CATEGORY_PROGRAMS: Record<Exclude<TvCategory, 'All'>, string[]> = {
  News: [
    'Morning Desh Bulletin',
    'Prime Headlines Live',
    'State Desk Report',
    'National Debate Hour',
    'Late Evening Samachar',
    'India Tonight',
  ],
  Entertainment: [
    'Classic Family Theatre',
    'Desh Ki Kahaniyan',
    'Prime Time Drama',
    'Weekend Cultural Showcase',
    'Comedy Hour Special',
    'Heritage Encore',
  ],
  Movies: [
    'Matinee Cinema Premiere',
    'Golden Era Classics',
    'Blockbuster Prime Feature',
    'Late Night Action Showcase',
    'Director Spotlight Film',
    'Family Cinema Hour',
  ],
  Sports: [
    'Matchday Pre-Show',
    'National Stadium Live',
    'Cricket Archive Classics',
    'Athletics & Kabaddi Roundup',
    'Post-Match Analysis Desk',
    'Sports Tonight',
  ],
  Music: [
    'Morning Melodies',
    'Top 20 India Countdown',
    'Acoustic & Classical Raagas',
    'Evergreen Retro Hits',
    'Indie & Sufi Sessions',
    'Midnight Lounge Beats',
  ],
  Devotional: [
    'Pratah Aarti Live',
    'Vedic Chant & Yoga Hour',
    'Bhajan Sandhya',
    'Spiritual Discourse',
    'Evening Ganga Aarti',
    'Meditation & Mantras',
  ],
  Kids: [
    'Morning Cartoons Club',
    'Science & Discovery Kids',
    'Mythology Tales Animated',
    'Craft & Quiz Time',
    'Evening Story Hour',
    'Junior Explorers',
  ],
  Infotainment: [
    'Wild India Expeditions',
    'Architecture & Heritage',
    'ISRO & Space Frontiers',
    'Culinary Trails of India',
    'Documentary Feature',
    'History Uncovered',
  ],
  Business: [
    'Pre-Market Opening Bell',
    'Sensex & Nifty Live Desk',
    'Mid-Cap & Sector Watch',
    'Closing Bell Analysis',
    'Startup & Tech India',
    'Global Markets Briefing',
  ],
  Regional: [
    'State Morning Samachar',
    'Gramin Krishi Darshan',
    'Regional Folk & Cinema',
    'State Cultural Magazine',
    'Evening Prime Bulletin',
    'Regional Classical Hour',
  ],
};

function formatIstSlot(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getChannelEpgSchedule(channel: TvChannel, now = new Date()): EpgProgram[] {
  const pool = CATEGORY_PROGRAMS[channel.category] || CATEGORY_PROGRAMS.Entertainment;

  // Align to 30-minute slots in IST
  const slotMs = 30 * 60 * 1000;
  const currentSlotStartMs = Math.floor(now.getTime() / slotMs) * slotMs;
  const progressPercent = Math.min(
    98,
    Math.max(4, Math.round(((now.getTime() - currentSlotStartMs) / slotMs) * 100))
  );

  // Deterministic seed based on channel number
  const seed = channel.number;

  return [0, 1, 2, 3].map((offset) => {
    const slotStart = new Date(currentSlotStartMs + offset * slotMs);
    const slotEnd = new Date(currentSlotStartMs + (offset + 1) * slotMs);
    const slotIndex = Math.floor(slotStart.getTime() / slotMs);
    const title = pool[(seed + slotIndex) % pool.length];

    return {
      title,
      startTime: formatIstSlot(slotStart),
      endTime: formatIstSlot(slotEnd),
      description: `${channel.language} · ${channel.category} broadcast on ${channel.name}`,
      isLive: offset === 0,
      progressPercent: offset === 0 ? progressPercent : 0,
    };
  });
}

export function getCurrentIstClock(now = new Date()): string {
  return now.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
