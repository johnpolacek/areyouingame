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
const titleWordClassName =
  "block bg-gradient-to-t from-amber-950 via-amber-700 to-amber-500 bg-clip-text text-transparent dark:from-amber-600/90 dark:via-amber-500 dark:to-amber-200 sm:inline-block";
const titleWordAnimationStart = {
  opacity: 0,
  transform: "translate3d(0, 24px, 0)",
};

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
      const titleWords = gsap.utils.toArray<HTMLElement>(
        titleRef.current.querySelectorAll("[data-title-word]"),
      );

      if (prefersReducedMotion) {
        gsap.set([titleRef.current, subtitleRef.current, actionsRef.current], {
          opacity: 1,
        });
        gsap.set(titleWords, {
          opacity: 1,
          y: 0,
          clearProps: "transform,willChange",
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
        opacity: 1,
        transformOrigin: "50% 50%",
      });
      gsap.set(titleWords, {
        opacity: 0,
        y: 24,
        willChange: "opacity, transform",
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
        titleWords,
        {
          opacity: 0,
          y: 24,
        },
        {
          opacity: 1,
          y: 0,
          clearProps: "transform,willChange",
          duration: 2,
          ease: "expo.out",
          stagger: 0.33,
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
          "-=1.6",
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
      className="relative z-10 mx-auto flex w-full max-w-[calc(100vw-2.5rem)] flex-col items-center justify-center gap-6 self-center text-center sm:max-w-none sm:gap-8"
      aria-labelledby="entry-title"
    >
      <h1
        ref={titleRef}
        aria-label="Are You In?"
        id="entry-title"
        className="hero-display-title w-full selection:bg-amber-500/35 text-[clamp(5rem,24vw,7.25rem)] leading-[0.78] font-normal tracking-normal [font-kerning:none] [text-rendering:optimizeSpeed] sm:whitespace-nowrap sm:text-[clamp(4.25rem,14vw,10rem)] sm:leading-[0.82]"
        style={{ fontFamily: displayFontFamily, opacity: 0 }}
      >
        <span
          className={titleWordClassName}
          data-title-word
          style={titleWordAnimationStart}
        >
          Are
        </span>
        <span
          className={`${titleWordClassName} sm:ml-[0.18em]`}
          data-title-word
          style={titleWordAnimationStart}
        >
          You
        </span>
        <span
          className={`${titleWordClassName} sm:ml-[0.18em]`}
          data-title-word
          style={titleWordAnimationStart}
        >
          In?
        </span>
      </h1>
      <p
        ref={subtitleRef}
        aria-label={subtitleText}
        className="w-full max-w-[22rem] selection:bg-amber-500/35 text-[0.78rem] leading-7 font-medium tracking-[0.55em] text-balance text-primary uppercase sm:max-w-none sm:text-xl sm:tracking-[11px]"
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
