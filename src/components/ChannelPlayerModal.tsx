import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ListVideo,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RefreshCw,
  ShieldCheck,
  SkipForward,
  Star,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { getChannelEpgSchedule } from '../data/indianTvTaxonomy';
import type { TvChannel } from '../types/tv';
import { ChannelLogo } from './ChannelLogo';

interface ChannelPlayerModalProps {
  channel: TvChannel;
  allChannels: TvChannel[];
  isFavorite: boolean;
  onClose: () => void;
  onSelectChannel: (channel: TvChannel) => void;
  onToggleFavorite: (channelId: string) => void;
}

interface QualityLevel {
  index: number;
  label: string;
}

export function ChannelPlayerModal({
  channel,
  allChannels,
  isFavorite,
  onClose,
  onSelectChannel,
  onToggleFavorite,
}: ChannelPlayerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideHudTimerRef = useRef<number | null>(null);

  const [useRelay, setUseRelay] = useState(false);
  const [status, setStatus] = useState<'loading' | 'playing' | 'paused' | 'error'>('loading');
  const [errorDetail, setErrorDetail] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideQuery, setGuideQuery] = useState('');
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);

  const currentIndex = useMemo(
    () => allChannels.findIndex((c) => c.id === channel.id),
    [allChannels, channel.id]
  );

  const epgSlots = useMemo(() => getChannelEpgSchedule(channel), [channel]);
  const currentProgram = epgSlots[0];
  const nextProgram = epgSlots[1];

  const filteredGuideChannels = useMemo(() => {
    const q = guideQuery.trim().toLowerCase();
    if (!q) return allChannels.slice(0, 80);
    return allChannels
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.language.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          String(c.number).includes(q)
      )
      .slice(0, 80);
  }, [allChannels, guideQuery]);

  const bumpHud = useCallback(() => {
    setHudVisible(true);
    if (hideHudTimerRef.current) {
      window.clearTimeout(hideHudTimerRef.current);
    }
    hideHudTimerRef.current = window.setTimeout(() => {
      if (!guideOpen) {
        setHudVisible(false);
      }
    }, 4500);
  }, [guideOpen]);

  const zapChannel = useCallback(
    (delta: number) => {
      if (allChannels.length === 0) return;
      const idx = currentIndex >= 0 ? currentIndex : 0;
      const nextIdx = (idx + delta + allChannels.length) % allChannels.length;
      setUseRelay(false);
      onSelectChannel(allChannels[nextIdx]);
    },
    [allChannels, currentIndex, onSelectChannel]
  );

  // Reset relay & status on channel change
  useEffect(() => {
    setStatus('loading');
    setErrorDetail('');
    setQualityLevels([]);
    setSelectedQuality(-1);
    bumpHud();
  }, [channel.id, bumpHud]);

  // Attach HLS stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const playbackUrl = useRelay
      ? `/api/hls-proxy?url=${encodeURIComponent(channel.streamUrl)}`
      : channel.streamUrl;

    setStatus('loading');
    setErrorDetail('');

    const startPlayback = () => {
      video.volume = volume;
      video.muted = isMuted;
      video
        .play()
        .then(() => {
          setStatus('playing');
        })
        .catch(() => {
          // Autoplay with audio might be blocked; mute & play so TV starts immediately
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => setStatus('playing'))
            .catch(() => setStatus('paused'));
        });
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        manifestLoadingTimeOut: 10000,
        fragLoadingTimeOut: 12000,
      });
      hlsRef.current = hls;

      hls.loadSource(playbackUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels: QualityLevel[] = data.levels.map((lvl, idx) => ({
          index: idx,
          label: lvl.height ? `${lvl.height}p` : `Stream ${idx + 1}`,
        }));
        setQualityLevels(levels);
        startPlayback();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        // If direct playback failed due to CORS or network restriction, auto-switch to server relay once
        if (!useRelay) {
          setUseRelay(true);
          return;
        }

        setStatus('error');
        setErrorDetail(
          data.type === Hls.ErrorTypes.NETWORK_ERROR
            ? 'This broadcaster stream is currently offline or geo-restricted outside India.'
            : 'Unable to decode this live stream format in the browser.'
        );
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    // Native HLS (Safari / iOS)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playbackUrl;
      const onLoaded = () => startPlayback();
      const onError = () => {
        if (!useRelay) {
          setUseRelay(true);
        } else {
          setStatus('error');
          setErrorDetail('Stream unavailable or geo-restricted.');
        }
      };
      video.addEventListener('loadedmetadata', onLoaded);
      video.addEventListener('error', onError);
      return () => {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onError);
      };
    }

    setStatus('error');
    setErrorDetail('HLS playback is not supported in this browser.');
    return undefined;
  }, [channel.streamUrl, useRelay]);

  // Sync mute & volume
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video.volume = volume;
  }, [isMuted, volume]);

  // Keyboard / Fire TV Remote controls inside player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === 'INPUT';
      bumpHud();

      if (e.key === 'Escape') {
        if (guideOpen) {
          setGuideOpen(false);
        } else {
          onClose();
        }
        return;
      }

      if (isInput) return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
          video.play().then(() => setStatus('playing')).catch(() => {});
        } else {
          video.pause();
          setStatus('paused');
        }
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((m) => !m);
      } else if (e.key === 'g' || e.key === 'G') {
        setGuideOpen((g) => !g);
      } else if (e.key === 'f' || e.key === 'F') {
        onToggleFavorite(channel.id);
      } else if (e.key === 'PageUp' || (!guideOpen && e.key === 'ArrowUp')) {
        e.preventDefault();
        zapChannel(-1);
      } else if (e.key === 'PageDown' || (!guideOpen && e.key === 'ArrowDown')) {
        e.preventDefault();
        zapChannel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bumpHud, channel.id, guideOpen, onClose, onToggleFavorite, zapChannel]);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    bumpHud();
    if (video.paused) {
      video.play().then(() => setStatus('playing')).catch(() => {});
    } else {
      video.pause();
      setStatus('paused');
    }
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen denial
    }
  };

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // Ignore PiP failure
    }
  };

  const handleQualityChange = (levelIndex: number) => {
    setSelectedQuality(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Watching ${channel.name}`}
      onMouseMove={bumpHud}
      onClick={bumpHud}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none"
    >
      {/* Video Canvas */}
      <video
        ref={videoRef}
        playsInline
        className="w-full h-full object-contain bg-black"
        onClick={togglePlayPause}
      />

      {/* Buffering State */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F17]/75 pointer-events-none gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
          <div className="text-center space-y-1">
            <p className="font-display text-lg font-semibold text-white">
              Tuning Ch {channel.number} · {channel.name}
            </p>
            <p className="text-xs text-slate-400">
              {useRelay ? 'Connecting via Server Stream Relay...' : 'Connecting to live internet broadcast...'}
            </p>
          </div>
        </div>
      )}

      {/* Stream Error / Geo-block Recovery State */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B0F17]/95 p-6 z-20">
          <div className="max-w-lg w-full rounded-2xl bg-[#131924] border border-slate-800 p-7 space-y-5">
            <div className="flex items-center gap-4">
              <ChannelLogo channel={channel} size="lg" />
              <div>
                <p className="font-mono text-xs text-amber-400 tabular-nums">
                  CH {channel.number} · {channel.language} · {channel.category}
                </p>
                <h2 className="font-display text-xl font-bold text-white mt-0.5">
                  {channel.name} Stream Unavailable
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {errorDetail} Some Indian broadcasters geo-restrict streams outside India or rotate live token URLs periodically.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStatus('loading');
                  setUseRelay((r) => !r);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-[#0B0F17] text-sm font-semibold hover:bg-amber-300 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{useRelay ? 'Retry Direct Stream' : 'Try Server Relay'}</span>
              </button>

              <button
                type="button"
                onClick={() => zapChannel(1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A2232] border border-slate-700 text-slate-100 text-sm font-medium hover:bg-[#243046] transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>Next Channel</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-300 text-sm font-medium hover:text-white cursor-pointer"
              >
                <span>Back to Channels</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Player HUD */}
      <div
        className={`absolute top-0 inset-x-0 z-20 p-5 sm:p-7 bg-gradient-to-b from-black/90 via-black/55 to-transparent transition-opacity duration-200 ${
          hudVisible || status === 'error' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131924]/90 border border-slate-700/80 text-slate-100 text-sm font-medium hover:border-amber-400 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <ChannelLogo channel={channel} size="sm" />

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono tabular-nums">
                <span className="text-amber-400 font-semibold">CH {channel.number}</span>
                <span aria-hidden="true">·</span>
                <span className="font-sans">{channel.language}</span>
                <span aria-hidden="true">·</span>
                <span className="font-sans">{channel.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-sans text-emerald-400 font-semibold">LIVE</span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white truncate">
                {channel.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(channel.id)}
              aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131924]/90 border border-slate-700/80 text-slate-200 text-sm hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={() => setGuideOpen((o) => !o)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131924]/90 border border-slate-700/80 text-slate-100 text-sm font-medium hover:border-amber-400 transition-colors cursor-pointer"
            >
              <ListVideo className="w-4 h-4 text-amber-400" />
              <span>Channel List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Player Controls & Program Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 p-5 sm:p-7 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-200 ${
          hudVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-[1440px] mx-auto space-y-4">
          {/* Current + Up Next IST Program */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="space-y-0.5">
              <p className="text-white font-medium">
                On Now: {currentProgram.title}
                <span className="text-slate-400 font-mono tabular-nums ml-2">
                  {currentProgram.startTime} – {currentProgram.endTime} IST
                </span>
              </p>
              <p className="text-slate-400 text-xs">
                Up Next: {nextProgram.title} ({nextProgram.startTime})
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span>{useRelay ? 'Relay Mode' : 'Direct HLS'}</span>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayPause}
                aria-label={status === 'playing' ? 'Pause' : 'Play'}
                className="w-10 h-10 rounded-xl bg-amber-400 text-[#0B0F17] flex items-center justify-center hover:bg-amber-300 transition-colors cursor-pointer"
              >
                {status === 'playing' ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={() => zapChannel(-1)}
                aria-label="Previous channel"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#131924] border border-slate-700/80 text-slate-200 text-xs font-medium hover:border-amber-400 transition-colors cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
                <span>Ch-</span>
              </button>

              <button
                type="button"
                onClick={() => zapChannel(1)}
                aria-label="Next channel"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#131924] border border-slate-700/80 text-slate-200 text-xs font-medium hover:border-amber-400 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Ch+</span>
              </button>

              <div className="flex items-center gap-2 ml-2">
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="w-9 h-9 rounded-lg bg-[#131924] border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-amber-400 cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  aria-label="Volume"
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setVolume(next);
                    if (next > 0 && isMuted) setIsMuted(false);
                  }}
                  className="w-20 sm:w-24 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {qualityLevels.length > 0 && (
                <select
                  aria-label="Video quality"
                  value={selectedQuality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-[#131924] border border-slate-700/80 text-slate-200 text-xs font-medium cursor-pointer"
                >
                  <option value={-1}>Quality: Auto</option>
                  {qualityLevels.map((lvl) => (
                    <option key={lvl.index} value={lvl.index}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => setUseRelay((r) => !r)}
                className="px-3 py-2 rounded-xl bg-[#131924] border border-slate-700/80 text-slate-200 text-xs font-medium hover:border-amber-400 transition-colors cursor-pointer"
              >
                {useRelay ? 'Switch to Direct' : 'Use Relay'}
              </button>

              {document.pictureInPictureEnabled && (
                <button
                  type="button"
                  onClick={togglePip}
                  aria-label="Picture in Picture"
                  className="w-9 h-9 rounded-xl bg-[#131924] border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-amber-400 cursor-pointer"
                >
                  <PictureInPicture2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="w-9 h-9 rounded-xl bg-[#131924] border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-amber-400 cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* In-Player Quick Channel Switcher Drawer */}
      {guideOpen && (
        <aside
          aria-label="Quick Channel Switcher"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-[#0B0F17]/95 backdrop-blur-xl border-l border-slate-800 z-30 flex flex-col"
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
            <h3 className="font-display text-base font-semibold text-white">
              Quick Channel Surf
            </h3>
            <button
              type="button"
              onClick={() => setGuideOpen(false)}
              aria-label="Close channel list"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b border-slate-800/80">
            <input
              type="search"
              value={guideQuery}
              onChange={(e) => setGuideQuery(e.target.value)}
              placeholder="Filter by name, language, or CH..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#131924] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto tv-scroll p-2 space-y-1">
            {filteredGuideChannels.map((ch) => {
              const active = ch.id === channel.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setUseRelay(false);
                    onSelectChannel(ch);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-400/15 border border-amber-400/60'
                      : 'hover:bg-[#131924] border border-transparent'
                  }`}
                >
                  <ChannelLogo channel={ch} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                      <span className="text-amber-400 font-semibold">CH {ch.number}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans">{ch.language}</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{ch.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
}
