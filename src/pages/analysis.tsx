import { useState } from "react";
import { ArrowRight } from "lucide-react";

function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 70;
  const innerR = 46;
  const gap = 3;
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) return <svg width={size} height={size} />;

  let angle = -90;
  const slices = data.map((d) => {
    const sliceDeg = (d.value / total) * 360;
    const startAngle = angle;
    const endAngle = angle + sliceDeg - gap;
    angle += sliceDeg;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + outerR * Math.cos(toRad(startAngle));
    const y1 = cy + outerR * Math.sin(toRad(startAngle));
    const x2 = cx + outerR * Math.cos(toRad(endAngle));
    const y2 = cy + outerR * Math.sin(toRad(endAngle));
    const x3 = cx + innerR * Math.cos(toRad(endAngle));
    const y3 = cy + innerR * Math.sin(toRad(endAngle));
    const x4 = cx + innerR * Math.cos(toRad(startAngle));
    const y4 = cy + innerR * Math.sin(toRad(startAngle));
    const large = sliceDeg - gap > 180 ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");

    return { ...d, path };
  });

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      {slices.map((s) => (
        <path key={s.name} d={s.path} fill={s.color} />
      ))}
    </svg>
  );
}

const intentData = [
  { name: "Meetings", value: 42, color: "#f97316" },
  { name: "Follow-ups", value: 35, color: "#c2410c" },
  { name: "Packages/Other", value: 23, color: "#7c3f1e" },
];

const weeklyRhythm = [
  { day: "Mon", morning: 8, afternoon: 5, evening: 2 },
  { day: "Tue", morning: 12, afternoon: 8, evening: 3 },
  { day: "Wed", morning: 6, afternoon: 9, evening: 4 },
  { day: "Thu", morning: 10, afternoon: 11, evening: 3 },
  { day: "Fri", morning: 7, afternoon: 6, evening: 1 },
  { day: "Sat", morning: 2, afternoon: 3, evening: 0 },
  { day: "Sun", morning: 1, afternoon: 2, evening: 0 },
];

function HeatCell({ value, max }: { value: number; max: number }) {
  const intensity = max > 0 ? value / max : 0;
  const alpha = 0.15 + intensity * 0.75;
  return (
    <div
      className="w-12 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
      style={{
        background: `rgba(249, 115, 22, ${alpha})`,
      }}
    >
      {value}
    </div>
  );
}

type Period = "Today" | "7 days" | "30 days";

export default function AnalysisPage() {
  const [period, setPeriod] = useState<Period>("7 days");
  const maxVal = Math.max(...weeklyRhythm.flatMap((d) => [d.morning, d.afternoon, d.evening]));

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between px-8 pt-8 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analysis & Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">From your recent emails and events</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Synced: Google, Outlook, Apple</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(["Today", "7 days", "30 days"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-8 grid grid-cols-2 gap-4 mb-4">
        {/* Time saved */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
            <span className="text-primary text-sm">⏱</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Time saved</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">4h 30min</span>
            <span className="text-xs text-green-400 font-medium">↗12%</span>
          </div>
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "72%",
                background: "linear-gradient(90deg, #f97316, #ea580c)",
              }}
            />
          </div>
          <button className="hidden flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
            See details <ArrowRight size={13} />
          </button>
        </div>

        {/* Actions converted */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
            <span className="text-primary text-sm">✅</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Actions converted</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">24</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">emails → events/tasks</p>
          <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "58%",
                background: "linear-gradient(90deg, #f97316, #7c3f1e)",
              }}
            />
          </div>
          <button className="hidden flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
            See details <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Lower section */}
      <div className="px-8 pb-8 grid grid-cols-2 gap-4">
        {/* Intent mix */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-0.5">Intent mix</h3>
          <p className="text-xs text-muted-foreground mb-4">From your emails</p>
          <div className="flex items-center gap-6">
            <DonutChart data={intentData} />
            <div className="space-y-3">
              {intentData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly rhythm */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <h3 className="text-base font-semibold text-foreground mb-0.5">Weekly rhythm</h3>
          <p className="text-xs text-muted-foreground mb-4">Best windows to propose or prepare</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left w-10" />
                  <th className="text-center text-xs text-muted-foreground font-medium pb-2 px-1">Morning</th>
                  <th className="text-center text-xs text-muted-foreground font-medium pb-2 px-1">Afternoon</th>
                  <th className="text-center text-xs text-muted-foreground font-medium pb-2 px-1">Evening</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {weeklyRhythm.map((row) => (
                  <tr key={row.day}>
                    <td className="text-xs text-muted-foreground pr-2 py-1 w-8">{row.day}</td>
                    <td className="py-0.5 px-1">
                      <HeatCell value={row.morning} max={maxVal} />
                    </td>
                    <td className="py-0.5 px-1">
                      <HeatCell value={row.afternoon} max={maxVal} />
                    </td>
                    <td className="py-0.5 px-1">
                      <HeatCell value={row.evening} max={maxVal} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
