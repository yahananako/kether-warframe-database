"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Music2, Pause, Play, Radio, X } from "lucide-react";

const playlistId = "PL0DMEhl0daHfpBbeTikS2MDA8darW0iyZ";
const playlistTitle = "小希 YouTube 播放清單";
const playerRootId = "kether-mini-youtube-player-global";
const wantsPlayingStorageKey = "kether-mini-wants-playing";

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
  getPlayerState?: () => number;
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
    __ketherMiniMusicPlayer?: YouTubePlayer | null;
    __ketherMiniWantsPlaying?: boolean;
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

function ensurePlayerRoot() {
  let root = document.getElementById(playerRootId);

  if (!root) {
    root = document.createElement("div");
    root.id = playerRootId;
    root.className = "kether-mini-player-core";
    root.style.position = "fixed";
    root.style.width = "1px";
    root.style.height = "1px";
    root.style.opacity = "0";
    root.style.pointerEvents = "none";
    root.style.overflow = "hidden";
    root.style.left = "-9999px";
    root.style.bottom = "0";
    document.body.appendChild(root);
  }

  return root;
}

export default function MiniMusicPlayer() {
  const pathname = usePathname();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const wantsPlayingRef = useRef(false);
  const resumeAfterReadyRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [currentTitle, setCurrentTitle] = useState(playlistTitle);
  const [activated, setActivated] = useState(false);
  const [resumeNeeded, setResumeNeeded] = useState(false);

  function rememberWantsPlaying(value: boolean) {
    wantsPlayingRef.current = value;
    window.__ketherMiniWantsPlaying = value;

    try {
      window.localStorage.setItem(wantsPlayingStorageKey, value ? "1" : "0");
    } catch {
      // localStorage may be unavailable in some private browser modes.
    }
  }

  function syncTitle() {
    const title = playerRef.current?.getVideoData?.().title;

    if (title?.trim()) {
      setCurrentTitle(title);
    }
  }

  function isPlayerActuallyPlaying() {
    return playerRef.current?.getPlayerState?.() === window.YT?.PlayerState?.PLAYING;
  }

  function checkIfResumePromptIsNeeded() {
    window.setTimeout(() => {
      if (!wantsPlayingRef.current || !playerRef.current) return;

      if (!isPlayerActuallyPlaying()) {
        setPlaying(false);
        setResumeNeeded(true);
      }
    }, 900);
  }

  function resumePlayback() {
    setActivated(true);
    setCollapsed(false);
    rememberWantsPlaying(true);
    setResumeNeeded(false);

    if (!ready || !playerRef.current) {
      resumeAfterReadyRef.current = true;
      return;
    }

    playerRef.current.playVideo();
    setPlaying(true);
    setTimeout(syncTitle, 500);
    checkIfResumePromptIsNeeded();
  }

  useEffect(() => {
    setMounted(true);

    try {
      const storedWantsPlaying = window.localStorage.getItem(wantsPlayingStorageKey) === "1";

      if (storedWantsPlaying) {
        wantsPlayingRef.current = true;
        window.__ketherMiniWantsPlaying = true;
        setActivated(true);
        setResumeNeeded(true);
      }
    } catch {
      // localStorage may be unavailable in some private browser modes.
    }
  }, []);

  useEffect(() => {
    if (!mounted || !activated) return;

    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled) return;

      if (window.__ketherMiniMusicPlayer) {
        playerRef.current = window.__ketherMiniMusicPlayer;
        setReady(true);
        syncTitle();

        if (resumeAfterReadyRef.current) {
          resumeAfterReadyRef.current = false;
          resumePlayback();
        }

        return;
      }

      if (!window.YT?.Player) return;

      ensurePlayerRoot();

      const player = new window.YT.Player(playerRootId, {
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

            player.cuePlaylist({
              listType: "playlist",
              list: playlistId,
              index: 0,
            });

            window.__ketherMiniMusicPlayer = player;
            playerRef.current = player;
            setReady(true);
            setTimeout(syncTitle, 400);

            if (resumeAfterReadyRef.current) {
              resumeAfterReadyRef.current = false;
              window.setTimeout(resumePlayback, 150);
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState?.PLAYING) {
              setPlaying(true);
              setResumeNeeded(false);
              setTimeout(syncTitle, 350);
            }

            if (event.data === window.YT?.PlayerState?.PAUSED) {
              setPlaying(false);

              if (wantsPlayingRef.current) {
                setResumeNeeded(true);
              }

              setTimeout(syncTitle, 350);
            }

            if (event.data === window.YT?.PlayerState?.CUED) {
              setPlaying(false);
              setTimeout(syncTitle, 350);
            }

            if (event.data === window.YT?.PlayerState?.ENDED) {
              rememberWantsPlaying(true);
              player.nextVideo();
              player.playVideo();
              setTimeout(syncTitle, 650);
            }
          },
        },
      });

      window.__ketherMiniMusicPlayer = player;
      playerRef.current = player;
    });

    return () => {
      cancelled = true;
    };
  }, [mounted, activated]);

  useEffect(() => {
    if (!activated || !wantsPlayingRef.current || !ready) return;

    checkIfResumePromptIsNeeded();
  }, [pathname, activated, ready]);

  function togglePlay() {
    if (!ready || !playerRef.current) return;

    if (playing) {
      rememberWantsPlaying(false);
      setResumeNeeded(false);
      playerRef.current.pauseVideo();
      setPlaying(false);
      return;
    }

    rememberWantsPlaying(true);
    setResumeNeeded(false);
    playerRef.current.playVideo();
    setPlaying(true);
    setTimeout(syncTitle, 500);
    checkIfResumePromptIsNeeded();
  }

  function nextTrack() {
    if (!ready || !playerRef.current) return;

    rememberWantsPlaying(true);
    setResumeNeeded(false);
    playerRef.current.nextVideo();
    playerRef.current.playVideo();
    setPlaying(true);
    setTimeout(syncTitle, 650);
    checkIfResumePromptIsNeeded();
  }

  function previousTrack() {
    if (!ready || !playerRef.current) return;

    rememberWantsPlaying(true);
    setResumeNeeded(false);
    playerRef.current.previousVideo();
    playerRef.current.playVideo();
    setPlaying(true);
    setTimeout(syncTitle, 650);
    checkIfResumePromptIsNeeded();
  }

  if (!mounted) return null;

  return createPortal(
    <aside className={`kether-mini-player ${collapsed ? "is-collapsed" : ""}`}>
      {collapsed ? (
        <div className="kether-mini-collapsed-row">
          {resumeNeeded ? (
            <button
              type="button"
              className="kether-mini-resume-toast"
              onClick={resumePlayback}
              aria-label="一鍵續播小希電台"
            >
              音樂暫停了｜一鍵續播
            </button>
          ) : null}

          <button
            type="button"
            className="kether-mini-bubble"
            onClick={() => {
              setActivated(true);
              setCollapsed(false);
            }}
            aria-label="展開小希迷你播放器"
          >
            <Radio size={18} />
          </button>
        </div>
      ) : (
        <>
          <div className="kether-mini-head">
            <div className="kether-mini-brand">
              <Music2 size={14} />
              <span>KETHER RADIO</span>
            </div>

            <button
              type="button"
              className="kether-mini-close"
              onClick={() => setCollapsed(true)}
              aria-label="收合小希迷你播放器"
            >
              <X size={14} />
            </button>
          </div>

          <div className="kether-mini-title">
            <span>{currentTitle}</span>
          </div>

          <div className="kether-mini-controls">
            <button type="button" onClick={previousTrack} aria-label="上一首">
              <ChevronLeft size={19} />
            </button>

            <button
              type="button"
              className="kether-mini-play"
              onClick={togglePlay}
              disabled={!ready}
              aria-label={playing ? "暫停" : "播放"}
            >
              {playing ? <Pause size={19} /> : <Play size={19} />}
            </button>

            <button type="button" onClick={nextTrack} aria-label="下一首">
              <ChevronRight size={19} />
            </button>
          </div>

          {resumeNeeded ? (
            <button
              type="button"
              className="kether-mini-resume-prompt"
              onClick={resumePlayback}
            >
              音樂被瀏覽器暫停了，點這裡續播
            </button>
          ) : null}

          <p className="kether-mini-note">
            {ready ? "點播放喚醒小希清單喵" : "連接 YouTube 星軌中..."}
          </p>
        </>
      )}
    </aside>,
    document.body
  );
}
