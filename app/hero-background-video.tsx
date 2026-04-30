"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canLoadVideo, setCanLoadVideo] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { theme } = useTheme();
  const videoSource =
    theme === "light"
      ? "/video/generated/background-loop-slower-light.mp4"
      : "/video/generated/background-loop-slower.mp4";

  function prepareVideo() {
    setIsReady(true);
    if (document.visibilityState === "visible") {
      void videoRef.current?.play();
    }
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const loadVideo = () => setCanLoadVideo(true);
    const idleCallback =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(loadVideo, { timeout: 1200 })
        : undefined;
    const fallbackTimeout =
      idleCallback === undefined ? window.setTimeout(loadVideo, 600) : undefined;

    return () => {
      if (idleCallback !== undefined) {
        window.cancelIdleCallback(idleCallback);
      }
      if (fallbackTimeout !== undefined) {
        window.clearTimeout(fallbackTimeout);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!canLoadVideo || !video) {
      return;
    }

    const activeVideo = video;

    if (video.readyState >= 2) {
      prepareVideo();
    }

    function syncPlaybackWithVisibility() {
      if (document.visibilityState === "visible") {
        void activeVideo.play();
      } else {
        activeVideo.pause();
      }
    }

    document.addEventListener("visibilitychange", syncPlaybackWithVisibility);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        syncPlaybackWithVisibility,
      );
    };
  }, [canLoadVideo]);

  if (!canLoadVideo) {
    return null;
  }

  return (
    <video
      key={videoSource}
      ref={videoRef}
      aria-hidden="true"
      autoPlay
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000 ease-out",
        isReady && theme === "light" && "opacity-50 mix-blend-multiply",
        isReady && theme === "dark" && "opacity-45",
      )}
      loop
      muted
      onCanPlay={prepareVideo}
      onLoadedData={prepareVideo}
      playsInline
      preload="metadata"
      src={videoSource}
    />
  );
}
