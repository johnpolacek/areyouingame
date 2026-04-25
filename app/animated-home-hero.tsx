"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { HomeEntryActions } from "./home-entry-actions";

gsap.registerPlugin(useGSAP, SplitText);

const subtitleText = "An invitation to the future awaits.";
const authHeadingText = "Are You In?";
const displayFontFamily =
  "var(--font-rubik-80s-fade), var(--font-rethink-sans), sans-serif";

export function AnimatedHomeHero() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const authCopyRef = useRef<HTMLDivElement>(null);
  const authHeadingRef = useRef<HTMLHeadingElement>(null);
  const authBodyRef = useRef<HTMLParagraphElement>(null);
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

      const split = SplitText.create(titleRef.current, {
        type: "words,chars",
        tag: "span",
      });
      subtitleRef.current.textContent = subtitleText;

      gsap.set(titleRef.current, {
        opacity: 1,
      });
      gsap.set(split.words, { display: "inline-block", whiteSpace: "nowrap" });
      gsap.set(split.chars, {
        color: "rgb(251 191 36)",
        display: "inline-block",
        opacity: 0,
        textShadow: "0 22px 50px rgb(0 0 0 / 0.48)",
        WebkitTextFillColor: "rgb(251 191 36)",
        willChange: "opacity",
      });

      const tl = gsap.timeline({
        delay: 2,
        defaults: { ease: "expo.out" },
      });

      tl.to(split.chars, {
        opacity: 1,
        clearProps: "willChange,textShadow",
        duration: 0.9,
        ease: "power2.out",
        stagger: {
          each: 0.075,
          from: "random",
        },
      })
        .call(() => split.revert())
        .fromTo(
          subtitleRef.current,
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
            duration: 2.4,
            ease: "expo.out",
          },
          "-=0.12",
        )
        .set(
          subtitleRef.current,
          {
            textContent: subtitleText,
          },
          ">",
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
        split.revert();
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
        !authCopyRef.current ||
        !authHeadingRef.current ||
        !authBodyRef.current ||
        !actionsRef.current
      ) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set([titleRef.current, subtitleRef.current], { display: "none" });
        gsap.set(authCopyRef.current, { opacity: 1 });
        setShowAuthActions(true);
        return;
      }

      const titleBox = titleRef.current.getBoundingClientRect();
      const subtitleBox = subtitleRef.current.getBoundingClientRect();
      const sectionBox = containerRef.current.getBoundingClientRect();
      const actionsBox = actionsRef.current.getBoundingClientRect();
      const authBodyBox = authBodyRef.current.getBoundingClientRect();
      const authActionsGap = window.innerWidth >= 640 ? 28 : 24;
      const authActionsTop =
        authBodyBox.bottom - sectionBox.top + authActionsGap;

      gsap.set(titleRef.current, {
        height: `${titleBox.height}px`,
        width: `${titleBox.width}px`,
      });
      gsap.set(subtitleRef.current, {
        height: `${subtitleBox.height}px`,
        width: `${subtitleBox.width}px`,
      });
      gsap.set(actionsRef.current, {
        bottom: showAuthPrompt ? "auto" : undefined,
        height: `${actionsBox.height}px`,
        left: showAuthPrompt ? "50%" : undefined,
        marginTop: showAuthPrompt ? 0 : undefined,
        position: showAuthPrompt ? "absolute" : undefined,
        top: showAuthPrompt ? `${authActionsTop}px` : undefined,
        transform: showAuthPrompt ? "translateX(-50%)" : undefined,
        width: `${actionsBox.width}px`,
      });

      const oldTitleSplit = SplitText.create(titleRef.current, {
        type: "words",
        tag: "span",
      });
      const oldSubtitleSplit = SplitText.create(subtitleRef.current, {
        type: "words",
        tag: "span",
      });
      const authHeadingSplit = SplitText.create(authHeadingRef.current, {
        type: "words",
        tag: "span",
      });

      gsap.set(authCopyRef.current, { autoAlpha: 1 });
      gsap.set([oldTitleSplit.words, oldSubtitleSplit.words], {
        display: "inline-block",
        willChange: "opacity, transform",
      });
      gsap.set(oldSubtitleSplit.words, {
        whiteSpace: "nowrap",
      });
      gsap.set(authHeadingSplit.words, {
        display: "inline-block",
        willChange: "opacity, transform",
      });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.to(
        [...oldTitleSplit.words, ...oldSubtitleSplit.words],
        {
          autoAlpha: 0,
          x: () => gsap.utils.random(-170, 170),
          y: () => gsap.utils.random(-92, 92),
          scale: () => gsap.utils.random(0.48, 0.72),
          rotation: () => gsap.utils.random(-28, 28),
          duration: 0.62,
          stagger: {
            amount: 0.18,
            from: "random",
          },
        },
        0,
      )
        .to(
          actionsRef.current,
          {
            autoAlpha: 0,
            y: 16,
            duration: 0.42,
          },
          0,
        )
        .set([titleRef.current, subtitleRef.current], { visibility: "hidden" })
        .set(actionsRef.current, { y: 0 })
        .from(
          authHeadingSplit.words,
          {
            autoAlpha: 0,
            y: 24,
            scale: 0.96,
            duration: 0.78,
            stagger: {
              amount: 0.18,
              from: "center",
            },
          },
          "-=0.08",
        )
        .call(() => authHeadingSplit.revert())
        .from(
          authBodyRef.current,
          {
            autoAlpha: 0,
            y: 20,
            duration: 1,
          },
          "-=0.35",
        )
        .call(() => setShowAuthActions(true), undefined, "-=0.2");

      return () => {
        tl.kill();
        oldTitleSplit.revert();
        oldSubtitleSplit.revert();
        authHeadingSplit.revert();
      };
    },
    {
      dependencies: [showAuthPrompt],
      scope: containerRef,
    },
  );

  useGSAP(
    () => {
      if (!showAuthActions || !containerRef.current || !actionsRef.current) {
        return;
      }

      const createAccountButton = containerRef.current.querySelector(
        ".hero-create-account",
      );
      const characterForm = containerRef.current.querySelector(
        ".hero-character-form",
      );
      const signInButton = containerRef.current.querySelector(".hero-sign-in");
      const sectionBox = containerRef.current.getBoundingClientRect();
      const authBodyBox = authBodyRef.current?.getBoundingClientRect();
      const actionsTop = authBodyBox
        ? authBodyBox.bottom - sectionBox.top + (window.innerWidth >= 640 ? 28 : 24)
        : undefined;

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.set(actionsRef.current, {
        autoAlpha: 1,
        height: "auto",
        maxWidth: "31rem",
        top: actionsTop,
        width: "100%",
        xPercent: -50,
        y: 0,
      })
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
          "-=0.62",
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
        className="hero-display-title w-full whitespace-nowrap bg-gradient-to-t from-amber-600/90 via-amber-500 to-amber-200 bg-clip-text selection:bg-amber-500/35 text-[clamp(4.25rem,14vw,10rem)] leading-[0.82] font-normal tracking-normal text-transparent [font-kerning:none] [text-rendering:optimizeSpeed] [text-shadow:0_22px_60px_rgb(0_0_0_/_0.55)]"
        style={{ fontFamily: displayFontFamily, opacity: 0 }}
      >
        Are You In?
      </h1>
      <p
        ref={subtitleRef}
        className="w-full max-w-none selection:bg-amber-500/35 text-[0.78rem] leading-7 font-medium tracking-[11px] text-balance text-amber-500 uppercase [text-shadow:0_12px_32px_rgb(0_0_0_/_0.52)] sm:text-xl"
        style={{ opacity: 0 }}
      >
        An invitation to the future awaits.
      </p>
      {showAuthPrompt ? (
        <div
          ref={authCopyRef}
          className="absolute top-1/2 left-1/2 flex w-full max-w-2xl -translate-x-1/2 -translate-y-[178%] flex-col items-center gap-3 text-center sm:-translate-y-[166%] sm:gap-4"
          style={{ opacity: 0 }}
        >
          <h2
            ref={authHeadingRef}
            className="hero-display-title max-w-2xl text-[2.9rem] leading-none font-normal text-balance text-amber-50 sm:text-[clamp(4.4rem,7vw,7rem)]"
            style={{ fontFamily: displayFontFamily }}
          >
            {authHeadingText}
          </h2>
          <p
            ref={authBodyRef}
            className="max-w-2xl text-base leading-6 font-medium text-balance text-amber-500 sm:text-lg sm:leading-7"
          >
            Sign up to create your player character
          </p>
        </div>
      ) : null}
      <div
        ref={actionsRef}
        className="mt-4 flex w-full justify-center sm:mt-7"
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
