import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import dns from 'node:dns/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type IndianLanguage =
  | 'Hindi'
  | 'English'
  | 'Tamil'
  | 'Telugu'
  | 'Malayalam'
  | 'Kannada'
  | 'Marathi'
  | 'Bengali'
  | 'Gujarati'
  | 'Punjabi'
  | 'Odia'
  | 'Assamese'
  | 'Urdu'
  | 'Bhojpuri';

type TvCategory =
  | 'News'
  | 'Entertainment'
  | 'Movies'
  | 'Sports'
  | 'Music'
  | 'Devotional'
  | 'Kids'
  | 'Infotainment'
  | 'Business'
  | 'Regional';

interface TvChannel {
  id: string;
  number: number;
  name: string;
  streamUrl: string;
  logo?: string;
  language: IndianLanguage;
  category: TvCategory;
  network?: string;
  resolution?: string;
  isPublicBroadcaster?: boolean;
  isCustom?: boolean;
}

interface IptvChannelMeta {
  id: string;
  name: string;
  network?: string | null;
  country?: string;
  languages?: string[];
  categories?: string[];
  is_nsfw?: boolean;
  logo?: string | null;
}

// Curated free-to-air Indian public & major internet HLS channels so directory always loads immediately
// even if upstream iptv-org requests are slow or offline.
const CURATED_INDIAN_CHANNELS: Omit<TvChannel, 'number'>[] = [
  {
    id: 'DDNational.in',
    name: 'DD National',
    streamUrl: 'https://d3eyhgoylams0m.cloudfront.net/v1/manifest/93ce20f0f52760bf38be911ff4c91ed02aa2fd92/ed7bd2c7-8d10-4051-b397-2f6b90f99acb/2e9e32a4-c4f7-49c3-96d6-c4e3660c7e3f/3.m3u8',
    language: 'Hindi',
    category: 'Entertainment',
    network: 'Prasar Bharati',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'DDNews.in',
    name: 'DD News',
    streamUrl: 'https://d3eyhgoylams0m.cloudfront.net/v1/manifest/93ce20f0f52760bf38be911ff4c91ed02aa2fd92/ed7bd2c7-8d10-4051-b397-2f6b90f99acb/529d7928-446a-43b5-b37f-83392e9585bb/3.m3u8',
    language: 'Hindi',
    category: 'News',
    network: 'Prasar Bharati',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'DDIndia.in',
    name: 'DD India',
    streamUrl: 'https://d3eyhgoylams0m.cloudfront.net/v1/manifest/93ce20f0f52760bf38be911ff4c91ed02aa2fd92/ed7bd2c7-8d10-4051-b397-2f6b90f99acb/3b2f6c78-4c04-465c-b6c1-44f25b0a62e1/3.m3u8',
    language: 'English',
    category: 'News',
    network: 'Prasar Bharati',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'DDBharati.in',
    name: 'DD Bharati',
    streamUrl: 'https://d3eyhgoylams0m.cloudfront.net/v1/manifest/93ce20f0f52760bf38be911ff4c91ed02aa2fd92/ed7bd2c7-8d10-4051-b397-2f6b90f99acb/a04a1b8e-c70a-4a57-b315-9902d79c11c2/3.m3u8',
    language: 'Hindi',
    category: 'Infotainment',
    network: 'Prasar Bharati',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'DDSports.in',
    name: 'DD Sports',
    streamUrl: 'https://d3eyhgoylams0m.cloudfront.net/v1/manifest/93ce20f0f52760bf38be911ff4c91ed02aa2fd92/ed7bd2c7-8d10-4051-b397-2f6b90f99acb/04e10d4b-e102-403e-bb82-22b7d013a3d5/3.m3u8',
    language: 'Hindi',
    category: 'Sports',
    network: 'Prasar Bharati',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'SansadTV1.in',
    name: 'Sansad TV',
    streamUrl: 'https://d3eyhgoylams0m.cloudfront.net/v1/manifest/93ce20f0f52760bf38be911ff4c91ed02aa2fd92/ed7bd2c7-8d10-4051-b397-2f6b90f99acb/1f1c51c1-903a-47a2-96d5-9c12b9a9c4d1/3.m3u8',
    language: 'Hindi',
    category: 'News',
    network: 'Parliament of India',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'AajTak.in',
    name: 'Aaj Tak',
    streamUrl: 'https://feeds.intoday.in/aajtak/api/master.m3u8',
    language: 'Hindi',
    category: 'News',
    network: 'TV Today Network',
    resolution: 'HD',
  },
  {
    id: 'IndiaToday.in',
    name: 'India Today',
    streamUrl: 'https://indiatodaylive.akamaized.net/hls/live/2014320/indiatoday/indiatodaylive/playlist.m3u8',
    language: 'English',
    category: 'News',
    network: 'TV Today Network',
    resolution: 'HD',
  },
  {
    id: 'ABPNews.in',
    name: 'ABP News',
    streamUrl: 'https://abplivetv.akamaized.net/hls/live/2043010/hindi/master.m3u8',
    language: 'Hindi',
    category: 'News',
    network: 'ABP Network',
    resolution: 'HD',
  },
  {
    id: 'NDTV24x7.in',
    name: 'NDTV 24x7',
    streamUrl: 'https://ndtv24x7elemarchana.akamaized.net/hls/live/2003678/ndtv24x7/master.m3u8',
    language: 'English',
    category: 'News',
    network: 'NDTV',
    resolution: 'HD',
  },
  {
    id: 'NDTVIndia.in',
    name: 'NDTV India',
    streamUrl: 'https://ndtvindiaelemarchana.akamaized.net/hls/live/2003679/ndtvindia/master.m3u8',
    language: 'Hindi',
    category: 'News',
    network: 'NDTV',
    resolution: 'HD',
  },
  {
    id: 'WION.in',
    name: 'WION',
    streamUrl: 'https://d7x8z4uqm428c.cloudfront.net/index_4.m3u8',
    language: 'English',
    category: 'News',
    network: 'Zee Media',
    resolution: 'HD',
  },
  {
    id: 'ABPAnanda.in',
    name: 'ABP Ananda',
    streamUrl: 'https://abplivetv.akamaized.net/hls/live/2043011/ananda/master.m3u8',
    language: 'Bengali',
    category: 'News',
    network: 'ABP Network',
    resolution: 'HD',
  },
  {
    id: 'ABPMajha.in',
    name: 'ABP Majha',
    streamUrl: 'https://abplivetv.akamaized.net/hls/live/2043012/majha/master.m3u8',
    language: 'Marathi',
    category: 'News',
    network: 'ABP Network',
    resolution: 'HD',
  },
  {
    id: 'ABPAsmita.in',
    name: 'ABP Asmita',
    streamUrl: 'https://abplivetv.akamaized.net/hls/live/2043013/asmita/master.m3u8',
    language: 'Gujarati',
    category: 'News',
    network: 'ABP Network',
    resolution: 'HD',
  },
  {
    id: 'ABPSanjha.in',
    name: 'ABP Sanjha',
    streamUrl: 'https://abplivetv.akamaized.net/hls/live/2043014/sanjha/master.m3u8',
    language: 'Punjabi',
    category: 'News',
    network: 'ABP Network',
    resolution: 'HD',
  },
  {
    id: '9XM.in',
    name: '9XM',
    streamUrl: 'https://d2q8p4pe5spbak.cloudfront.net/bpk-tv/9XM/9XM.isml/index.m3u8',
    language: 'Hindi',
    category: 'Music',
    network: '9X Media',
    resolution: 'HD',
  },
  {
    id: 'B4UMusic.in',
    name: 'B4U Music',
    streamUrl: 'https://cdnb4u.wiseplayout.com/B4U_Music/master.m3u8',
    language: 'Hindi',
    category: 'Music',
    network: 'B4U Network',
    resolution: 'HD',
  },
  {
    id: 'B4UMovies.in',
    name: 'B4U Movies',
    streamUrl: 'https://cdnb4u.wiseplayout.com/B4U_Movies/master.m3u8',
    language: 'Hindi',
    category: 'Movies',
    network: 'B4U Network',
    resolution: 'HD',
  },
  {
    id: 'B4UKadak.in',
    name: 'B4U Kadak',
    streamUrl: 'https://cdnb4u.wiseplayout.com/B4U_Kadak/master.m3u8',
    language: 'Hindi',
    category: 'Movies',
    network: 'B4U Network',
    resolution: 'HD',
  },
  {
    id: 'Mastiii.in',
    name: 'Mastiii',
    streamUrl: 'https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376bd8417a1b6761138aa41c26c7309312/mastiii/23805012-71c8-4c4c-83b5-4c36d021cb6d/0.m3u8',
    language: 'Hindi',
    category: 'Music',
    network: 'Sri Adhikari Brothers',
    resolution: 'HD',
  },
  {
    id: 'PuthiyaThalaimurai.in',
    name: 'Puthiya Thalaimurai',
    streamUrl: 'https://segment.yuppcdn.net/240122/puthiya/playlist.m3u8',
    language: 'Tamil',
    category: 'News',
    network: 'New Generation Media',
    resolution: 'HD',
  },
  {
    id: 'PolimerNews.in',
    name: 'Polimer News',
    streamUrl: 'https://cdn-1.pishow.tv/live/1262/master.m3u8',
    language: 'Tamil',
    category: 'News',
    network: 'Polimer Media',
    resolution: 'SD',
  },
  {
    id: 'TV9Telugu.in',
    name: 'TV9 Telugu',
    streamUrl: 'https://dyj6gt4964deb.cloudfront.net/live/ram-ram/master.m3u8',
    language: 'Telugu',
    category: 'News',
    network: 'TV9 Network',
    resolution: 'HD',
  },
  {
    id: 'AsianetNews.in',
    name: 'Asianet News',
    streamUrl: 'https://vidcdn.vidgyor.com/asianet-origin/liveabr/playlist.m3u8',
    language: 'Malayalam',
    category: 'News',
    network: 'Asianet News Network',
    resolution: 'HD',
  },
  {
    id: 'ManoramaNews.in',
    name: 'Manorama News',
    streamUrl: 'https://mmtvnews1.akamaized.net/v1/master/673630b269b766886555eebfddd4f27f3de3ab50/mmtvNewsCampaign1/index.m3u8',
    language: 'Malayalam',
    category: 'News',
    network: 'MM TV',
    resolution: 'HD',
  },
  {
    id: 'TV9Kannada.in',
    name: 'TV9 Kannada',
    streamUrl: 'https://dyj6gt4964deb.cloudfront.net/live/tv9kannada/master.m3u8',
    language: 'Kannada',
    category: 'News',
    network: 'TV9 Network',
    resolution: 'HD',
  },
  {
    id: 'PTCPunjabi.in',
    name: 'PTC Punjabi',
    streamUrl: 'https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376bd8417a1b6761138aa41c26c7309312/ptc-punjabi/6f89f2e4-7e3b-4c69-8840-500689715140/0.m3u8',
    language: 'Punjabi',
    category: 'Entertainment',
    network: 'PTC Network',
    resolution: 'HD',
  },
  {
    id: 'AasthaTV.in',
    name: 'Aastha TV',
    streamUrl: 'https://aasthaott.akamaized.net/110923/smil:aasthatv.smil/playlist.m3u8',
    language: 'Hindi',
    category: 'Devotional',
    network: 'Aastha Broadcasting',
    resolution: 'HD',
  },
  {
    id: 'SanskarTV.in',
    name: 'Sanskar TV',
    streamUrl: 'https://d26a5d4x1x6k3q.cloudfront.net/out/v1/684a36e2f2b546328a1f2857b4a8e4b6/index.m3u8',
    language: 'Hindi',
    category: 'Devotional',
    network: 'Sanskar Info TV',
    resolution: 'HD',
  },
];

