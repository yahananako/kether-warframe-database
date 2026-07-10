"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Music2, Pause, Play, Radio, X } from "lucide-react";

const playlistId = "PL0DMEhl0daHfpBbeTikS2MDA8darW0iyZ";
const playlistTitle = "小希 YouTube 播放清單";

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  cuePlaylist: (options: {
    listType: "playlist";
    list: string;
    index?: number;
  }) => void;
  getVideoData: () => {
    title?: string;
    video_id?: string;
  };
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
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
        CUED: number;
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
  const [playing, setPlaying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(playlistTitle);

  function syncTitle() {
    const title = playerRef.current?.getVideoData?.().title;

    if (title?.trim()) {
      setCurrentTitle(title);
    }
  }

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || playerRef.current || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player("kether-mini-youtube-player", {
        width: 1,
        height: 1,
        playerVars: {
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          listType: "playlist",
          list: playlistId,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (cancelled) return;

            playerRef.current?.cuePlaylist({
              listType: "playlist",
              list: playlistId,
              index: 0,
            });

            setReady(true);
            setTimeout(syncTitle, 400);
          },
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState?.PLAYING) {
              setPlaying(true);
              setTimeout(syncTitle, 350);
            }

            if (event.data === window.YT?.PlayerState?.PAUSED) {
              setPlaying(false);
              setTimeout(syncTitle, 350);
            }

            if (event.data === window.YT?.PlayerState?.CUED) {
              setTimeout(syncTitle, 350);
            }

            if (event.data === window.YT?.PlayerState?.ENDED) {
              playerRef.current?.nextVideo();
              playerRef.current?.playVideo();
              setTimeout(syncTitle, 650);
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

  function togglePlay() {
    if (!ready || !playerRef.current) return;

    if (playing) {
      playerRef.current.pauseVideo();
      setPlaying(false);
      return;
    }

    playerRef.current.playVideo();
    setPlaying(true);
    setTimeout(syncTitle, 500);
  }

  function nextTrack() {
    if (!ready || !playerRef.current) return;

    playerRef.current.nextVideo();
    playerRef.current.playVideo();
    setPlaying(true);
    setTimeout(syncTitle, 650);
  }

  function previousTrack() {
    if (!ready || !playerRef.current) return;

    playerRef.current.previousVideo();
    playerRef.current.playVideo();
    setPlaying(true);
    setTimeout(syncTitle, 650);
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
            <span>{currentTitle}</span>
          </div>

          <div className="kether-mini-controls">
            <button type="button" onClick={previousTrack} aria-label="上一首">
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

            <button type="button" onClick={nextTrack} aria-label="下一首">
              <ChevronRight size={22} />
            </button>
          </div>

          <p className="kether-mini-note">
            {ready ? "點播放喚醒小希播放清單喵" : "小希正在連接 YouTube 星軌..."}
          </p>
        </>
      )}
    </aside>
  );
}
