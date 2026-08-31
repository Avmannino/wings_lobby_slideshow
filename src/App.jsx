// src/App.jsx
import { useMemo } from "react";
import "./App.css";

import ProgramSlideshow from "./components/ProgramSlideshow";

// ✅ Header wordmark image
import headerWordmark from "./assets/welcometowings.png";

// ✅ small logo on the right
import headerLogoRight from "./assets/wings-logo.png";

// ✅ logo that sits to the RIGHT of the header text
import headerLogoInline from "./assets/wings-logo.png";

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
import fourteen from "./assets/slides/14.jpg";
import fifteen from "./assets/slides/15.jpg";
import sixteen from "./assets/slides/16.jpg";
import seventeen from "./assets/slides/17.jpg";
import eighteen from "./assets/slides/18.jpg";
import nineteen from "./assets/slides/19.jpg";
import twenty from "./assets/slides/20.jpg";
import twentyone from "./assets/slides/21.jpg";
import twentytwo from "./assets/slides/22.jpg";
import twentythree from "./assets/slides/23.jpg";
import twentyfour from "./assets/slides/24.jpg";
import twentyfive from "./assets/slides/25.jpg";
import twentysix from "./assets/slides/26.jpg";
import twentyseven from "./assets/slides/27.jpg";
import twentyeight from "./assets/slides/28.jpg";
import twentynine from "./assets/slides/29.jpg";
import thirty from "./assets/slides/30.jpg";
import thirtyone from "./assets/slides/31.jpg";
import thirtytwo from "./assets/slides/32.jpg";
import thirtythree from "./assets/slides/33.jpg";
import thirtyfour from "./assets/slides/34.jpg";
import thirtyfive from "./assets/slides/35.jpg";
import thirtysix from "./assets/slides/36.jpg";
import thirtyseven from "./assets/slides/37.jpg";
import thirtyeight from "./assets/slides/38.jpg";
import thirtynine from "./assets/slides/39.jpg";
import forty from "./assets/slides/40.jpg";
import fortyone from "./assets/slides/41.jpg";
import fortytwo from "./assets/slides/42.jpg";
import fortythree from "./assets/slides/43.jpg";
import fortyfour from "./assets/slides/44.jpg";
import fortyfive from "./assets/slides/45.jpg";
import fortysix from "./assets/slides/46.jpg";
import fortyseven from "./assets/slides/47.jpg";
import fortyeight from "./assets/slides/48.jpg";
import fortynine from "./assets/slides/49.jpg";
import fifty from "./assets/slides/50.jpg";
import fiftyone from "./assets/slides/51.jpg";
import fiftythree from "./assets/slides/53.jpg";
import fiftyfour from "./assets/slides/54.jpg";
import fiftyfive from "./assets/slides/55.jpg";
import fiftyseven from "./assets/slides/57.jpg";
import fiftyeight from "./assets/slides/58.jpg";
import fiftynine from "./assets/slides/59.jpg";
import sixty from "./assets/slides/60.jpg";
import sixtyone from "./assets/slides/61.jpg";
import sixtytwo from "./assets/slides/62.jpg";
import sixtythree from "./assets/slides/63.jpg";
import sixtyfive from "./assets/slides/65.jpg";
import sixtysix from "./assets/slides/66.jpg";
import sixtyseven from "./assets/slides/67.jpg";
import sixtyeight from "./assets/slides/68.jpg";
import seventyfive from "./assets/slides/75.jpg";
import seventyseven from "./assets/slides/77.jpg";
import seventyeight from "./assets/slides/78.jpg";

// Videos
import ltsVid from "./assets/slides/learntoskate.mp4";
import montageVid from "./assets/slides/wingsmontage.mp4";
import olympicsVid from "./assets/slides/olympics.mp4";
import gcdsCelebrationVid from "./assets/slides/gcds-celebration.mp4";

// ✅ Ads
import ad1 from "./assets/ads/1.jpg";
import ad2 from "./assets/ads/2.png";
import ad3 from "./assets/ads/3.jpg";
import ad7 from "./assets/ads/7.png";
import ad9 from "./assets/ads/9.png";

// ✅ Portrait photos shown in the (portrait) ad frame
import portrait1 from "./assets/slides/52.jpg";
import portrait2 from "./assets/slides/56.jpg";
import portrait3 from "./assets/slides/64.JPG";
import portrait4 from "./assets/slides/69.jpg";
import portrait5 from "./assets/slides/70.jpg";
import portrait6 from "./assets/slides/71.jpg";
import portrait7 from "./assets/slides/72.jpg";
import portrait8 from "./assets/slides/73.jpg";
import portrait9 from "./assets/slides/74.jpg";
import portrait10 from "./assets/slides/79.jpeg";
import portrait11 from "./assets/slides/80.jpeg";
import portrait12 from "./assets/slides/81.jpeg";
import portrait13 from "./assets/slides/76.jpg";
import portrait14 from "./assets/slides/84.jpeg";
import portrait15 from "./assets/slides/85.jpg";

