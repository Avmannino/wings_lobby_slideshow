// src/components/ProgramSlideshow.jsx
import { useEffect, useMemo, useRef, useState } from "react";

function inferTypeFromSrc(src) {
  const s = String(src || "").toLowerCase();
  if (s.includes(".mp4") || s.includes(".webm") || s.includes(".mov")) return "video";
  return "image";
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

  const aspectMapRef = useRef(new Map()); // src -> aspect
  const shellRef = useRef(null);
  const [available, setAvailable] = useState({ w: 1200, h: 700 });
  const [stageSize, setStageSize] = useState({ w: 1100, h: 650 });

  const currentRef = useRef(0);
  const incomingRef = useRef(null);

  const holdTimeoutRef = useRef(null);
  const commitTimeoutRef = useRef(null);
  const primedRef = useRef(false);

  // ✅ video refs (current + incoming)
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

    commitTimeoutRef.current = setTimeout(() => {
      setCurrentIndex(next);
      setIncomingIndex(null);
      commitTimeoutRef.current = null;

      scheduleNextCycle(false);
    }, animMs);
  };

  const scheduleNextCycle = (useStartDelay) => {
    clearTimers();
    if (!hasSlides || safeSlides.length <= 1) return;

    const current = safeSlides[currentRef.current];
    const delayStart = useStartDelay ? Math.max(0, Number(startDelayMs) || 0) : 0;

    // ✅ If current is a VIDEO: do NOT use holdMs. We wait for the video 'ended' event.
    if (current?.type === "video") {
      // Still respect the initial startDelayMs before we even start considering next.
      // (Video should already be playing; this just prevents early transitions.)
      if (delayStart > 0) {
        holdTimeoutRef.current = setTimeout(() => {
          // no-op: after delay, the 'ended' handler will be the only thing that advances
        }, delayStart);
      }
      return;
    }

    // ✅ Image path: normal hold timer
    holdTimeoutRef.current = setTimeout(() => {
      beginTransitionToNext();
    }, delayStart + holdMs);
  };

  // Reset on slides change
  useEffect(() => {
    setCurrentIndex(0);
    setIncomingIndex(null);
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
  }, [holdMs, animMs, startDelayMs, safeSlides.length, hasSlides]);

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

  const getAspectForSrc = (src) => {
    const a = aspectMapRef.current.get(src);
    return a && Number.isFinite(a) && a > 0 ? a : 16 / 9;
  };

  const computeStageSize = (aspect, availW, availH) => {
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

  useEffect(() => {
    if (!hasSlides) return;

    const current = safeSlides[currentIndex];
    const incoming = incomingIndex !== null ? safeSlides[incomingIndex] : null;

    const targetSrc = incoming ? incoming.src : current.src;
    const aspect = getAspectForSrc(targetSrc);

    setStageSize(computeStageSize(aspect, available.w, available.h));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available.w, available.h, currentIndex, incomingIndex, hasSlides, safeSlides.length]);

  const onImgLoad = (e, src) => {
    const img = e.currentTarget;
    if (!img?.naturalWidth || !img?.naturalHeight) return;

    const aspect = img.naturalWidth / img.naturalHeight;
    aspectMapRef.current.set(src, aspect);

    const current = safeSlides[currentIndex]?.src;
    const incoming = incomingIndex !== null ? safeSlides[incomingIndex]?.src : null;
    const targetSrc = incoming ?? current;

    if (src === targetSrc) {
      setStageSize(computeStageSize(aspect, available.w, available.h));
    }
  };

  const onVideoMeta = (e, src) => {
    const v = e.currentTarget;
    if (!v?.videoWidth || !v?.videoHeight) return;

    const aspect = v.videoWidth / v.videoHeight;
    aspectMapRef.current.set(src, aspect);

    const current = safeSlides[currentIndex]?.src;
    const incoming = incomingIndex !== null ? safeSlides[incomingIndex]?.src : null;
    const targetSrc = incoming ?? current;

    if (src === targetSrc) {
      setStageSize(computeStageSize(aspect, available.w, available.h));
    }
  };

  // ✅ When the CURRENT video ends, advance (but only if not already transitioning)
  const handleCurrentVideoEnded = () => {
    if (!hasSlides || safeSlides.length <= 1) return;
    if (isTransitioning()) return;
    beginTransitionToNext();
  };

  // ✅ Ensure the current video plays when it becomes current
  useEffect(() => {
    if (!hasSlides) return;
    const current = safeSlides[currentIndex];
    if (current?.type !== "video") return;

    // stop any old timers (we wait for 'ended')
    clearTimers();

    const v = currentVideoRef.current;
    if (v) {
      v.muted = true;
      v.volume = 0;
      v.playsInline = true;

      // restart from beginning whenever it becomes the current slide
      try {
        v.currentTime = 0;
      } catch {
        // ignore
      }

      const play = async () => {
        try {
          await v.play();
        } catch {
          // Autoplay can fail in some environments; signage browsers usually allow it.
        }
      };

      // slight defer helps in some browsers
      setTimeout(play, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, hasSlides]);

  // ✅ If current is video, don't run image scheduling; (re)prime the cycle
  useEffect(() => {
    if (!hasSlides) return;
    const current = safeSlides[currentIndex];
    if (current?.type === "video") return;

    // If image slide, ensure we are scheduled
    scheduleNextCycle(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, hasSlides]);

  if (!hasSlides) {
    return (
      <div className="waShowShell">
        <div className="waEmpty">
          <div className="waEmptyTitle">No slides found</div>
          <div className="waEmptySub">Add images/videos to /src/assets and pass them in.</div>
        </div>
      </div>
    );
  }

  const current = safeSlides[currentIndex];
  const incoming = incomingIndex !== null ? safeSlides[incomingIndex] : null;

  const z = Math.max(1, Math.min(1.2, Number(zoom) || 1.0));
  const fitSafe = fit === "cover" ? "cover" : "contain";

  const layerExitStyle = incoming
    ? {
        animationName: "slideOutLeft",
        animationDuration: `${animMs}ms`,
        animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        animationFillMode: "forwards",
      }
    : {};

  const layerEnterStyle = {
    animationName: "slideInRight",
    animationDuration: `${animMs}ms`,
    animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    animationFillMode: "forwards",
  };

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
        <div className="waSlideLayer" style={layerExitStyle}>
          <div
            className="waBlurBg"
            style={{
              backgroundImage: current.type === "image" ? `url(${current.src})` : undefined,
            }}
            aria-hidden="true"
          />

          {current.type === "video" ? (
            <video
              ref={currentVideoRef}
              src={current.src}
              className="waImg"
              muted
              playsInline
              preload="auto"
              controls={false}
              onLoadedMetadata={(e) => onVideoMeta(e, current.src)}
              onEnded={handleCurrentVideoEnded}
              style={{
                transform: `scale(${z})`,
                objectFit: fitSafe,
              }}
            />
          ) : (
            <img
              className="waImg"
              src={current.src}
              alt={`Slide ${currentIndex + 1}`}
              draggable="false"
              onLoad={(e) => onImgLoad(e, current.src)}
              style={{
                transform: `scale(${z})`,
                objectFit: fitSafe,
              }}
            />
          )}
        </div>

        {/* Incoming */}
        {incoming && (
          <div className="waSlideLayer" style={layerEnterStyle}>
            <div
              className="waBlurBg"
              style={{
                backgroundImage: incoming.type === "image" ? `url(${incoming.src})` : undefined,
              }}
              aria-hidden="true"
            />

            {incoming.type === "video" ? (
              <video
                ref={incomingVideoRef}
                src={incoming.src}
                className="waImg"
                muted
                playsInline
                preload="auto"
                controls={false}
                // NOTE: we don't auto-play incoming; it will play when it becomes current
                onLoadedMetadata={(e) => onVideoMeta(e, incoming.src)}
                style={{
                  transform: `scale(${z})`,
                  objectFit: fitSafe,
                }}
              />
            ) : (
              <img
                className="waImg"
                src={incoming.src}
                alt={`Slide ${incomingIndex + 1}`}
                draggable="false"
                onLoad={(e) => onImgLoad(e, incoming.src)}
                style={{
                  transform: `scale(${z})`,
                  objectFit: fitSafe,
                }}
              />
            )}
          </div>
        )}

        <div className="waOverlay" />

        {/* Title pill (optional) */}
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

/* Inject keyframes once */
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
