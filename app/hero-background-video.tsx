"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  function prepareVideo() {
    setIsReady(true);
    void videoRef.current?.play();
  }

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      autoPlay
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000 ease-out",
        isReady && "opacity-50",
      )}
      loop
      muted
      onCanPlay={prepareVideo}
      onLoadedData={prepareVideo}
      playsInline
      preload="auto"
      src="/video/generated/background-loop-slower.mp4"
    />
  );
}
