import "./globals.css";
import Link from "next/link";
import Controls from "./components/Controls";

export const metadata = { title: "Hachi-co", description: "Your loyal SMM buddy" };


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: 16 }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>🐾 Hachi-co</h1>
            <nav style={{ display: "flex", gap: 12, fontSize: 14 }}>
              <Link href="/">Dashboard</Link>
              <Link href="/wins">Wins</Link>
              <Link href="/day">Day Plan</Link>
              <Link href="/reports">Reports</Link>
              <Link href="/kpis">KPIs</Link>
              <Link href="/import">Import</Link>
            </nav>
          </header>
          <Controls />
          <main style={{  paddingTop: 12 }}>{children}</main>
        </div>
      </body>
    </html>
  );
} 

