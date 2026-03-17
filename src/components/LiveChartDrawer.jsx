import { useMemo, memo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BUCKET_MS = 2000;
const MAX_BUCKETS = 60;

function LiveChartDrawer({ open, onClose, packets, totalPackets, filteredCount }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, [open]);

  const chartData = useMemo(() => {
    if (!open || packets.length === 0) return [];

    const buckets = {};
    for (const p of packets) {
      let ts = p.timestamp ?? Date.now();
      if (ts < 1e12) ts *= 1000;
      const bucket = Math.floor(ts / BUCKET_MS) * BUCKET_MS;
      buckets[bucket] = (buckets[bucket] ?? 0) + 1;
    }

    return Object.entries(buckets)
      .map(([t, count]) => ({
        timestamp: +t,
        heure: new Date(+t).toLocaleTimeString(undefined, {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        paquets: count,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-MAX_BUCKETS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, packets, tick]);

  const displayedCount = packets.length;
  const peakRate = chartData.reduce((m, d) => Math.max(m, d.paquets), 0);
  const isFiltered = totalPackets != null && filteredCount != null && filteredCount < totalPackets;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 flex max-h-[55vh] flex-col rounded-t-xl border border-b-0 bg-card shadow-lg transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">
              Live — Paquets entrants
              {isFiltered && (
                <span className="ml-1 font-normal text-muted-foreground">(filtrés)</span>
              )}
            </h2>
            {open && chartData.length > 0 && (
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>
                  {isFiltered ? (
                    <>Affichés: <strong className="text-foreground">{displayedCount}</strong> / {totalPackets}</>
                  ) : (
                    <>Total: <strong className="text-foreground">{displayedCount}</strong></>
                  )}
                </span>
                <span>Pic: <strong className="text-foreground">{peakRate}</strong>/2s</span>
                <span>Points: <strong className="text-foreground">{chartData.length}</strong></span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-[260px] flex-1 p-4">
          {chartData.length > 0 && open ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorPaquets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="heure"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  width={36}
                  domain={[0, "auto"]}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value) => [`${value} paquet${value !== 1 ? "s" : ""}`, "Paquets"]}
                  labelFormatter={(label) => `Heure: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="paquets"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorPaquets)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  name="Paquets"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              Aucun paquet — démarrer la capture
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(LiveChartDrawer);