export default function App() {
  const slides = [
    { src: one, title: "Wings Arena Adult Hockey League" },
    { src: olympicsVid, title: "Wings Arena" },
    { src: two, title: "Bantam Major - GOLD in Montreal!" },
    { src: three, title: "GSC Mites League" },
    { src: four, title: "Learn To Skate" },
    { src: five, title: "Learn To Play" },
    { src: ltsVid, title: "Learn To Skate" },
    { src: montageVid, title: "Wings Arena" },
    { src: six, title: "Figure Skating" },
    { src: seven, title: "Figure Skating" },
    { src: eight, title: "Figure Skating" },
    { src: nine, title: "Wings @ Night" },
    { src: ten, title: "Wings Day" },
    { src: eleven, title: "Wings @ Night" },
    { src: twelve, title: "Wings @ Night" },
    { src: thirteen, title: "Wings @ Night" },
    { src: fourteen, title: "Wings @ Night" },
    { src: fifteen, title: "Wings @ Night" },
    { src: sixteen, title: "Wings @ Night" },
    { src: seventeen, title: "Wings @ Night" },
    { src: eighteen, title: "Wings @ Night" },
    { src: nineteen, title: "Wings @ Night" },
    { src: twenty, title: "Wings @ Night" },
    { src: twentyone, title: "Wings @ Night" },
    { src: twentytwo, title: "Wings @ Night" },
    { src: twentythree, title: "Wings @ Night" },
    { src: twentyfour, title: "Wings @ Night" },
    { src: montageVid, title: "Wings Arena" },
    { src: twentyfive, title: "Wings @ Night" },
    { src: twentysix, title: "Wings @ Night" },
    { src: twentyseven, title: "Wings @ Night" },
    { src: twentyeight, title: "Wings @ Night" },
    { src: twentynine, title: "Wings @ Night" },
    { src: twentyseven, title: "Wings @ Night" },
    { src: thirty, title: "Wings @ Night" },
    { src: thirtyone, title: "Wings @ Night" },
    { src: thirtytwo, title: "Wings @ Night" },
    { src: thirtythree, title: "Wings @ Night" },
    { src: thirtyfour, title: "Wings @ Night" },
    { src: thirtyfive, title: "Wings @ Night" },
    { src: thirtysix, title: "Wings @ Night" },
    { src: thirtyseven, title: "Wings @ Night" },
    { src: thirtyeight, title: "Wings @ Night" },
    { src: thirtynine, title: "Wings @ Night" },
    { src: forty, title: "Wings @ Night" },
    { src: fortyone, title: "Wings @ Night" },
    { src: fortytwo, title: "Wings @ Night" },
    { src: fortythree, title: "Wings @ Night" },
    { src: fortyfour, title: "Wings @ Night" },
    { src: fortyfive, title: "Wings @ Night" },
    { src: fortysix, title: "Wings @ Night" },
    { src: fortyseven, title: "Wings @ Night" },
    { src: fortyeight, title: "Wings @ Night" },
    { src: fortynine, title: "Wings @ Night" },
    { src: fifty, title: "Wings @ Night" },
    { src: fiftyone, title: "Wings @ Night" },
    { src: fiftythree, title: "Wings @ Night" },
    { src: fiftyfour, title: "Wings @ Night" },
    { src: fiftyfive, title: "Wings @ Night" },
    { src: fiftyseven, title: "Wings @ Night" },
    { src: fiftyeight, title: "Wings @ Night" },
    { src: fiftynine, title: "Wings @ Night" },
    { src: sixty, title: "Wings @ Night" },
    { src: sixtyone, title: "Wings @ Night" },
    { src: sixtytwo, title: "Wings @ Night" },
    { src: sixtythree, title: "Wings @ Night" },
    { src: sixtyfive, title: "Wings @ Night" },
    { src: sixtysix, title: "Wings @ Night" },
    { src: sixtyseven, title: "Wings @ Night" },
    { src: sixtyeight, title: "Wings @ Night" },
    { src: seventyfive, title: "Wings @ Night" },
    { src: seventyseven, title: "Wings @ Night" },
    { src: seventyeight, title: "Wings @ Night" },
    { src: gcdsCelebrationVid, title: "Wings Arena" },
  ];

  const adSlides = [
    ad1,
    ad2,
    ad3,
    ad7,
    ad9,
    portrait1,
    portrait2,
    portrait3,
    portrait4,
    portrait5,
    portrait6,
    portrait7,
    portrait8,
    portrait9,
    portrait10,
    portrait11,
    portrait12,
    portrait13,
    portrait14,
    portrait15,
  ];

  const shuffledSlides = useMemo(() => {
    const arr = [...slides];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const MAIN_HOLD = 4500;
  const MAIN_ANIM = 1100; // ✅ slide duration

  const ADS_HOLD = MAIN_HOLD * 2;
  const ADS_ANIM = 900;
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

        {/* ✅ Left-side header logo */}
        <img
          className="waHeaderLogoRight"
          src={headerLogoRight}
          alt="Wings Arena"
          draggable="false"
        />

        {/* ✅ Right-side header logo */}
        <img
          className="waHeaderLogoInline"
          src={headerLogoInline}
          alt="Header logo"
          draggable="false"
        />
      </header>

      <main className="waMain waMainSplitOneAd">
        {/* Main Slideshow (left) */}
        <section className="waMainSlide" aria-label="Main slideshow">
          <div className="waSlideshowWrap">
            <ProgramSlideshow
              slides={shuffledSlides}
              holdMs={MAIN_HOLD}
              animMs={MAIN_ANIM}
              startDelayMs={0}
              maxWidthPx={2800}
              maxHeightVh={82}
              zoom={1.0}
              showTitle={false}
              fit="cover"
              stageAspect={16 / 10.6}
              transition="slide" // ✅ FORCE FADE (no sliding)
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
              stageAspect={8.5 / 11}
              transition="slide" // (optional) keep ads fading too
            />
          </div>
        </aside>
      </main>
    </div>
  );
}