const LANG_CODE_MAP: Record<string, IndianLanguage> = {
  hin: 'Hindi',
  hi: 'Hindi',
  eng: 'English',
  en: 'English',
  tam: 'Tamil',
  ta: 'Tamil',
  tel: 'Telugu',
  te: 'Telugu',
  mal: 'Malayalam',
  ml: 'Malayalam',
  kan: 'Kannada',
  kn: 'Kannada',
  mar: 'Marathi',
  mr: 'Marathi',
  ben: 'Bengali',
  bn: 'Bengali',
  guj: 'Gujarati',
  gu: 'Gujarati',
  pan: 'Punjabi',
  pa: 'Punjabi',
  ori: 'Odia',
  ory: 'Odia',
  or: 'Odia',
  asm: 'Assamese',
  as: 'Assamese',
  urd: 'Urdu',
  ur: 'Urdu',
  bho: 'Bhojpuri',
};

function inferLanguage(name: string, group: string, meta?: IptvChannelMeta): IndianLanguage {
  if (meta?.languages?.length) {
    for (const code of meta.languages) {
      const mapped = LANG_CODE_MAP[code.toLowerCase()];
      if (mapped) return mapped;
    }
  }

  const haystack = `${name} ${group}`.toLowerCase();
  if (/\btamil\b|podhigai|sun news|kalaignar|polimer|jaya|puthiya|thanthi|sirippoli|isai|adithya|vasanth|makkal|vendhar|peppers|velicham/.test(haystack)) {
    return 'Tamil';
  }
  if (/\btelugu\b|yadagiri|saptagiri|etv|ntv|tv5|sakshi|abn|v6|hmtv|t news|mahaa|10tv|svbc|bhakti/.test(haystack)) {
    return 'Telugu';
  }
  if (/\bmalayalam\b|asianet|manorama|mathrubhumi|kairali|amrita|mediaone|reporter|janam|flowers|mazhavil|jeevan|kaumudy|safari/.test(haystack)) {
    return 'Malayalam';
  }
  if (/\bkannada\b|chandana|suvarna|public tv|kasturi|udaya|power tv|dighvijay|sri sankara/.test(haystack)) {
    return 'Kannada';
  }
  if (/\bmarathi\b|sahyadri|majha|saam|lokshahi|zee 24 taas|jai maharashtra|fakt marathi|shemaroo marathibana|maiboli/.test(haystack)) {
    return 'Marathi';
  }
  if (/\bbengali\b|\bbangla\b|ananda|24 ghanta|calcutta|kolkata|tarang bangla|sangeet bangla|dhoom|r plus|cn news|akd/.test(haystack)) {
    return 'Bengali';
  }
  if (/\bgujarati\b|girnar|asmita|sandesh|vtv|gstv|mantavya|tv9 gujarati/.test(haystack)) {
    return 'Gujarati';
  }
  if (/\bpunjabi\b|ptc|sanjha|mh1|chardikla|tadka|josh|pitara|9x tashan|pitaara/.test(haystack)) {
    return 'Punjabi';
  }
  if (/\bodia\b|\boriya\b|otv|kanak|kalinga|prameya|nandighosha|argus|mbc|tarang|alankar|prarthana/.test(haystack)) {
    return 'Odia';
  }
  if (/\bassamese\b|prag|dy 365|news live|pratidin|ramdhenu|rang|jonack|northeast/.test(haystack)) {
    return 'Assamese';
  }
  if (/\bbhojpuri\b|dabangg|b4u bhojpuri|bhojpuri cinema|sangeet bhojpuri|oscar movies bhojpuri/.test(haystack)) {
    return 'Bhojpuri';
  }
  if (/\burdu\b|kashir|dd urdu|etv urdu|munsif|gulistan|tehzeeb/.test(haystack)) {
    return 'Urdu';
  }
  if (/\benglish\b|wion|india today|ndtv 24x7|republic tv|times now|cnn news18|mirror now|cnbc tv18|et now|dd india|bloomberg/.test(haystack)) {
    return 'English';
  }
  return 'Hindi';
}

