// src/components/ProgramSlideshow.jsx
import { useEffect, useMemo, useRef, useState } from "react";

export default function ProgramSlideshow({
  slides = [],
  holdMs = 6500,
  animMs = 700,
  zoom = 1.08,
  maxWidthPx = 2400,
  maxHeightVh = 78,
}) {
  const safeSlides = useMemo(() => {
    return (slides || [])
      .map((s) => {
        if (typeof s === "string") return { src: s, title: "" };
        return { src: s?.src, title: s?.title ?? "" };
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

  const scheduleNextCycle = () => {
    clearTimers();
    if (!hasSlides || safeSlides.length <= 1) return;

    holdTimeoutRef.current = setTimeout(() => {
      beginTransitionToNext();
    }, holdMs);
  };

  const beginTransitionToNext = () => {
    if (!hasSlides || safeSlides.length <= 1) return;
    if (incomingRef.current !== null) return;

    const curr = currentRef.current;
    const next = (curr + 1) % safeSlides.length;
    setIncomingIndex(next);

    commitTimeoutRef.current = setTimeout(() => {
      setCurrentIndex(next);
      setIncomingIndex(null);
      commitTimeoutRef.current = null;
      scheduleNextCycle();
    }, animMs);
  };

  useEffect(() => {
    setCurrentIndex(0);
    setIncomingIndex(null);
    currentRef.current = 0;
    incomingRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSlides.length]);

  useEffect(() => {
    scheduleNextCycle();
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdMs, animMs, safeSlides.length, hasSlides]);

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
    // ✅ slightly less than full width so it doesn't feel jammed
    const maxW = Math.min(maxWidthPx, Math.floor(availW * 0.98));

    const maxH = Math.min(
      Math.floor(window.innerHeight * (maxHeightVh / 100)),
      Math.floor(availH * 0.94)
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

  if (!hasSlides) {
    return (
      <div className="waShowShell">
        <div className="waEmpty">
          <div className="waEmptyTitle">No slides found</div>
          <div className="waEmptySub">
            Add images to /src/assets/slides and pass them into the slideshow.
          </div>
        </div>
      </div>
    );
  }

  const current = safeSlides[currentIndex];
  const incoming = incomingIndex !== null ? safeSlides[incomingIndex] : null;

  // ✅ show the title for the slide that is coming in (so it matches what the viewer sees)
  const displaySlide = incoming ?? current;
  const displayTitle = (displaySlide?.title ?? "").trim();

  const z = Math.max(1, Math.min(1.2, Number(zoom) || 1.08));

  return (
    <div ref={shellRef} className="waShowShell" aria-label="Program slideshow">
      <div
        className="waStage"
        style={{
          width: stageSize.w,
          height: stageSize.h,
          transition: "width 260ms ease, height 260ms ease",
        }}
      >
        {/* ✅ Title pill (35% of frame width, centered, above image) */}
        <div
          className="waSlideTitlePill"
          style={{
            width: "35%",
          }}
          aria-hidden={displayTitle.length === 0 ? "true" : "false"}
        >
          {/* If blank title, keep pill height by using a non-breaking space */}
          <span className="waSlideTitleText">
            {displayTitle.length ? displayTitle : "\u00A0"}
          </span>
        </div>

        {/* Current layer */}
        <div
          className="waSlideLayer"
          style={{
            ...(incoming ? styles.layerExitLeft : styles.layerStatic),
            animationDuration: `${animMs}ms`,
          }}
        >
          <div
            className="waBlurBg"
            style={{ backgroundImage: `url(${current.src})` }}
            aria-hidden="true"
          />
          <img
            className="waImg"
            src={current.src}
            alt={`Slide ${currentIndex + 1}`}
            draggable="false"
            onLoad={(e) => onImgLoad(e, current.src)}
            style={{ transform: `scale(${z})` }}
          />
        </div>

        {/* Incoming layer */}
        {incoming && (
          <div
            className="waSlideLayer"
            style={{
              ...styles.layerEnterRight,
              animationDuration: `${animMs}ms`,
            }}
          >
            <div
              className="waBlurBg"
              style={{ backgroundImage: `url(${incoming.src})` }}
              aria-hidden="true"
            />
            <img
              className="waImg"
              src={incoming.src}
              alt={`Slide ${incomingIndex + 1}`}
              draggable="false"
              onLoad={(e) => onImgLoad(e, incoming.src)}
              style={{ transform: `scale(${z})` }}
            />
          </div>
        )}

        <div className="waOverlay" />
      </div>

      <div
        className="waFrame"
        style={{
          width: stageSize.w,
          height: stageSize.h,
          transition: "width 260ms ease, height 260ms ease",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

const styles = {
  layerStatic: { transform: "translateX(0%)" },
  layerExitLeft: {
    animationName: "waSlideOutLeft",
    animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    animationFillMode: "forwards",
  },
  layerEnterRight: {
    animationName: "waSlideInRight",
    animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    animationFillMode: "forwards",
  },
};

if (typeof document !== "undefined" && !document.getElementById("waSlideshowKF")) {
  const styleTag = document.createElement("style");
  styleTag.id = "waSlideshowKF";
  styleTag.innerHTML = `
    @keyframes waSlideInRight {
      from { transform: translateX(100%); }
      to   { transform: translateX(0%); }
    }
    @keyframes waSlideOutLeft {
      from { transform: translateX(0%); }
      to   { transform: translateX(-100%); }
    }
  `;
  document.head.appendChild(styleTag);
}
