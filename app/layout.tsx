import "./globals.css";
import Nav from "./components/Nav";
import Controls from "./components/Controls";

export const metadata = { title: "Hachi-co", description: "Your loyal SMM buddy" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Spline Sans + Noto Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&family=Spline+Sans:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="container-wide">
          <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid var(--warm-border)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <svg width="34" height="34" viewBox="0 0 48 48" fill="none"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.4119 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.4119C27.8527 3.0243 25.8765 3.0257 24.2861 3.3678C22.6081 3.7286 20.7334 4.5842 18.8396 5.748C16.4978 7.1872 13.9881 9.1835 11.5858 11.5858C9.1835 13.988 7.1872 16.4978 5.748 18.8396C4.5842 20.7334 3.7286 22.6081 3.3678 24.2861C3.0257 25.8765 3.0243 27.8527 4.4119 29.2403Z"/></svg>
              <h1 style={{ fontSize:18, fontWeight:800, letterSpacing:"-.01em" }}>Solo SMM Copilot</h1>
            </div>
            <Nav />
          </header>

          <div style={{ margin:"10px 0" }}>
            <Controls />
          </div>

          <main style={{ paddingTop: 8 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
