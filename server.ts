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
    name: 'DD National HD',
    streamUrl: 'https://fta.ektv.in/live/15/master.m3u8',
    language: 'Hindi',
    category: 'Entertainment',
    network: 'Prasar Bharati',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'DDNews.in',
    name: 'DD News HD',
    streamUrl: 'https://fta.ektv.in/live/117/117_0.m3u8',
    language: 'Hindi',
    category: 'News',
    network: 'Prasar Bharati',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'DDIndia.in',
    name: 'DD India',
    streamUrl: 'https://fta.ektv.in/live/119/119_0.m3u8',
    language: 'English',
    category: 'News',
    network: 'Prasar Bharati',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'DDBharati.in',
    name: 'DD Bharati',
    streamUrl: 'https://cdn.pishow.tv/ott/live/10/master.m3u8',
    language: 'Hindi',
    category: 'Infotainment',
    network: 'Prasar Bharati',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'DDSports.in',
    name: 'DD Sports',
    streamUrl: 'https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/b17adfe543354fdd8d189b110617cddd/index.m3u8',
    language: 'Hindi',
    category: 'Sports',
    network: 'Prasar Bharati',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'SansadTV1.in',
    name: 'Sansad TV 1 HD',
    streamUrl: 'https://d2lk5u59tns74c.cloudfront.net/out/v1/fff8f20221d5456e8922e689d71dedc3/index.m3u8',
    language: 'Hindi',
    category: 'News',
    network: 'Parliament of India',
    resolution: 'HD',
    isPublicBroadcaster: true,
  },
  {
    id: 'AajTak.in',
    name: 'Aaj Tak HD',
    streamUrl: 'https://feeds.intoday.in/aajtak/api/aajtakhd/master.m3u8',
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
    streamUrl: 'https://d1rc86nwwc9fag.cloudfront.net/vglive-sk-472500/abpnews/master.m3u8',
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
    streamUrl: 'https://backupndtvindiaelemarchana.akamaized.net/hls/live/2004134/ndtvindia/master_1.m3u8',
    language: 'Hindi',
    category: 'News',
    network: 'NDTV',
    resolution: 'HD',
  },
  {
    id: 'TV9Bharatvarsh.in',
    name: 'TV9 Bharatvarsh',
    streamUrl: 'https://amg01106-amg01106c2-amgplt0747.playout.now3.amagi.tv/amg01106c2/hls.m3u8',
    language: 'Hindi',
    category: 'News',
    network: 'TV9 Network',
    resolution: 'HD',
  },
  {
    id: 'ABPAnanda.in',
    name: 'ABP Ananda',
    streamUrl: 'https://d2l4ar6y3mrs4k.cloudfront.net/live-streaming/ananda-livetv/master.m3u8',
    language: 'Bengali',
    category: 'News',
    network: 'ABP Network',
    resolution: 'HD',
  },
  {
    id: 'ABPMajha.in',
    name: 'ABP Majha',
    streamUrl: 'https://cdn.pishow.tv/ott/live/471/master.m3u8',
    language: 'Marathi',
    category: 'News',
    network: 'ABP Network',
    resolution: 'HD',
  },
  {
    id: 'ABPAsmita.in',
    name: 'ABP Asmita',
    streamUrl: 'https://d2l4ar6y3mrs4k.cloudfront.net/live-streaming/asmita-livetv/master.m3u8',
    language: 'Gujarati',
    category: 'News',
    network: 'ABP Network',
    resolution: 'HD',
  },
  {
    id: 'ABPSanjha.in',
    name: 'ABP Sanjha',
    streamUrl: 'https://fta.ektv.in/live/641/master.m3u8',
    language: 'Punjabi',
    category: 'News',
    network: 'ABP Network',
    resolution: 'HD',
  },
  {
    id: 'B4UMusic.in',
    name: 'B4U Music',
    streamUrl: 'https://amg00877-b4unew-amg00877c3-xiaomi-in-5474.playouts.now.amagi.tv/720p/index.m3u8',
    language: 'Hindi',
    category: 'Music',
    network: 'B4U Network',
    resolution: 'HD',
  },
  {
    id: 'B4UMovies.in',
    name: 'B4U Movies',
    streamUrl: 'https://amg00877-b4unew-amg00877c2-xiaomi-in-5489.playouts.now.amagi.tv/playlist.m3u8',
    language: 'Hindi',
    category: 'Movies',
    network: 'B4U Network',
    resolution: 'HD',
  },
  {
    id: 'B4UKadak.in',
    name: 'B4U Kadak',
    streamUrl: 'https://amg00877-b4unew-amg00877c4-xiaomi-in-5473.playouts.now.amagi.tv/playlist.m3u8',
    language: 'Hindi',
    category: 'Movies',
    network: 'B4U Network',
    resolution: 'HD',
  },
  {
    id: '9XJhakaas.in',
    name: '9X Jhakaas',
    streamUrl: 'https://amg01281-9xmediapvtltd-9xjhakaas-samsungin-ci2cs.amagi.tv/playlist/amg01281-9xmediapvtltd-9xjhakaas-samsungin/playlist.m3u8',
    language: 'Marathi',
    category: 'Music',
    network: '9X Media',
    resolution: 'HD',
  },
  {
    id: '9XTashan.in',
    name: '9X Tashan',
    streamUrl: 'https://amg01281-9xmediapvtltd-9xtashan-samsungin-xz1sd.amagi.tv/playlist/amg01281-9xmediapvtltd-9xtashan-samsungin/playlist.m3u8',
    language: 'Punjabi',
    category: 'Music',
    network: '9X Media',
    resolution: 'HD',
  },
  {
    id: 'PuthiyaThalaimurai.in',
    name: 'Puthiya Thalaimurai',
    streamUrl: 'https://cdn.pishow.tv/ott/live/1261/master.m3u8',
    language: 'Tamil',
    category: 'News',
    network: 'New Generation Media',
    resolution: 'HD',
  },
  {
    id: 'TV9Telugu.in',
    name: 'TV9 Telugu',
    streamUrl: 'https://amg01106-amg01106c4-amgplt0747.playout.now3.amagi.tv/amg01106c4/hls.m3u8',
    language: 'Telugu',
    category: 'News',
    network: 'TV9 Network',
    resolution: 'HD',
  },
  {
    id: 'AsianetSuvarnaNews.in',
    name: 'Asianet Suvarna News',
    streamUrl: 'https://asianet-prasarbharati.vgcdn.net/out/v1/bd05c931d9d94d288bbe455cc0f7e229/playlist.m3u8',
    language: 'Kannada',
    category: 'News',
    network: 'Asianet News Network',
    resolution: 'HD',
  },
  {
    id: 'TV9Kannada.in',
    name: 'TV9 Kannada',
    streamUrl: 'https://amg01106-amg01106c5-amgplt0747.playout.now3.amagi.tv/amg01106c5/hls.m3u8',
    language: 'Kannada',
    category: 'News',
    network: 'TV9 Network',
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
    id: 'AasthaTV.in',
    name: 'Aastha HD',
    streamUrl: 'https://aasthaott.akamaized.net/110923/smil:aasthatv.smil/index.m3u8',
    language: 'Hindi',
    category: 'Devotional',
    network: 'Aastha Broadcasting',
    resolution: 'HD',
  },
  {
    id: 'SanskarTV.in',
    name: 'Sanskar TV',
    streamUrl: 'https://d26idhjf0y1p2g.cloudfront.net/out/v1/cd66dd25b9774cb29943bab54bbf3e2f/index.m3u8',
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

  // Merge live upstream URLs first when available so fresh iptv-org streams override static fallbacks
  const seenUrls = new Set<string>();
  const seenNames = new Set<string>();
  const merged: Omit<TvChannel, 'number'>[] = [];

  for (const ch of [...CURATED_INDIAN_CHANNELS, ...parsedUpstream]) {
    const normUrl = ch.streamUrl.trim();
    const normName = ch.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenUrls.has(normUrl)) continue;
    if (normName && seenNames.has(normName)) {
      const existing = merged.find((m) => m.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normName);
      if (existing) {
        if (ch.logo && !existing.logo) existing.logo = ch.logo;
        // Prefer fresh HTTPS upstream stream over curated fallback
        if (normUrl.startsWith('https://')) existing.streamUrl = normUrl;
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

      const buffer = Buffer.from(await upstream.arrayBuffer());
      const headSnippet = buffer.subarray(0, 64).toString('utf8').trimStart();
      const isPlaylist =
        contentType.includes('mpegurl') ||
        contentType.includes('m3u') ||
        targetUrl.pathname.toLowerCase().endsWith('.m3u8') ||
        headSnippet.startsWith('#EXTM3U');

      if (isPlaylist) {
        const text = buffer.toString('utf8');
        const rewritten = rewriteHlsManifest(text, upstream.url || targetUrl.toString());
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
        return res.send(rewritten);
      }

      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
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
