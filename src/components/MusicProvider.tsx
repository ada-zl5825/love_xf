"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DEFAULT_VOLUME = 0.55;

// Map each route to the track that should play there. Any route not listed
// here causes playback to pause.
const ROUTE_TRACKS: Record<string, string> = {
  "/": "/music/李荣浩 - 恋人.mp3",
  "/together": "/music/郭一凡 - 有我呢.mp3",
  "/messages": "/music/郭一凡 - 有我呢.mp3",
};

function resolveTrackForRoute(pathname: string | null): string | null {
  if (!pathname) return null;
  if (ROUTE_TRACKS[pathname]) return ROUTE_TRACKS[pathname];
  // Allow nested paths (e.g. /messages/xxx) to inherit the parent's track.
  const match = Object.keys(ROUTE_TRACKS)
    .filter((route) => route !== "/" && pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTE_TRACKS[match] : null;
}

type MusicContextValue = {
  isPlaying: boolean;
  isReady: boolean;
  currentTrack: string | null;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const pathname = usePathname();
  const currentTrack = resolveTrackForRoute(pathname);
  const trackRef = useRef<string | null>(currentTrack);

  useEffect(() => {
    trackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = DEFAULT_VOLUME;
  }, []);

  // Swap the <audio> source when the route-to-track mapping changes, and
  // pause on routes that don't have a track assigned.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      if (!audio.paused) audio.pause();
      setIsReady(false);
      return;
    }

    const nextSrc = encodeURI(currentTrack);
    const currentSrc = audio.getAttribute("src");
    if (currentSrc !== nextSrc) {
      const wasPlaying = !audio.paused;
      audio.src = nextSrc;
      audio.load();
      setIsReady(false);
      // Only auto-resume if we were already playing before the swap.
      // Otherwise wait for explicit play() (usually triggered after a
      // user gesture, since browsers block unsolicited autoplay).
      if (wasPlaying) {
        audio.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    // Guard: never start playback on routes without an assigned track.
    if (!trackRef.current) {
      setIsPlaying(false);
      return;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void play();
    } else {
      pause();
    }
  }, [play, pause]);

  const value = useMemo<MusicContextValue>(
    () => ({ isPlaying, isReady, currentTrack, play, pause, toggle }),
    [isPlaying, isReady, currentTrack, play, pause, toggle],
  );

  return (
    <MusicContext.Provider value={value}>
      <audio
        ref={audioRef}
        src={currentTrack ? encodeURI(currentTrack) : undefined}
        loop
        preload="auto"
        onCanPlay={() => setIsReady(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error("useMusic must be used within <MusicProvider>");
  }
  return ctx;
}
