// src/App.jsx
import "./App.css";

import ProgramSlideshow from "./components/ProgramSlideshow";

// ✅ Header wordmark image
import headerWordmark from "./assets/welcometowings.png";

// ✅ small logo on the right
import headerLogoRight from "./assets/wings-logo.png";

// Center Slides (images)
import one from "./assets/slides/1.jpeg";
import two from "./assets/slides/2.png";
import three from "./assets/slides/3.jpg";
import four from "./assets/slides/4.jpg";
import five from "./assets/slides/5.jpg";
import six from "./assets/slides/6.jpg";
import seven from "./assets/slides/7.jpg";
import eight from "./assets/slides/8.jpg";
import nine from "./assets/slides/9.jpeg";
import ten from "./assets/slides/10.JPG";
import eleven from "./assets/slides/11.JPG";
import twelve from "./assets/slides/12.JPG";
import thirteen from "./assets/slides/13.JPG";

// Videos
import ltsVid from "./assets/slides/learntoskate.mp4";
import montageVid from "./assets/slides/wingsmontage.mp4";

// ✅ Ads
import ad1 from "./assets/ads/1.jpg";
import ad2 from "./assets/ads/2.png";
import ad3 from "./assets/ads/3.jpg";
import ad4 from "./assets/ads/4.png";
import ad5 from "./assets/ads/5.avif";
import ad6 from "./assets/ads/6.png";
import ad7 from "./assets/ads/7.png";
import ad8 from "./assets/ads/8.png";

export default function App() {
  const slides = [
    { src: one, title: "Wings Arena Adult Hockey League" },
    { src: two, title: "Bantam Major - GOLD in Montreal!" },
    { src: three, title: "GSC Mites League" },
    { src: four, title: "Learn To Skate" },
    { src: five, title: "Learn To Play" },
    { src: montageVid, title: "Wings Arena" },
    { src: six, title: "Figure Skating" },
    { src: seven, title: "Figure Skating" },
    { src: eight, title: "Figure Skating" },
    { src: nine, title: "Wings @ Night" },
    { src: ten, title: "Wings Day" },
    { src: eleven, title: "Wings @ Night" },
    { src: twelve, title: "Wings @ Night" },
    { src: thirteen, title: "Wings @ Night" },
    { src: ltsVid, title: "Learn To Skate" },
  ];

  const adSlides = [ad1, ad2, ad3, ad4, ad5, ad6, ad7, ad8];

  const MAIN_HOLD = 4500;
  const MAIN_ANIM = 1050;

  const ADS_HOLD = MAIN_HOLD * 2;
  const ADS_ANIM = 1500;
  const ADS_DELAY = 2200;

  return (
    <div className="waPage">
      <header className="waHeader">
        <img
          className="waHeaderWordmark"
          src={headerWordmark}
          alt="Welcome to Wings Arena"
          draggable="false"
        />

        {/* ✅ Right-side header logo */}
        <img
          className="waHeaderLogoRight"
          src={headerLogoRight}
          alt="Wings Arena"
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
              maxHeightVh={82}
              zoom={1.0}
              showTitle={false}
              fit="cover"
              stageAspect={16 / 9} // ✅ keeps main clean on 1080p output
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
              maxHeightVh={90}
              zoom={1.0}
              showTitle={false}
              fit="cover"
              stageAspect={6 / 8} // ✅ FIX: ad feels less tall/thin (poster-friendly)
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
