"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Music2, Pause, Play, Radio, X } from "lucide-react";

type Track = {
  title: string;
  videoId: string;
};

const tracks: Track[] = [
  {
    title: "世界の終わり",
    videoId: "687OTbYopmg",
  },
  {
    title: "KETHER Playlist 02",
    videoId: "FlDq6K7kyf4",
  },
];

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (videoId: string) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          width?: number | string;
          height?: number | string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi() {
  return new Promise<void>((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    const oldReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      oldReady?.();
      resolve();
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
  });
}

export default function MiniMusicPlayer() {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const currentTrack = tracks[trackIndex];

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || playerRef.current || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player("kether-mini-youtube-player", {
        videoId: tracks[0].videoId,
        width: 1,
        height: 1,
        playerVars: {
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (!cancelled) setReady(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState?.ENDED) {
              setTrackIndex((old) => {
                const next = (old + 1) % tracks.length;
                playerRef.current?.loadVideoById(tracks[next].videoId);
                playerRef.current?.playVideo();
                return next;
              });
            }

            if (event.data === window.YT?.PlayerState?.PLAYING) {
              setPlaying(true);
            }

            if (event.data === window.YT?.PlayerState?.PAUSED) {
              setPlaying(false);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  function playTrack(index: number, shouldPlay = true) {
    const next = (index + tracks.length) % tracks.length;
    setTrackIndex(next);
    playerRef.current?.loadVideoById(tracks[next].videoId);

    if (shouldPlay) {
      playerRef.current?.playVideo();
      setPlaying(true);
    }
  }

  function togglePlay() {
    if (!ready || !playerRef.current) return;

    if (playing) {
      playerRef.current.pauseVideo();
      setPlaying(false);
      return;
    }

    playerRef.current.playVideo();
    setPlaying(true);
  }

  return (
    <aside className={`kether-mini-player ${collapsed ? "is-collapsed" : ""}`}>
      <div id="kether-mini-youtube-player" className="kether-mini-player-core" />

      {collapsed ? (
        <button
          type="button"
          className="kether-mini-bubble"
          onClick={() => setCollapsed(false)}
          aria-label="展開小希迷你播放器"
        >
          <Radio size={22} />
        </button>
      ) : (
        <>
          <div className="kether-mini-head">
            <div className="kether-mini-brand">
              <Music2 size={16} />
              <span>KETHER NEKO RADIO</span>
            </div>

            <button
              type="button"
              className="kether-mini-close"
              onClick={() => setCollapsed(true)}
              aria-label="收合小希迷你播放器"
            >
              <X size={16} />
            </button>
          </div>

          <div className="kether-mini-title">
            <span>{currentTrack.title}</span>
          </div>

          <div className="kether-mini-controls">
            <button type="button" onClick={() => playTrack(trackIndex - 1, true)} aria-label="上一首">
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              className="kether-mini-play"
              onClick={togglePlay}
              disabled={!ready}
              aria-label={playing ? "暫停" : "播放"}
            >
              {playing ? <Pause size={22} /> : <Play size={22} />}
            </button>

            <button type="button" onClick={() => playTrack(trackIndex + 1, true)} aria-label="下一首">
              <ChevronRight size={22} />
            </button>
          </div>

          <p className="kether-mini-note">
            {ready ? "點播放喚醒小希電波喵" : "小希正在連接 YouTube 星軌..."}
          </p>
        </>
      )}
    </aside>
  );
}
