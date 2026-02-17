// src/App.jsx
import "./App.css";

import ProgramSlideshow from "./components/ProgramSlideshow";

// ✅ Header wordmark image
import headerWordmark from "./assets/welcometowings.png";

// Center Slides (images)
import one from "./assets/slides/1.jpeg";
import two from "./assets/slides/2.png";
import three from "./assets/slides/3.jpg";
import four from "./assets/slides/4.jpg";
import five from "./assets/slides/5.jpg";

// Videos
import ltsVid from "./assets/slides/learntoskate.mp4";
// import zamVid from "./assets/slides/zam.mp4";

// ✅ Ads
import ad1 from "./assets/ads/1.jpg";
import ad2 from "./assets/ads/2.png";
import ad3 from "./assets/ads/3.jpg";
import ad4 from "./assets/ads/4.png";
import ad5 from "./assets/ads/5.avif";

export default function App() {
  const slides = [
    { src: one, title: "Wings Arena Adult Hockey League" },
    { src: two, title: "Bantam Major - GOLD in Montreal!" },
    { src: three, title: "GSC Mites League" },
    { src: four, title: "Learn To Skate" },
    { src: five, title: "Learn To Play" },
    { src: ltsVid, title: "Learn To Skate" },
  ];

  const adSlides = [ad1, ad2, ad3, ad4, ad5];

  const MAIN_HOLD = 6500;
  const MAIN_ANIM = 1050;

  const ADS_HOLD = MAIN_HOLD * 2; // 19500ms
  const ADS_ANIM = 1500;
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
              maxWidthPx={980}
              maxHeightVh={85}
              zoom={0.9}          /* ✅ zoom out a bit */
              showTitle={false}
              fit="contain"       /* ✅ no cropping; full ad fits */
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
