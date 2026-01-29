import ProgramSlideshow from "./components/ProgramSlideshow";

import logo from "./assets/logo.png";

// Slides
import one from "./assets/slides/1.jpeg";
import two from "./assets/slides/2.jpg";
import three from "./assets/slides/3.jpg";
import four from "./assets/slides/4.jpg";
import five from "./assets/slides/5.jpg";

export default function App() {
  const slides = [one, two, three, four, five];

  return (
    <div style={styles.page}>
      {/* Header (title only) */}
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome to Wings Arena</h1>
      </header>

      {/* Main: left logo | slideshow | right logo */}
      <main style={styles.main}>
        {/* Left logo */}
        <div style={styles.sideLogoWrap}>
          <img src={logo} alt="Wings Arena" style={styles.sideLogo} />
        </div>

        {/* Slideshow */}
        <div style={styles.slideshowWrap}>
          <ProgramSlideshow slides={slides} holdMs={6500} animMs={700} />
        </div>

        {/* Right logo */}
        <div style={{ ...styles.sideLogoWrap, justifyContent: "flex-end" }}>
          <img src={logo} alt="Wings Arena" style={styles.sideLogo} />
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",
    height: "100vh",
    background: "#070B14",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  /* Top header bar */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
    backdropFilter: "blur(10px)",
    textAlign: "center",
  },
  title: {
    margin: 0,
    color: "white",
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: "0.2px",
    lineHeight: 1.05,
  },

  /* Main layout */
  main: {
    flex: 1,
    display: "grid",
    gridTemplateColumns:
      "clamp(140px, 16vw, 260px) minmax(0, 1fr) clamp(140px, 16vw, 260px)",
    alignItems: "center",
    padding: "22px 28px",
    gap: 24,
  },

  sideLogoWrap: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: 0,
  },
  sideLogo: {
    width: "100%",
    maxWidth: 260,
    height: "auto",
    objectFit: "contain",
    opacity: 0.95,
    filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.55))",
  },

  slideshowWrap: {
    width: "100%",
    height: "100%",
    minWidth: 0,
    display: "grid",
    placeItems: "center",
  },
};