function inferCategory(name: string, group: string, meta?: IptvChannelMeta): TvCategory {
  const rawCats = [
    ...(meta?.categories || []),
    group,
  ]
    .join(' ')
    .toLowerCase();
  const full = `${name.toLowerCase()} ${rawCats}`;

  if (/sport|cricket|football|kabaddi|dd sports/.test(full)) return 'Sports';
  if (/business|cnbc|et now|bloomberg|zeebiz|zee business|profit/.test(full)) return 'Business';
  if (/news|samachar|live|vartha|taas|ghanta|24x7|sansad|lok sabha|rajya sabha|aaj tak|abp|ndtv|wion|republic|tv9/.test(full)) {
    return 'News';
  }
  if (/music|9x|mtv|mastiii|b4u music|zing|sangeet|tashan|isai|raj musix/.test(full)) return 'Music';
  if (/movie|cinema|film|goldmines|b4u movies|b4u kadak|plex|bollywood/.test(full)) return 'Movies';
  if (/religious|devotional|bhakti|aastha|sanskar|satsang|peace|god|shubh|vedic|svbc|prarthana|shraddha|arihant|sadhna|mahavira/.test(full)) {
    return 'Devotional';
  }
  if (/kids|cartoon|animation|pogo|nick|chutti|chintu|kushi|balbharati/.test(full)) return 'Kids';
  if (/documentary|education|science|travel|safari|history|discovery|bharati|gyan|swayam|pm evidya|kishore/.test(full)) {
    return 'Infotainment';
  }
  if (/regional|kendra|podhigai|chandana|sahyadri|yadagiri|saptagiri|girnar|bangla|kashir/.test(full)) {
    return 'Regional';
  }
  return 'Entertainment';
}

