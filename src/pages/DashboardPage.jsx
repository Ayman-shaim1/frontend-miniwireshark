import { useState, useEffect } from "react";
import { Filter, RotateCcw } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dashboardService from "@/services/dashboardService";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

function ChartDateFilter({ dateDebut, dateFin, onDateDebutChange, onDateFinChange, onFilter, onReset }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
      <label className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Date début</span>
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => onDateDebutChange(e.target.value)}
          className="h-7 rounded border border-input bg-background px-2"
        />
      </label>
      <label className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Date fin</span>
        <input
          type="date"
          value={dateFin}
          onChange={(e) => onDateFinChange(e.target.value)}
          className="h-7 rounded border border-input bg-background px-2"
        />
      </label>
      <button
        type="button"
        onClick={onFilter}
        className="flex h-7 items-center gap-1 rounded border border-primary bg-primary px-2 text-primary-foreground hover:bg-primary/90"
      >
        <Filter className="size-3.5" />
        Filtrer
      </button>
      <button
        type="button"
        onClick={onReset}
        className="flex h-7 items-center gap-1 rounded border border-input bg-background px-2 hover:bg-muted"
      >
        <RotateCcw className="size-3.5" />
        Reset
      </button>
    </div>
  );
}

function ProtocolChart() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [appliedDates, setAppliedDates] = useState({ dateDebut: "", dateFin: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const { dateDebut: d1, dateFin: d2 } = appliedDates;

    dashboardService.getProtocolDistribution(d1, d2)
      .then((protocol) => {
        if (cancelled) return;
        const proto = Array.isArray(protocol) ? protocol : protocol?.data ?? protocol?.content ?? [];
        setData(proto.map((p) => ({ name: p.protocol ?? "Autre", value: p.count ?? 0 })));
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [appliedDates]);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">Répartition par protocole</h2>
      <ChartDateFilter
        dateDebut={dateDebut}
        dateFin={dateFin}
        onDateDebutChange={setDateDebut}
        onDateFinChange={setDateFin}
        onFilter={() => setAppliedDates({ dateDebut, dateFin })}
        onReset={() => { setDateDebut(""); setDateFin(""); setAppliedDates({ dateDebut: "", dateFin: "" }); }}
      />
      <div className="h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-destructive text-sm">{error}</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, "Paquets"]} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée</div>
        )}
      </div>
    </div>
  );
}

function PacketsByDateChart() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [appliedDates, setAppliedDates] = useState({ dateDebut: "", dateFin: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const { dateDebut: d1, dateFin: d2 } = appliedDates;

    dashboardService.getPacketsByDate(d1, d2)
      .then((packetsByDate) => {
        if (cancelled) return;
        const rows = Array.isArray(packetsByDate) ? packetsByDate : packetsByDate?.data ?? packetsByDate?.content ?? [];
        setData(rows.map((t) => ({
          date: t.time ? new Date(t.time).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—",
          paquets: t.cnt ?? t.count ?? 0,
        })));
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [appliedDates]);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">Paquets par date</h2>
      <ChartDateFilter
        dateDebut={dateDebut}
        dateFin={dateFin}
        onDateDebutChange={setDateDebut}
        onDateFinChange={setDateFin}
        onFilter={() => setAppliedDates({ dateDebut, dateFin })}
        onReset={() => { setDateDebut(""); setDateFin(""); setAppliedDates({ dateDebut: "", dateFin: "" }); }}
      />
      <div className="h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-destructive text-sm">{error}</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPaquetsDash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="paquets" stroke="#3b82f6" fill="url(#colorPaquetsDash)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée</div>
        )}
      </div>
    </div>
  );
}

function TopSourcesChart() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [appliedDates, setAppliedDates] = useState({ dateDebut: "", dateFin: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const { dateDebut: d1, dateFin: d2 } = appliedDates;

    dashboardService.getTop5Sources(d1, d2)
      .then((sources) => {
        if (cancelled) return;
        const src = Array.isArray(sources) ? sources : sources?.data ?? sources?.content ?? [];
        setData(src.map((s) => ({
          ip: (s.address ?? s.ip ?? "").length > 20 ? (s.address ?? s.ip ?? "").slice(0, 17) + "…" : (s.address ?? s.ip ?? "—"),
          count: s.count ?? 0,
        })));
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [appliedDates]);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">Top 5 sources</h2>
      <ChartDateFilter
        dateDebut={dateDebut}
        dateFin={dateFin}
        onDateDebutChange={setDateDebut}
        onDateFinChange={setDateFin}
        onFilter={() => setAppliedDates({ dateDebut, dateFin })}
        onReset={() => { setDateDebut(""); setDateFin(""); setAppliedDates({ dateDebut: "", dateFin: "" }); }}
      />
      <div className="h-48">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-destructive text-sm">{error}</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="ip" width={100} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Paquets" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée</div>
        )}
      </div>
    </div>
  );
}

function TopDestinationsChart() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [appliedDates, setAppliedDates] = useState({ dateDebut: "", dateFin: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const { dateDebut: d1, dateFin: d2 } = appliedDates;

    dashboardService.getTop5Destinations(d1, d2)
      .then((destinations) => {
        if (cancelled) return;
        const dst = Array.isArray(destinations) ? destinations : destinations?.data ?? destinations?.content ?? [];
        setData(dst.map((d) => ({
          ip: (d.address ?? d.dst ?? "").length > 20 ? (d.address ?? d.dst ?? "").slice(0, 17) + "…" : (d.address ?? d.dst ?? "—"),
          count: d.count ?? 0,
        })));
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [appliedDates]);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">Top 5 destinations</h2>
      <ChartDateFilter
        dateDebut={dateDebut}
        dateFin={dateFin}
        onDateDebutChange={setDateDebut}
        onDateFinChange={setDateFin}
        onFilter={() => setAppliedDates({ dateDebut, dateFin })}
        onReset={() => { setDateDebut(""); setDateFin(""); setAppliedDates({ dateDebut: "", dateFin: "" }); }}
      />
      <div className="h-48">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-destructive text-sm">{error}</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="ip" width={100} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" name="Paquets" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Aucune donnée</div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Tableau de bord</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProtocolChart />
        <PacketsByDateChart />
        <TopSourcesChart />
        <TopDestinationsChart />
      </div>
    </div>
  );
}
