// src/App.jsx
import "./App.css";

import ProgramSlideshow from "./components/ProgramSlideshow";

// ✅ Header wordmark image
import headerWordmark from "./assets/welcometowings.png";

// Slides
import one from "./assets/slides/1.jpeg";
import two from "./assets/slides/2.jpg";
import three from "./assets/slides/3.jpg";
import four from "./assets/slides/4.jpg";
import five from "./assets/slides/5.jpg";

export default function App() {
  // ✅ Each slide can have a title. If title is "", the pill shows blank.
  const slides = [
    { src: one, title: "WELCOME" },
    { src: two, title: "COMMUNITY" },
    { src: three, title: "PROGRAMS" },
    { src: four, title: "" }, // blank pill
    { src: five, title: "GAME DAY" },
  ];

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

      <main className="waMain waMainSolo">
        <div className="waSlideshowWrap">
          <ProgramSlideshow
            slides={slides}
            holdMs={6500}
            animMs={700}
            maxWidthPx={2400} /* ✅ wider */
            maxHeightVh={78}  /* ✅ optional: slightly taller too */
          />
        </div>
      </main>
    </div>
  );
}