function parseM3uPlaylist(m3uText: string, metaMap: Map<string, IptvChannelMeta>, isCustom = false): Omit<TvChannel, 'number'>[] {
  const lines = m3uText.split(/\r?\n/);
  const parsed: Omit<TvChannel, 'number'>[] = [];

  let pendingMeta: {
    tvgId?: string;
    logo?: string;
    group?: string;
    name?: string;
    resolution?: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const commaIdx = line.lastIndexOf(',');
      const rawName = commaIdx !== -1 ? line.slice(commaIdx + 1).trim() : 'Indian TV Channel';

      const resMatch = rawName.match(/\b(1080p|720p|480p|360p|HD|4K|SD)\b/i);
      const cleanName = rawName.replace(/\s*\((1080p|720p|480p|360p|Geo-blocked|Not 24\/7)\)/gi, '').trim();

      pendingMeta = {
        tvgId: tvgIdMatch?.[1]?.trim(),
        logo: logoMatch?.[1]?.trim(),
        group: groupMatch?.[1]?.trim() || '',
        name: cleanName || rawName,
        resolution: resMatch?.[1]?.toUpperCase() || (rawName.toLowerCase().includes('hd') ? 'HD' : 'SD'),
      };
    } else if (!line.startsWith('#') && /^https?:\/\//i.test(line)) {
      if (pendingMeta) {
        const meta = pendingMeta.tvgId ? metaMap.get(pendingMeta.tvgId) : undefined;
        if (meta?.is_nsfw) {
          pendingMeta = null;
          continue;
        }
        const name = pendingMeta.name || meta?.name || 'Channel';
        const language = inferLanguage(name, pendingMeta.group || '', meta);
        const category = inferCategory(name, pendingMeta.group || '', meta);

        parsed.push({
          id: pendingMeta.tvgId || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${parsed.length}`,
          name,
          streamUrl: line,
          logo: pendingMeta.logo || meta?.logo || undefined,
          language,
          category,
          network: meta?.network || undefined,
          resolution: pendingMeta.resolution,
          isPublicBroadcaster: /^dd\s|sansad|swayam|gyan/i.test(name),
          isCustom,
        });
        pendingMeta = null;
      }
    }
  }

  return parsed;
}

// In-memory directory cache (30 mins)
let cachedDirectory: { channels: TvChannel[]; fetchedAt: number; source: 'live' | 'curated' } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000;

async function buildIndianChannelDirectory(): Promise<{ channels: TvChannel[]; source: 'live' | 'curated' }> {
  if (cachedDirectory && Date.now() - cachedDirectory.fetchedAt < CACHE_TTL_MS) {
    return { channels: cachedDirectory.channels, source: cachedDirectory.source };
  }

  const metaMap = new Map<string, IptvChannelMeta>();
  let parsedUpstream: Omit<TvChannel, 'number'>[] = [];
  let source: 'live' | 'curated' = 'curated';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const [m3uRes, channelsJsonRes] = await Promise.allSettled([
      fetch('https://iptv-org.github.io/iptv/countries/in.m3u', { signal: controller.signal }),
      fetch('https://iptv-org.github.io/api/channels.json', { signal: controller.signal }),
    ]);

    clearTimeout(timeout);

    if (channelsJsonRes.status === 'fulfilled' && channelsJsonRes.value.ok) {
      const allMeta = (await channelsJsonRes.value.json()) as IptvChannelMeta[];
      for (const item of allMeta) {
        if (item.country === 'IN' || item.id?.endsWith('.in')) {
          metaMap.set(item.id, item);
        }
      }
    }

    if (m3uRes.status === 'fulfilled' && m3uRes.value.ok) {
      const m3uText = await m3uRes.value.text();
      parsedUpstream = parseM3uPlaylist(m3uText, metaMap, false);
      if (parsedUpstream.length > 0) {
        source = 'live';
      }
    }
  } catch {
    // Gracefully fall back to curated Indian channels if upstream is unreachable
  }

  // Merge curated channels first (priority placement) + deduplicate by normalized name & streamUrl
  const seenUrls = new Set<string>();
  const seenNames = new Set<string>();
  const merged: Omit<TvChannel, 'number'>[] = [];

  for (const ch of [...CURATED_INDIAN_CHANNELS, ...parsedUpstream]) {
    const normUrl = ch.streamUrl.trim();
    const normName = ch.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenUrls.has(normUrl) || (normName && seenNames.has(normName))) {
      // Enrich logo if curated item lacked one and upstream has one
      if (ch.logo && normName) {
        const existing = merged.find((m) => m.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normName);
        if (existing && !existing.logo) {
          existing.logo = ch.logo;
        }
      }
      continue;
    }
    seenUrls.add(normUrl);
    if (normName) seenNames.add(normName);
    merged.push(ch);
  }

  // Assign Fire TV logical channel numbers starting at 101
  const numbered: TvChannel[] = merged.map((ch, idx) => ({
    ...ch,
    number: 101 + idx,
  }));

  cachedDirectory = {
    channels: numbered,
    fetchedAt: Date.now(),
    source,
  };

  return { channels: numbered, source };
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 0) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) {
      return true;
    }
  }
  return false;
}

async function validateSafeHttpUrl(rawUrl: string): Promise<URL> {
  const parsed = new URL(rawUrl);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only HTTP/HTTPS streams are supported');
  }
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new Error('Private hostnames are blocked');
  }
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('Private IPs are blocked');
  } else {
    const resolved = await dns.lookup(hostname, { all: true });
    for (const addr of resolved) {
      if (isPrivateIp(addr.address)) {
        throw new Error('Private network addresses are blocked');
      }
    }
  }
  return parsed;
}

function rewriteHlsManifest(manifestText: string, baseUrl: string): string {
  const lines = manifestText.split(/\r?\n/);
  const base = new URL(baseUrl);

  const toProxyUrl = (target: string): string => {
    const resolved = new URL(target, base).toString();
    return `/api/hls-proxy?url=${encodeURIComponent(resolved)}`;
  };

  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      // Rewrite URI="..." inside EXT-X-KEY / EXT-X-MAP / EXT-X-MEDIA
      if (trimmed.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/gi, (_match, uriValue: string) => {
          return `URI="${toProxyUrl(uriValue)}"`;
        });
      }

      // Segment or sub-playlist URI line
      return toProxyUrl(trimmed);
    })
    .join('\n');
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/channels', async (req, res) => {
    try {
      if (req.query.refresh === '1') {
        cachedDirectory = null;
      }
      const { channels, source } = await buildIndianChannelDirectory();
      res.json({
        channels,
        total: channels.length,
        source,
      });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to load channel directory',
      });
    }
  });

  app.post('/api/playlist/parse', async (req, res) => {
    try {
      const { url, content } = req.body as { url?: string; content?: string };
      let m3uText = content || '';

      if (!m3uText && url) {
        const safeUrl = await validateSafeHttpUrl(url);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const upstream = await fetch(safeUrl.toString(), {
          signal: controller.signal,
          headers: { 'User-Agent': 'BharatStreamTV/1.0' },
        });
        clearTimeout(timeout);
        if (!upstream.ok) {
          return res.status(400).json({ error: `Playlist URL returned HTTP ${upstream.status}` });
        }
        m3uText = await upstream.text();
      }

      if (!m3uText.trim()) {
        return res.status(400).json({ error: 'Provide a valid M3U playlist URL or M3U text content.' });
      }

      const parsed = parseM3uPlaylist(m3uText, new Map(), true);
      if (parsed.length === 0) {
        return res.status(400).json({ error: 'No playable HTTP/HTTPS streams were found in that playlist.' });
      }

      const numbered: TvChannel[] = parsed.map((ch, idx) => ({
        ...ch,
        number: 901 + idx,
      }));

      res.json({ channels: numbered, total: numbered.length });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Unable to parse M3U playlist',
      });
    }
  });

  app.get('/api/hls-proxy', async (req, res) => {
    const rawUrl = req.query.url;
    if (typeof rawUrl !== 'string' || !rawUrl) {
      return res.status(400).send('Missing url query parameter');
    }

    try {
      const targetUrl = await validateSafeHttpUrl(rawUrl);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const upstream = await fetch(targetUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 11; AFTMM) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
      });
      clearTimeout(timeout);

      if (!upstream.ok) {
        return res.status(upstream.status).send(`Upstream returned ${upstream.status}`);
      }

      const contentType = upstream.headers.get('content-type') || '';
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache');

      const isPlaylist =
        contentType.includes('mpegurl') ||
        contentType.includes('m3u') ||
        targetUrl.pathname.toLowerCase().endsWith('.m3u8');

      if (isPlaylist) {
        const text = await upstream.text();
        const rewritten = rewriteHlsManifest(text, upstream.url || targetUrl.toString());
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
        return res.send(rewritten);
      }

      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      const buffer = Buffer.from(await upstream.arrayBuffer());
      return res.send(buffer);
    } catch (err) {
      return res.status(502).send(err instanceof Error ? err.message : 'Relay fetch failed');
    }
  });

  // Dev Vite middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BharatStream TV server running on http://0.0.0.0:${PORT}`);
  });
}

createServer();
