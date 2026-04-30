"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { HomeEntryActions } from "./home-entry-actions";

gsap.registerPlugin(useGSAP, SplitText);

const subtitleText = "An invitation to the future awaits.";
const displayFontFamily =
  "var(--font-rubik-80s-fade), var(--font-rethink-sans), sans-serif";

export function AnimatedHomeHero() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showAuthActions, setShowAuthActions] = useState(false);

  useGSAP(
    () => {
      if (
        !containerRef.current ||
        !titleRef.current ||
        !subtitleRef.current ||
        !actionsRef.current
      ) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set([titleRef.current, subtitleRef.current, actionsRef.current], {
          opacity: 1,
        });
        subtitleRef.current.textContent = subtitleText;
        return;
      }

      gsap.set([titleRef.current, subtitleRef.current], {
        width: "100%",
      });
      const titleBox = titleRef.current.getBoundingClientRect();
      const subtitleBox = subtitleRef.current.getBoundingClientRect();

      gsap.set(titleRef.current, {
        height: `${titleBox.height}px`,
        position: "relative",
      });
      gsap.set(subtitleRef.current, {
        height: `${subtitleBox.height}px`,
        position: "relative",
      });

      subtitleRef.current.textContent = subtitleText;

      gsap.set(titleRef.current, {
        transformOrigin: "50% 50%",
      });
      const subtitleSplit = SplitText.create(subtitleRef.current, {
        type: "words,chars",
        tag: "span",
      });
      gsap.set(subtitleRef.current, {
        opacity: 1,
        perspective: 800,
      });
      gsap.set(subtitleSplit.words, {
        display: "inline-block",
        whiteSpace: "nowrap",
      });
      gsap.set(subtitleSplit.chars, {
        autoAlpha: 0,
        display: "inline-block",
        transformOrigin: "50% 50%",
        willChange: "opacity, transform",
        x: () => gsap.utils.random(-180, 180),
        y: () => gsap.utils.random(-96, 96),
        z: () => gsap.utils.random(-220, 160),
        rotationX: () => gsap.utils.random(-180, 180),
        rotationY: () => gsap.utils.random(-180, 180),
        rotationZ: () => gsap.utils.random(-55, 55),
      });

      const tl = gsap.timeline({
        delay: 2,
        defaults: { ease: "expo.out" },
      });

      tl.fromTo(
        titleRef.current,
        {
          autoAlpha: 0,
          y: 18,
        },
        {
          autoAlpha: 1,
          y: 0,
          clearProps: "transform,visibility",
          duration: 1.4,
        },
      )
        .to(
          subtitleSplit.chars,
          {
            autoAlpha: 1,
            clearProps: "willChange",
            duration: 1.6,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            x: 0,
            y: 0,
            z: 0,
            ease: "expo.out",
            stagger: {
              amount: 0.58,
              from: "random",
            },
          },
          "-=0.32",
        )
        .fromTo(
          actionsRef.current,
          {
            autoAlpha: 0,
            y: 16,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.25,
            ease: "expo.out",
          },
          "-=0.25",
        );

      return () => {
        tl.kill();
        subtitleSplit.revert();
        if (subtitleRef.current) {
          subtitleRef.current.textContent = subtitleText;
        }
      };
    },
    { scope: containerRef },
  );

  useGSAP(
    () => {
      if (
        !showAuthPrompt ||
        !containerRef.current ||
        !titleRef.current ||
        !subtitleRef.current ||
        !actionsRef.current
      ) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set([titleRef.current, subtitleRef.current], { display: "none" });
        setShowAuthActions(true);
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.to(
        [titleRef.current, subtitleRef.current, actionsRef.current],
        {
          autoAlpha: 0,
          duration: 0.24,
        },
        0,
      )
        .set([titleRef.current, subtitleRef.current], { display: "none" })
        .call(() => setShowAuthActions(true));

      return () => {
        tl.kill();
      };
    },
    {
      dependencies: [showAuthPrompt],
      scope: containerRef,
    },
  );

  useGSAP(
    () => {
      if (
        !showAuthActions ||
        !containerRef.current ||
        !actionsRef.current
      ) {
        return;
      }

      const playerCreationCopy = containerRef.current.querySelector(
        ".player-creation-copy",
      );
      const createAccountButton = containerRef.current.querySelector(
        ".hero-create-account",
      );
      const characterForm = containerRef.current.querySelector(
        ".hero-character-form",
      );
      const signInButton = containerRef.current.querySelector(".hero-sign-in");
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.set(actionsRef.current, {
          autoAlpha: 1,
          clearProps:
            "bottom,height,left,marginTop,maxWidth,position,top,transform,width,xPercent,y",
        })
        .fromTo(
          playerCreationCopy,
          {
            autoAlpha: 0,
            y: 10,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.48,
          },
        )
        .fromTo(
          characterForm,
          {
            autoAlpha: 0,
            y: 14,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
          },
        )
        .fromTo(
          createAccountButton,
          {
            autoAlpha: 0,
            y: 20,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
          },
          "-=0.58",
        )
        .fromTo(
          signInButton,
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
            duration: 0.9,
          },
        );

      return () => {
        tl.kill();
      };
    },
    {
      dependencies: [showAuthActions],
      scope: containerRef,
    },
  );

  return (
    <section
      ref={containerRef}
      className="relative z-10 mx-auto flex w-full flex-col items-center justify-center gap-7 self-center text-center sm:gap-8"
      aria-labelledby="entry-title"
    >
      <h1
        ref={titleRef}
        id="entry-title"
        className="hero-display-title w-full whitespace-nowrap bg-gradient-to-t from-amber-700 via-amber-500 to-amber-200 bg-clip-text selection:bg-amber-500/35 text-[clamp(4.25rem,14vw,10rem)] leading-[0.82] font-normal tracking-normal text-transparent [font-kerning:none] [text-rendering:optimizeSpeed] dark:from-amber-600/90"
        style={{ fontFamily: displayFontFamily, opacity: 0 }}
      >
        Are You In?
      </h1>
      <p
        ref={subtitleRef}
        aria-label={subtitleText}
        className="w-full max-w-none selection:bg-amber-500/35 text-[0.78rem] leading-7 font-medium tracking-[11px] text-balance text-primary uppercase sm:text-xl"
        style={{ opacity: 0 }}
      >
        An invitation to the future awaits.
      </p>
      <div
        ref={actionsRef}
        className={
          showAuthActions
            ? "flex w-full justify-center"
            : "mt-4 flex w-full justify-center sm:mt-7"
        }
        aria-label="Daily game actions"
        style={{ opacity: 0 }}
      >
        <HomeEntryActions
          onJoinRequest={() => setShowAuthPrompt(true)}
          showAuthActions={showAuthActions}
        />
      </div>
    </section>
  );
}
