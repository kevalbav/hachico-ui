export default function Sparkline({ points }: { points: number[] }) {
  const w = 320, h = 48, pad = 6;
  if (!points || points.length < 2) return <div style={{height:h}} />;
  const min = Math.min(...points), max = Math.max(...points);
  const lo = min === max ? min - 1 : min;
  const hi = min === max ? max + 1 : max;
  const xs = points.map((_, i) => pad + (i * (w - 2 * pad)) / (points.length - 1));
  const ys = points.map(v => h - pad - ((v - lo) / (hi - lo)) * (h - 2 * pad));
  let d = `M ${xs[0].toFixed(2)} ${ys[0].toFixed(2)}`;
  for (let i = 1; i < xs.length; i++) d += ` L ${xs[i].toFixed(2)} ${ys[i].toFixed(2)}`;
  const lastX = xs[xs.length - 1], lastY = ys[ys.length - 1];
  return (
    <div className="sparkline-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} style={{ display:"block", width:"100%", height:h }} preserveAspectRatio="none">
        <rect x="0" y="0" width={w} height={h} rx="8" fill="rgba(249,245,6,0.10)" />
        <path d={d} fill="none" stroke="var(--warm-text-primary)" strokeWidth="1.5" />
        <circle cx={lastX} cy={lastY} r="2.5" fill="var(--warm-text-primary)" />
      </svg>
    </div>
  );
}
