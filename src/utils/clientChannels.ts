import type { IndianLanguage, TvCategory, TvChannel } from '../types/tv';

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
    streamUrl: 'https://amg01106-amg01106c5-amgplt0747.playout.now3.amagi.tv/amg01106c5/hls.m3u8',
    language: 'Kannada',
    category: 'News',
    network: 'TV9 Network',
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
    id: 'ABPAnanda.in',
    name: 'ABP Ananda',
    streamUrl: 'https://d2l4ar6y3mrs4k.cloudfront.net/live-streaming/ananda-livetv/master.m3u8',
    language: 'Bengali',
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
    id: '9XTashan.in',
    name: '9X Tashan',
    streamUrl: 'https://amg01281-9xmediapvtltd-9xtashan-samsungin-xz1sd.amagi.tv/playlist/amg01281-9xmediapvtltd-9xtashan-samsungin/playlist.m3u8',
    language: 'Punjabi',
    category: 'Music',
    network: '9X Media',
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

const LANG_CODE_MAP: Record<string, Exclude<IndianLanguage, 'All'>> = {
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

function inferLanguage(name: string, group: string, meta?: IptvChannelMeta): Exclude<IndianLanguage, 'All'> {
  if (meta?.languages?.length) {
    for (const code of meta.languages) {
      const mapped = LANG_CODE_MAP[code.toLowerCase()];
      if (mapped) return mapped;
    }
  }
  const haystack = `${name} ${group}`.toLowerCase();
  if (/\btamil\b|podhigai|sun news|kalaignar|polimer|jaya|puthiya|thanthi/.test(haystack)) return 'Tamil';
  if (/\btelugu\b|yadagiri|saptagiri|etv|ntv|tv5|sakshi|abn|v6/.test(haystack)) return 'Telugu';
  if (/\bmalayalam\b|asianet|manorama|mathrubhumi|kairali|amrita|mediaone|flowers/.test(haystack)) return 'Malayalam';
  if (/\bkannada\b|chandana|suvarna|public tv|kasturi|udaya/.test(haystack)) return 'Kannada';
  if (/\bmarathi\b|sahyadri|majha|saam|lokshahi|zee 24 taas/.test(haystack)) return 'Marathi';
  if (/\bbengali\b|\bbangla\b|ananda|24 ghanta|calcutta|kolkata/.test(haystack)) return 'Bengali';
  if (/\bgujarati\b|girnar|asmita|sandesh|vtv|gstv/.test(haystack)) return 'Gujarati';
  if (/\bpunjabi\b|ptc|sanjha|mh1|chardikla|tadka/.test(haystack)) return 'Punjabi';
  if (/\bodia\b|\boriya\b|otv|kanak|kalinga|prameya/.test(haystack)) return 'Odia';
  if (/\bassamese\b|prag|dy 365|news live|pratidin/.test(haystack)) return 'Assamese';
  if (/\bbhojpuri\b|dabangg|bhojpuri cinema/.test(haystack)) return 'Bhojpuri';
  if (/\burdu\b|kashir|dd urdu/.test(haystack)) return 'Urdu';
  if (/\benglish\b|wion|india today|ndtv 24x7|republic tv|times now|cnn news18|dd india/.test(haystack)) return 'English';
  return 'Hindi';
}

function inferCategory(name: string, group: string, meta?: IptvChannelMeta): Exclude<TvCategory, 'All'> {
  const full = `${name} ${group} ${(meta?.categories || []).join(' ')}`.toLowerCase();
  if (/sport|cricket|football|kabaddi|dd sports/.test(full)) return 'Sports';
  if (/business|cnbc|et now|bloomberg|zeebiz|profit/.test(full)) return 'Business';
  if (/news|samachar|live|vartha|taas|ghanta|24x7|sansad|aaj tak|abp|ndtv|wion|tv9/.test(full)) return 'News';
  if (/music|9x|mtv|mastiii|b4u music|zing|sangeet|tashan/.test(full)) return 'Music';
  if (/movie|cinema|film|goldmines|b4u movies|b4u kadak/.test(full)) return 'Movies';
  if (/religious|devotional|bhakti|aastha|sanskar|satsang|vedic|svbc|prarthana/.test(full)) return 'Devotional';
  if (/kids|cartoon|animation|pogo|nick|chutti/.test(full)) return 'Kids';
  if (/documentary|education|science|travel|safari|history|bharati|gyan|swayam/.test(full)) return 'Infotainment';
  if (/regional|kendra|podhigai|chandana|sahyadri|yadagiri|girnar|bangla|kashir/.test(full)) return 'Regional';
  return 'Entertainment';
}

export function parseM3uClient(
  m3uText: string,
  metaMap: Map<string, IptvChannelMeta>,
  isCustom = false
): Omit<TvChannel, 'number'>[] {
  const lines = m3uText.split(/\r?\n/);
  const parsed: Omit<TvChannel, 'number'>[] = [];
  let pending: { tvgId?: string; logo?: string; group?: string; name?: string; resolution?: string } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const commaIdx = line.lastIndexOf(',');
      const rawName = commaIdx !== -1 ? line.slice(commaIdx + 1).trim() : 'Indian TV Channel';
      const resMatch = rawName.match(/\b(1080p|720p|480p|360p|HD|4K|SD)\b/i);
      const cleanName = rawName.replace(/\s*\((1080p|720p|480p|360p|Geo-blocked|Not 24\/7)\)/gi, '').trim();

      pending = {
        tvgId: tvgIdMatch?.[1]?.trim(),
        logo: logoMatch?.[1]?.trim(),
        group: groupMatch?.[1]?.trim() || '',
        name: cleanName || rawName,
        resolution: resMatch?.[1]?.toUpperCase() || (rawName.toLowerCase().includes('hd') ? 'HD' : 'SD'),
      };
    } else if (!line.startsWith('#') && /^https?:\/\//i.test(line)) {
      if (pending) {
        const meta = pending.tvgId ? metaMap.get(pending.tvgId) : undefined;
        if (meta?.is_nsfw) {
          pending = null;
          continue;
        }
        const name = pending.name || meta?.name || 'Channel';
        parsed.push({
          id: pending.tvgId || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${parsed.length}`,
          name,
          streamUrl: line,
          logo: pending.logo || meta?.logo || undefined,
          language: inferLanguage(name, pending.group || '', meta),
          category: inferCategory(name, pending.group || '', meta),
          network: meta?.network || undefined,
          resolution: pending.resolution,
          isPublicBroadcaster: /^dd\s|sansad|swayam|gyan/i.test(name),
          isCustom,
        });
        pending = null;
      }
    }
  }
  return parsed;
}

export function isNativeCapacitorApp(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export async function loadIndianChannelsClientSide(): Promise<TvChannel[]> {
  const metaMap = new Map<string, IptvChannelMeta>();
  let upstream: Omit<TvChannel, 'number'>[] = [];

  try {
    const [m3uRes, metaRes] = await Promise.allSettled([
      fetch('https://iptv-org.github.io/iptv/countries/in.m3u'),
      fetch('https://iptv-org.github.io/api/channels.json'),
    ]);

    if (metaRes.status === 'fulfilled' && metaRes.value.ok) {
      const allMeta = (await metaRes.value.json()) as IptvChannelMeta[];
      for (const item of allMeta) {
        if (item.country === 'IN' || item.id?.endsWith('.in')) {
          metaMap.set(item.id, item);
        }
      }
    }

    if (m3uRes.status === 'fulfilled' && m3uRes.value.ok) {
      const text = await m3uRes.value.text();
      upstream = parseM3uClient(text, metaMap, false);
    }
  } catch {
    // Fall back gracefully to curated list
  }

  const seenUrls = new Set<string>();
  const seenNames = new Set<string>();
  const merged: Omit<TvChannel, 'number'>[] = [];

  for (const ch of [...CURATED_INDIAN_CHANNELS, ...upstream]) {
    const normUrl = ch.streamUrl.trim();
    const normName = ch.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenUrls.has(normUrl)) continue;
    if (normName && seenNames.has(normName)) {
      const existing = merged.find((m) => m.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normName);
      if (existing) {
        if (ch.logo && !existing.logo) existing.logo = ch.logo;
        if (normUrl.startsWith('https://')) existing.streamUrl = normUrl;
      }
      continue;
    }
    seenUrls.add(normUrl);
    if (normName) seenNames.add(normName);
    merged.push(ch);
  }

  return merged.map((ch, idx) => ({ ...ch, number: 101 + idx }));
}
