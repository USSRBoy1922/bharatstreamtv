export type TvCategory =
  | 'All'
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

export type IndianLanguage =
  | 'All'
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

export interface TvChannel {
  id: string;
  number: number;
  name: string;
  streamUrl: string;
  logo?: string;
  language: Exclude<IndianLanguage, 'All'>;
  category: Exclude<TvCategory, 'All'>;
  network?: string;
  resolution?: string;
  isPublicBroadcaster?: boolean;
  isCustom?: boolean;
  country?: string;
}

export interface EpgProgram {
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  isLive: boolean;
  progressPercent: number;
}

export type AppView = 'live' | 'languages' | 'categories' | 'favorites' | 'guide';

export interface SpotlightItem {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<TvCategory, 'All'>;
  language: Exclude<IndianLanguage, 'All'>;
  image: string;
  featuredChannelNames: string[];
}
