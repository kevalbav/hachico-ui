import { cn } from "../lib/cn";

export default function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("hc-card kpi-card", className)}>{children}</div>;
}
