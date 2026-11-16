import { useState } from 'react';
import type { TvChannel } from '../types/tv';

interface ChannelLogoProps {
  channel: Pick<TvChannel, 'name' | 'logo' | 'category'>;
  size?: 'sm' | 'md' | 'lg';
}

function getMonogram(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase() || 'TV';
}

export function ChannelLogo({ channel, size = 'md' }: ChannelLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeClasses =
    size === 'sm'
      ? 'w-10 h-10 text-xs rounded-lg'
      : size === 'lg'
        ? 'w-14 h-14 text-base rounded-xl'
        : 'w-12 h-12 text-sm rounded-xl';

  if (!channel.logo || imgFailed) {
    return (
      <div
        className={`${sizeClasses} shrink-0 bg-[#1B2434] border border-slate-700/60 flex items-center justify-center font-display font-semibold tracking-tight text-amber-300 select-none`}
        aria-hidden="true"
      >
        {getMonogram(channel.name)}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} shrink-0 bg-[#1B2434] border border-slate-700/60 flex items-center justify-center overflow-hidden p-1.5`}
    >
      <img
        src={channel.logo}
        alt={`${channel.name} logo`}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setImgFailed(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
