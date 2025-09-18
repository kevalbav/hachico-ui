"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const Item = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return <Link href={href} className={`hc-pill ${active ? "hc-pill-active" : ""}`}>{label}</Link>;
  };
  return (
    <nav style={{display:"flex", flexWrap:"wrap", gap:12}}>
      <Item href="/" label="Dashboard" />
      <Item href="/wins" label="Wins" />
      <Item href="/day" label="Day Plan" />
      <Item href="/reports" label="Reports" />
      <Item href="/reference-corner" label="Reference Corner" />
      <Item href="/kpis" label="KPIs" />
      <Item href="/kpis/add" label="Add KPIs" />
      <Item href="/import" label="Import" />
    </nav>
  );
}
