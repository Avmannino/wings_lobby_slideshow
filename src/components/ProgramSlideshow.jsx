// src/components/ProgramSlideshow.jsx
import { useEffect, useMemo, useRef, useState } from "react";

function inferTypeFromSrc(src) {
  const s = String(src || "").toLowerCase();
  if (s.includes(".mp4") || s.includes(".webm") || s.includes(".mov"))
    return "video";
  return "image";
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function ProgramSlideshow({
  slides = [],
  holdMs = 4000,
  animMs = 950,
  zoom = 1.0,
  maxWidthPx = 1670,
  maxHeightVh = 72,

  startDelayMs = 0,
  showTitle = true,
  fit = "contain", // "contain" | "cover"

  // Optional: if provided, locks the frame to this aspect ratio.
  // If NOT provided, locks the frame to the container's aspect ratio (fills the slot).
  stageAspect,

  // ✅ NEW: allow choosing transition style
  transition = "slide", // "slide" | "fade"
}) {
  const safeSlides = useMemo(() => {
    return (slides || [])
      .map((s) => {
        if (typeof s === "string") {
          return { src: s, title: "", type: inferTypeFromSrc(s) };
        }
        if (s && typeof s === "object") {
          const src = s.src;
          if (!src) return null;
          const type = s.type ? String(s.type) : inferTypeFromSrc(src);
          return { src, title: s.title || "", type };
        }
        return null;
      })
      .filter((s) => s && s.src);
  }, [slides]);

  const hasSlides = safeSlides.length > 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState(null);

  // ✅ NEW: drives the fade crossfade (ensures the browser "sees" opacity change)
  const [fadeOn, setFadeOn] = useState(false);

  const shellRef = useRef(null);
  const [available, setAvailable] = useState({ w: 1200, h: 700 });
  const [stageSize, setStageSize] = useState({ w: 1100, h: 650 });

  const currentRef = useRef(0);
  const incomingRef = useRef(null);

  const holdTimeoutRef = useRef(null);
  const commitTimeoutRef = useRef(null);
  const primedRef = useRef(false);

  // video refs (current + incoming)
  const currentVideoRef = useRef(null);
  const incomingVideoRef = useRef(null);

  useEffect(() => {
    currentRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    incomingRef.current = incomingIndex;
  }, [incomingIndex]);

  const clearTimers = () => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    holdTimeoutRef.current = null;

    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
    commitTimeoutRef.current = null;
  };

  const isTransitioning = () => incomingRef.current !== null;

  const beginTransitionToNext = () => {
    if (!hasSlides || safeSlides.length <= 1) return;
    if (isTransitioning()) return;

    const curr = currentRef.current;
    const next = (curr + 1) % safeSlides.length;

    setIncomingIndex(next);

    // ✅ If fade mode, trigger opacity transition on next frame
    if (transition === "fade") {
      setFadeOn(false);
      requestAnimationFrame(() => setFadeOn(true));
    }

    commitTimeoutRef.current = setTimeout(() => {
      setCurrentIndex(next);
      setIncomingIndex(null);
      setFadeOn(false);
      commitTimeoutRef.current = null;

      scheduleNextCycle(false);
    }, animMs);
  };

  const scheduleNextCycle = (useStartDelay) => {
    clearTimers();
    if (!hasSlides || safeSlides.length <= 1) return;

    const current = safeSlides[currentRef.current];
    const delayStart = useStartDelay
      ? Math.max(0, Number(startDelayMs) || 0)
      : 0;

    // VIDEO: advance only on 'ended' (still respect initial delay)
    if (current?.type === "video") {
      if (delayStart > 0) {
        holdTimeoutRef.current = setTimeout(() => {
          // no-op: 'ended' advances
        }, delayStart);
      }
      return;
    }

    // IMAGE: normal hold timer
    holdTimeoutRef.current = setTimeout(() => {
      beginTransitionToNext();
    }, delayStart + holdMs);
  };

  // Reset on slides change
  useEffect(() => {
    setCurrentIndex(0);
    setIncomingIndex(null);
    setFadeOn(false);
    currentRef.current = 0;
    incomingRef.current = null;
    primedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSlides.length]);

  // Main timing loop (images schedule; videos advance on ended)
  useEffect(() => {
    const shouldUseDelay = !primedRef.current;
    primedRef.current = true;

    scheduleNextCycle(shouldUseDelay);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdMs, animMs, startDelayMs, safeSlides.length, hasSlides, transition]);

  // Measure available space
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setAvailable({
        w: Math.max(320, Math.floor(rect.width)),
        h: Math.max(240, Math.floor(rect.height)),
      });
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const computeStageSizeFixed = (aspect, availW, availH) => {
    const maxW = Math.min(maxWidthPx, Math.floor(availW * 1.0));
    const maxH = Math.min(
      Math.floor(window.innerHeight * (maxHeightVh / 100)),
      Math.floor(availH * 0.92)
    );

    let w = maxW;
    let h = Math.round(w / aspect);

    if (h > maxH) {
      h = maxH;
      w = Math.round(h * aspect);
    }

    w = Math.max(360, w);
    h = Math.max(240, h);

    return { w, h };
  };

  // Compute a single fixed frame aspect for this slideshow
  useEffect(() => {
    if (!hasSlides) return;

    const containerAspect = available.w / available.h;
    const autoAspect = clamp(containerAspect, 0.45, 2.4);
    const forced = Number(stageAspect);

    const aspectToUse =
      Number.isFinite(forced) && forced > 0 ? forced : autoAspect;

    setStageSize(computeStageSizeFixed(aspectToUse, available.w, available.h));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available.w, available.h, hasSlides, stageAspect, maxWidthPx, maxHeightVh]);

  // When the CURRENT video ends, advance
  const handleCurrentVideoEnded = () => {
    if (!hasSlides || safeSlides.length <= 1) return;
    if (isTransitioning()) return;
    beginTransitionToNext();
  };

  // Ensure the current video plays when it becomes current
  useEffect(() => {
    if (!hasSlides) return;
    const current = safeSlides[currentIndex];
    if (current?.type !== "video") return;

    clearTimers();

    const v = currentVideoRef.current;
    if (v) {
      v.muted = true;
      v.volume = 0;
      v.playsInline = true;

      try {
        v.currentTime = 0;
      } catch {
        // ignore
      }

      const play = async () => {
        try {
          await v.play();
        } catch {
          // ignore
        }
      };

      setTimeout(play, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, hasSlides]);

  // If current is image, ensure we are scheduled
  useEffect(() => {
    if (!hasSlides) return;
    const current = safeSlides[currentIndex];
    if (current?.type === "video") return;

    scheduleNextCycle(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, hasSlides]);

  if (!hasSlides) {
    return (
      <div className="waShowShell">
        <div className="waEmpty">
          <div className="waEmptyTitle">No slides found</div>
          <div className="waEmptySub">
            Add images/videos to /src/assets and pass them in.
          </div>
        </div>
      </div>
    );
  }

  const current = safeSlides[currentIndex];
  const incoming = incomingIndex !== null ? safeSlides[incomingIndex] : null;

  const fitSafe = fit === "cover" ? "cover" : "contain";

  /**
   * ✅ GUARANTEE "FULL IMAGE ALWAYS" WHEN fit="contain"
   * - contain: never allow zoom-in (would crop). Only allow zoom-out.
   * - cover: allow zoom either direction.
   */
  const zCover = clamp(Number(zoom) || 1.0, 0.72, 1.2);
  const zContain = clamp(Number(zoom) || 1.0, 0.72, 1.0); // <= 1.0 ONLY

  // For contain, only apply transform if zooming OUT (<1). If 1, use no transform.
  const transformForMedia =
    fitSafe === "cover"
      ? `scale(${zCover})`
      : zContain < 1
      ? `scale(${zContain})`
      : "none";

  // Blur + overlay look great for "cover" ads.
  // For "contain" (main), keep it clean so letterbox/pillarbox reads correctly.
  const useBlurBg = fitSafe === "cover";
  const useOverlay = fitSafe === "cover";

  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

  // ✅ SLIDE MODE (existing behavior)
  const layerExitStyleSlide = incoming
    ? {
        animationName: "slideOutLeft",
        animationDuration: `${animMs}ms`,
        animationTimingFunction: ease,
        animationFillMode: "forwards",
      }
    : {};

  const layerEnterStyleSlide = {
    animationName: "slideInRight",
    animationDuration: `${animMs}ms`,
    animationTimingFunction: ease,
    animationFillMode: "forwards",
  };

  // ✅ FADE MODE (new behavior)
  // - current goes 1 -> 0
  // - incoming goes 0 -> 1
  const fadeCommon = {
    transition: `opacity ${animMs}ms ${ease}`,
    willChange: "opacity",
  };

  const layerCurrentFadeStyle = incoming
    ? {
        ...fadeCommon,
        opacity: fadeOn ? 0 : 1,
      }
    : { opacity: 1 };

  const layerIncomingFadeStyle = {
    ...fadeCommon,
    opacity: fadeOn ? 1 : 0,
  };

  const commonMediaStyle = {
    objectFit: fitSafe,
    objectPosition: "center center",
    transform: transformForMedia === "none" ? "none" : transformForMedia,
  };

  const isFade = transition === "fade";

  return (
    <div ref={shellRef} className="waShowShell" aria-label="Program slideshow">
      <div
        className="waStage"
        style={{
          width: stageSize.w,
          height: stageSize.h,
          transition: "width 860ms ease, height 860ms ease",
        }}
      >
        {/* Current */}
        <div
          className="waSlideLayer"
          style={isFade ? layerCurrentFadeStyle : layerExitStyleSlide}
        >
          {useBlurBg && (
            <div
              className="waBlurBg"
              style={{
                backgroundImage:
                  current.type === "image" ? `url(${current.src})` : undefined,
              }}
              aria-hidden="true"
            />
          )}

          {current.type === "video" ? (
            <video
              ref={currentVideoRef}
              src={current.src}
              className="waImg"
              muted
              playsInline
              preload="auto"
              controls={false}
              onEnded={handleCurrentVideoEnded}
              style={commonMediaStyle}
            />
          ) : (
            <img
              className="waImg"
              src={current.src}
              alt={`Slide ${currentIndex + 1}`}
              draggable="false"
              decoding="async"
              loading="eager"
              style={commonMediaStyle}
            />
          )}
        </div>

        {/* Incoming */}
        {incoming && (
          <div
            className="waSlideLayer"
            // ✅ Important: when fading, ensure incoming is above current
            style={{
              ...(isFade ? layerIncomingFadeStyle : layerEnterStyleSlide),
              ...(isFade ? { zIndex: 3 } : null),
            }}
          >
            {useBlurBg && (
              <div
                className="waBlurBg"
                style={{
                  backgroundImage:
                    incoming.type === "image" ? `url(${incoming.src})` : undefined,
                }}
                aria-hidden="true"
              />
            )}

            {incoming.type === "video" ? (
              <video
                ref={incomingVideoRef}
                src={incoming.src}
                className="waImg"
                muted
                playsInline
                preload="auto"
                controls={false}
                style={commonMediaStyle}
              />
            ) : (
              <img
                className="waImg"
                src={incoming.src}
                alt={`Slide ${incomingIndex + 1}`}
                draggable="false"
                decoding="async"
                loading="eager"
                style={commonMediaStyle}
              />
            )}
          </div>
        )}

        {useOverlay && <div className="waOverlay" />}

        {showTitle && (
          <div className="waSlideTitlePill" aria-hidden="true">
            <span className="waSlideTitleText">{current.title || ""}</span>
          </div>
        )}
      </div>

      <div
        className="waFrame"
        style={{
          width: stageSize.w,
          height: stageSize.h,
          transition: "width 860ms ease, height 860ms ease",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/* Inject keyframes once (slide mode only) */
if (typeof document !== "undefined" && !document.getElementById("slideshowKF")) {
  const styleTag = document.createElement("style");
  styleTag.id = "slideshowKF";
  styleTag.innerHTML = `
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to   { transform: translateX(0%); }
    }
    @keyframes slideOutLeft {
      from { transform: translateX(0%); }
      to   { transform: translateX(-100%); }
    }
  `;
  document.head.appendChild(styleTag);
}