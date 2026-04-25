"use client";

import { useRef, useState } from "react";

export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  function prepareVideo() {
    setIsReady(true);
  }

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      autoPlay
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
      loop
      muted
      onCanPlay={prepareVideo}
      playsInline
      preload="auto"
      src="/video/generated/background-loop-slow.mp4"
    />
  );
}
