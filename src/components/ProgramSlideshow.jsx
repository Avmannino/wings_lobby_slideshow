import { useEffect, useMemo, useRef, useState } from "react";

export default function ProgramSlideshow({
  slides = [],
  holdMs = 6500,
  animMs = 700,
  zoom = 1.08,
  maxWidthPx = 1670, // ✅ was 1450 (~15% wider)
  maxHeightVh = 72,
}) {
  const safeSlides = useMemo(() => {
    return (slides || [])
      .map((s) => (typeof s === "string" ? { src: s } : s))
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
    // ✅ allow more width usage than before (was 0.92)
    const maxW = Math.min(maxWidthPx, Math.floor(availW * 1.0));

    // height cap stays the same
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

  if (!hasSlides) {
    return (
      <div style={styles.shellOuter}>
        <div style={styles.empty}>
          <div style={styles.emptyTitle}>No slides found</div>
          <div style={styles.emptySub}>
            Add images to /src/assets/slides and pass them into the slideshow.
          </div>
        </div>
      </div>
    );
  }

  const current = safeSlides[currentIndex];
  const incoming = incomingIndex !== null ? safeSlides[incomingIndex] : null;

  const z = Math.max(1, Math.min(1.2, Number(zoom) || 1.08));

  return (
    <div ref={shellRef} style={styles.shellOuter} aria-label="Program slideshow">
      <div
        style={{
          ...styles.stage,
          width: stageSize.w,
          height: stageSize.h,
          transition: "width 260ms ease, height 260ms ease",
        }}
      >
        {/* Current */}
        <div
          style={{
            ...styles.slideLayer,
            ...(incoming ? styles.layerExitLeft : styles.layerStatic),
            animationDuration: `${animMs}ms`,
          }}
        >
          <img
            src={current.src}
            alt={`Slide ${currentIndex + 1}`}
            draggable="false"
            onLoad={(e) => onImgLoad(e, current.src)}
            style={{ ...styles.img, transform: `scale(${z})` }}
          />
        </div>

        {/* Incoming */}
        {incoming && (
          <div
            style={{
              ...styles.slideLayer,
              ...styles.layerEnterRight,
              animationDuration: `${animMs}ms`,
            }}
          >
            <img
              src={incoming.src}
              alt={`Slide ${incomingIndex + 1}`}
              draggable="false"
              onLoad={(e) => onImgLoad(e, incoming.src)}
              style={{ ...styles.img, transform: `scale(${z})` }}
            />
          </div>
        )}

        <div style={styles.overlay} />
      </div>

      <div
        style={{
          ...styles.frame,
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
  shellOuter: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  stage: {
    position: "relative",
    borderRadius: 26,
    overflow: "hidden",
    boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "#060A12",
  },
  slideLayer: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    willChange: "transform",
  },
  layerStatic: { transform: "translateX(0%)" },
  layerExitLeft: {
    animationName: "slideOutLeft",
    animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    animationFillMode: "forwards",
  },
  layerEnterRight: {
    animationName: "slideInRight",
    animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    animationFillMode: "forwards",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center",
    display: "block",
    userSelect: "none",
    background: "#060A12",
    willChange: "transform",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.10) 55%, rgba(0,0,0,0.18) 100%)",
    pointerEvents: "none",
  },
  frame: {
    position: "absolute",
    borderRadius: 26,
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 60px rgba(255,255,255,0.04)",
    pointerEvents: "none",
  },
  empty: {
    width: "min(900px, 92vw)",
    padding: 28,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    boxShadow: "0 28px 80px rgba(0,0,0,0.55)",
  },
  emptyTitle: { fontSize: 26, fontWeight: 800 },
  emptySub: { marginTop: 8, opacity: 0.85, fontSize: 16 },
};

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
