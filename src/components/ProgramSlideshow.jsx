import { useEffect, useMemo, useRef, useState } from "react";

function inferTypeFromSrc(src) {
  const s = String(src || "").toLowerCase();
  if (s.includes(".mp4") || s.includes(".webm") || s.includes(".mov")) {
    return "video";
  }
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
  stageAspect,
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
  const isFade = transition === "fade";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState(null);

  // shared animation trigger (works for fade + slide)
  const [animOn, setAnimOn] = useState(false);

  const shellRef = useRef(null);
  const [available, setAvailable] = useState({ w: 1200, h: 700 });
  const [stageSize, setStageSize] = useState({ w: 1100, h: 650 });

  const currentRef = useRef(0);
  const incomingRef = useRef(null);

  const holdTimeoutRef = useRef(null);
  const commitTimeoutRef = useRef(null);
  const primedRef = useRef(false);

  const currentVideoRef = useRef(null);

  // transition control / race protection
  const transitionTokenRef = useRef(0);
  const incomingReadyRef = useRef(false);
  const waitingToAnimateRef = useRef(false);

  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

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

  const resetIncomingState = () => {
    incomingReadyRef.current = false;
    waitingToAnimateRef.current = false;
  };

  const clearAll = () => {
    clearTimers();
    transitionTokenRef.current += 1; // invalidate pending callbacks
    resetIncomingState();
  };

  const scheduleNextCycle = (useStartDelay) => {
    clearTimers();
    if (!hasSlides || safeSlides.length <= 1) return;

    const current = safeSlides[currentRef.current];
    const delayStart = useStartDelay ? Math.max(0, Number(startDelayMs) || 0) : 0;

    // Video advances on ended
    if (current?.type === "video") {
      if (delayStart > 0) {
        holdTimeoutRef.current = setTimeout(() => {}, delayStart);
      }
      return;
    }

    // Image hold timer
    holdTimeoutRef.current = setTimeout(() => {
      beginTransitionToNext();
    }, delayStart + holdMs);
  };

  const commitTransition = (token) => {
    if (token !== transitionTokenRef.current) return;

    commitTimeoutRef.current = setTimeout(() => {
      if (token !== transitionTokenRef.current) return;

      const next = incomingRef.current;
      if (next === null || next === undefined) return;

      setCurrentIndex(next);
      setIncomingIndex(null);
      setAnimOn(false);
      commitTimeoutRef.current = null;

      resetIncomingState();
      scheduleNextCycle(false);
    }, animMs);
  };

  const startVisualTransition = (token) => {
    if (token !== transitionTokenRef.current) return;
    if (!waitingToAnimateRef.current) return;

    waitingToAnimateRef.current = false;

    // Ensure browser paints initial states before transition flips on
    setAnimOn(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (token !== transitionTokenRef.current) return;
        setAnimOn(true);
        commitTransition(token);
      });
    });
  };

  const preloadIncomingImage = (src, token) => {
    const img = new Image();

    const done = () => {
      if (token !== transitionTokenRef.current) return;
      if (incomingReadyRef.current) return;
      incomingReadyRef.current = true;
      startVisualTransition(token);
    };

    img.onload = done;
    img.onerror = done;
    img.src = src;

    if (img.complete) {
      done();
    }
  };

  const beginTransitionToNext = () => {
    if (!hasSlides || safeSlides.length <= 1) return;
    if (isTransitioning()) return;

    const curr = currentRef.current;
    const next = (curr + 1) % safeSlides.length;
    const nextSlide = safeSlides[next];

    // new transition token
    transitionTokenRef.current += 1;
    const token = transitionTokenRef.current;

    resetIncomingState();
    waitingToAnimateRef.current = true;
    setIncomingIndex(next); // mount incoming layer hidden/offscreen first

    if (nextSlide?.type === "image") {
      preloadIncomingImage(nextSlide.src, token);
    } else {
      // For video, wait for onLoadedData/onCanPlay from the rendered incoming <video>
      // Fallback so we don't stall forever on weird codecs/devices
      setTimeout(() => {
        if (token !== transitionTokenRef.current) return;
        if (incomingReadyRef.current) return;
        incomingReadyRef.current = true;
        startVisualTransition(token);
      }, 800);
    }
  };

  // Reset when slides array changes
  useEffect(() => {
    clearAll();
    setCurrentIndex(0);
    setIncomingIndex(null);
    setAnimOn(false);
    currentRef.current = 0;
    incomingRef.current = null;
    primedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSlides.length]);

  // Main timing loop
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

    const ro = new ResizeObserver(update);
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

  // Compute fixed frame aspect
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

  const handleCurrentVideoEnded = () => {
    if (!hasSlides || safeSlides.length <= 1) return;
    if (isTransitioning()) return;
    beginTransitionToNext();
  };

  // Ensure current video plays when current changes
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
      v.preload = "auto";

      try {
        v.currentTime = 0;
      } catch {
        // ignore
      }

      const play = async () => {
        try {
          await v.play();
        } catch {
          // ignore autoplay rejection
        }
      };

      setTimeout(play, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, hasSlides]);

  // If current is image, ensure cycle is scheduled
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

  const zCover = clamp(Number(zoom) || 1.0, 0.72, 1.2);
  const zContain = clamp(Number(zoom) || 1.0, 0.72, 1.0);

  const transformForMedia =
    fitSafe === "cover"
      ? `scale(${zCover})`
      : zContain < 1
      ? `scale(${zContain})`
      : "none";

  const useBlurBg = fitSafe === "cover";
  const useOverlay = fitSafe === "cover";

  const commonMediaStyle = {
    objectFit: fitSafe,
    objectPosition: "center center",
    transform: transformForMedia === "none" ? "none" : transformForMedia,
  };

  // ===== Transition styles =====
  const baseLayerTransition = `transform ${animMs}ms ${ease}, opacity ${animMs}ms ${ease}`;

  // SLIDE MODE (incoming comes in FROM LEFT, current exits to RIGHT)
  const currentSlideStyle = incoming
    ? {
        transform: animOn ? "translate3d(100%, 0, 0)" : "translate3d(0, 0, 0)",
        opacity: animOn ? 0.98 : 1,
        transition: baseLayerTransition,
        zIndex: 2,
      }
    : {
        transform: "translate3d(0, 0, 0)",
        opacity: 1,
        zIndex: 2,
      };

  const incomingSlideStyle = {
    transform: animOn ? "translate3d(0, 0, 0)" : "translate3d(-100%, 0, 0)",
    opacity: animOn ? 1 : 0.98,
    transition: baseLayerTransition,
    zIndex: 3,
  };

  // FADE MODE
  const currentFadeStyle = incoming
    ? {
        opacity: animOn ? 0 : 1,
        transform: "translate3d(0,0,0)",
        transition: `opacity ${animMs}ms ${ease}`,
        zIndex: 2,
      }
    : { opacity: 1, transform: "translate3d(0,0,0)", zIndex: 2 };

  const incomingFadeStyle = {
    opacity: animOn ? 1 : 0,
    transform: "translate3d(0,0,0)",
    transition: `opacity ${animMs}ms ${ease}`,
    zIndex: 3,
  };

  const currentLayerStyle = isFade ? currentFadeStyle : currentSlideStyle;
  const incomingLayerStyle = isFade ? incomingFadeStyle : incomingSlideStyle;

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
        {/* Current layer */}
        <div className="waSlideLayer" style={currentLayerStyle}>
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

        {/* Incoming layer */}
        {incoming && (
          <div className="waSlideLayer" style={incomingLayerStyle}>
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
                src={incoming.src}
                className="waImg"
                muted
                playsInline
                preload="auto"
                controls={false}
                onLoadedData={() => {
                  if (!incomingReadyRef.current) {
                    incomingReadyRef.current = true;
                    startVisualTransition(transitionTokenRef.current);
                  }
                }}
                onCanPlay={() => {
                  if (!incomingReadyRef.current) {
                    incomingReadyRef.current = true;
                    startVisualTransition(transitionTokenRef.current);
                  }
                }}
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
                onLoad={() => {
                  if (!incomingReadyRef.current) {
                    incomingReadyRef.current = true;
                    startVisualTransition(transitionTokenRef.current);
                  }
                }}
                onError={() => {
                  if (!incomingReadyRef.current) {
                    incomingReadyRef.current = true;
                    startVisualTransition(transitionTokenRef.current);
                  }
                }}
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