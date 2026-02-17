// src/App.jsx
import "./App.css";

import ProgramSlideshow from "./components/ProgramSlideshow";

// ✅ Header wordmark image
import headerWordmark from "./assets/welcometowings.png";

// Center Slides (images)
import one from "./assets/slides/1.jpeg";
import two from "./assets/slides/2.jpg";
import three from "./assets/slides/3.jpg";
import four from "./assets/slides/4.jpg";
import five from "./assets/slides/5.jpg";

// ✅ OPTIONAL: example mp4s (put your mp4s in /src/assets/slides/)
// import hypeVid from "./assets/slides/learntoskate.mp4";
// import zamVid from "./assets/slides/zam.mp4";

// ✅ Ads
import ad1 from "./assets/ads/1.jpg";
import ad2 from "./assets/ads/2.png";
import ad3 from "./assets/ads/3.jpg";
import ad4 from "./assets/ads/4.png";
import ad5 from "./assets/ads/5.avif";

export default function App() {
  // ✅ You can mix images + videos now.
  // Videos autoplay muted and will ALWAYS play fully before advancing.
  const slides = [
    { src: one, title: "WELCOME" },
    // { src: hypeVid, title: "HIGHLIGHTS" }, // ✅ example mp4
    { src: two, title: "COMMUNITY" },
    { src: three, title: "PROGRAMS" },
    // { src: zamVid, title: "" },            // ✅ example mp4 (blank pill)
    { src: four, title: "" },
    { src: five, title: "GAME DAY" },
  ];

  const adSlides = [ad1, ad2, ad3, ad4, ad5];

  const MAIN_HOLD = 6500;

  // ✅ 50% slower transition than before (700ms → 1050ms)
  const MAIN_ANIM = 1050;

  const ADS_HOLD = MAIN_HOLD * 3; // 19500ms
  const ADS_ANIM = 1500;          // keep as-is (already slow)
  const ADS_DELAY = 4200;

  return (
    <div className="waPage">
      <header className="waHeader">
        <img
          className="waHeaderWordmark"
          src={headerWordmark}
          alt="Welcome to Wings Arena"
          draggable="false"
        />
      </header>

      <main className="waMain waMainSplitOneAd">
        {/* Main Slideshow (left) */}
        <section className="waMainSlide" aria-label="Main slideshow">
          <div className="waSlideshowWrap">
            <ProgramSlideshow
              slides={slides}
              holdMs={MAIN_HOLD}
              animMs={MAIN_ANIM}
              startDelayMs={0}
              maxWidthPx={2800}
              maxHeightVh={78}
              zoom={1.0}
              showTitle={true}
              fit="contain"
            />
          </div>
        </section>

        {/* Ad box (right) */}
        <aside className="waAdColumnOne" aria-label="Promotions">
          <div className="waAdSlotOne">
            <ProgramSlideshow
              slides={adSlides}
              holdMs={ADS_HOLD}
              animMs={ADS_ANIM}
              startDelayMs={ADS_DELAY}
              maxWidthPx={760}
              maxHeightVh={85}
              zoom={1.0}
              showTitle={false}
              fit="cover"
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
