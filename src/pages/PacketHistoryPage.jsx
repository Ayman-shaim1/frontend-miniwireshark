import { useState, useEffect, useCallback, useRef } from "react";
import { Filter, Trash2, ChevronLeft, ChevronRight, Download, ChevronDown } from "lucide-react";
import historyService from "@/services/historyService";

const PROTOCOLS = ["", "TCP", "UDP", "ICMP", "HTTP", "POSTGRESQL", "DNS", "ARP"];

export default function PacketHistoryPage() {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [colFilters, setColFilters] = useState({
    time: "",
    source: "",
    destination: "",
    protocol: "",
    length: "",
    info: "",
  });
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    dateDebut: "",
    dateFin: "",
    source: "",
    destination: "",
    protocol: "",
    length: "",
    info: "",
  });
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);
  const pageSize = 100;

  const handleExport = async (format) => {
    setExportOpen(false);
    setExporting(true);
    setError(null);
    try {
      const blob = await historyService.exportHistory(format, appliedFilters);
      const ext = format === "csv" ? "csv" : "json";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `historique-paquets-${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const setColFilter = (col, value) => {
    setColFilters((prev) => ({ ...prev, [col]: value }));
  };

  const setDateFilter = (key, value) => {
    if (key === "dateDebut") setDateDebut(value);
    else setDateFin(value);
  };

  const applyFilters = () => {
    setAppliedFilters({
      dateDebut,
      dateFin,
      source: colFilters.source,
      destination: colFilters.destination,
      protocol: colFilters.protocol,
      length: colFilters.length,
      info: colFilters.info,
    });
    setPage(0);
  };

  const clearFilters = () => {
    setColFilters({
      time: "",
      source: "",
      destination: "",
      protocol: "",
      length: "",
      info: "",
    });
    setDateDebut("");
    setDateFin("");
    setAppliedFilters({
      dateDebut: "",
      dateFin: "",
      source: "",
      destination: "",
      protocol: "",
      length: "",
      info: "",
    });
    setPage(0);
  };

  const fetchIdRef = useRef(0);

  const fetchHistory = useCallback(async () => {
    const requestId = ++fetchIdRef.current;
    const requestedPage = page;
    setLoading(true);
    setError(null);
    try {
      const data = await historyService.getHistory({
        page: requestedPage,
        size: pageSize,
        dateDebut: appliedFilters.dateDebut || undefined,
        dateFin: appliedFilters.dateFin || undefined,
        source: appliedFilters.source || undefined,
        destination: appliedFilters.destination || undefined,
        protocol: appliedFilters.protocol || undefined,
        length: appliedFilters.length || undefined,
        info: appliedFilters.info || undefined,
      });

      const items = Array.isArray(data)
        ? data
        : data?.content ?? data?.data ?? data?.packets ?? data?.items ?? [];
      if (requestId !== fetchIdRef.current) return;

      const arr = Array.isArray(items) ? items : [];

      const total =
        data?.totalElements ??
        data?.total ??
        data?.count ??
        data?.pagination?.totalElements ??
        data?.pagination?.total ??
        arr.length;
      let pages =
        data?.totalPages ??
        data?.total_pages ??
        data?.pagination?.totalPages ??
        data?.pagination?.total_pages;

      if (pages == null) {
        pages = pageSize > 0 ? Math.ceil(Number(total) / pageSize) : 1;
        if (pages <= 1 && arr.length >= pageSize) {
          pages = requestedPage + 2;
        } else if (arr.length < pageSize && requestedPage > 0) {
          pages = requestedPage + 1;
        }
      }

      setPackets(arr);
      setTotalPages(Math.max(1, Number(pages) || 1));
      setTotalElements(Math.max(arr.length, Number(total) || 0));
    } catch (err) {
      if (requestId !== fetchIdRef.current) return;
      setError(err.message);
      setPackets([]);
    } finally {
      if (requestId !== fetchIdRef.current) return;
      setLoading(false);
    }
  }, [page, appliedFilters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!exportOpen) return;
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [exportOpen]);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-2">
          <span className="text-sm font-medium">Historique des paquets</span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Date début</span>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateFilter("dateDebut", e.target.value)}
                className="h-7 rounded border border-input bg-background px-2 text-xs"
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Date fin</span>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFilter("dateFin", e.target.value)}
                className="h-7 rounded border border-input bg-background px-2 text-xs"
              />
            </label>
            <button
              type="button"
              onClick={applyFilters}
              className="flex h-7 items-center gap-1.5 rounded border border-primary bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Filter className="size-3.5" />
              Filtrer
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-7 items-center gap-1.5 rounded border border-input bg-background px-3 text-xs font-medium hover:bg-muted"
            >
              <Trash2 className="size-3.5" />
              Effacer
            </button>
            <div className="relative" ref={exportRef}>
              <button
                type="button"
                onClick={() => setExportOpen((o) => !o)}
                disabled={exporting}
                className="flex h-7 items-center gap-1.5 rounded border border-input bg-background px-3 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                <Download className="size-3.5" />
                Exporter
                <ChevronDown className="size-3.5" />
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[100px] rounded border border-input bg-background py-1 shadow-md">
                  <button
                    type="button"
                    onClick={() => handleExport("json")}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted"
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("csv")}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted"
                  >
                    CSV
                  </button>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {totalElements} paquet{totalElements !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {error && (
          <div className="border-b border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 border-b bg-muted/80 backdrop-blur-sm">
                <tr>
                  <th className="h-9 px-4 text-left font-medium">Date</th>
                  <th className="h-9 px-4 text-left font-medium">Source</th>
                  <th className="h-9 px-4 text-left font-medium">Destination</th>
                  <th className="h-9 px-4 text-left font-medium">Protocol</th>
                  <th className="h-9 px-4 text-left font-medium">Length</th>
                  <th className="h-9 px-4 text-left font-medium">Info</th>
                </tr>
                <tr className="border-b bg-muted/50">
                  <th className="p-1">
                    <input
                      type="time"
                      value={colFilters.time}
                      onChange={(e) => setColFilter("time", e.target.value)}
                      className="h-7 w-full rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </th>
                  <th className="p-1">
                    <input
                      type="text"
                      placeholder="Filtrer…"
                      value={colFilters.source}
                      onChange={(e) => setColFilter("source", e.target.value)}
                      className="h-7 w-full min-w-[100px] rounded border border-input bg-background px-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </th>
                  <th className="p-1">
                    <input
                      type="text"
                      placeholder="Filtrer…"
                      value={colFilters.destination}
                      onChange={(e) =>
                        setColFilter("destination", e.target.value)
                      }
                      className="h-7 w-full min-w-[100px] rounded border border-input bg-background px-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </th>
                  <th className="p-1">
                    <select
                      value={colFilters.protocol}
                      onChange={(e) => setColFilter("protocol", e.target.value)}
                      className="h-7 w-full min-w-[80px] rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Tous</option>
                      {PROTOCOLS.filter((p) => p).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th className="p-1">
                    <input
                      type="number"
                      placeholder="Length"
                      min={0}
                      value={colFilters.length}
                      onChange={(e) => setColFilter("length", e.target.value)}
                      className="h-7 w-full min-w-[60px] rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </th>
                  <th className="p-1">
                    <input
                      type="text"
                      placeholder="Filtrer…"
                      value={colFilters.info}
                      onChange={(e) => setColFilter("info", e.target.value)}
                      className="h-7 w-full min-w-[80px] rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2">
                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="h-4 w-10 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="h-4 w-40 max-w-[200px] animate-pulse rounded bg-muted" />
                      </td>
                    </tr>
                  ))
                ) : packets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-16 text-center text-muted-foreground"
                    >
                      Aucun paquet dans l&apos;historique.
                    </td>
                  </tr>
                ) : (
                  packets.map((pkt, i) => {
                    const src =
                      pkt.srcIp != null
                        ? `${pkt.srcIp}${pkt.srcPort != null ? `:${pkt.srcPort}` : ""}`
                        : "—";
                    const dst =
                      pkt.dstIp != null
                        ? `${pkt.dstIp}${pkt.dstPort != null ? `:${pkt.dstPort}` : ""}`
                        : "—";
                    const dateTime =
                      pkt.timestamp != null
                        ? new Date(pkt.timestamp).toLocaleString(undefined, {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })
                        : "—";
                    return (
                      <tr
                        key={pkt.id ?? pkt.packetNo ?? i}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="whitespace-nowrap px-4 py-2">{dateTime}</td>
                        <td className="px-4 py-2 font-mono text-xs">{src}</td>
                        <td className="px-4 py-2 font-mono text-xs">{dst}</td>
                        <td className="px-4 py-2">{pkt.protocol ?? "—"}</td>
                        <td className="px-4 py-2">{pkt.length ?? "—"}</td>
                        <td className="max-w-[200px] truncate px-4 py-2 text-muted-foreground">
                          {pkt.info ?? "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
          </table>
        </div>

        {!loading && (totalPages > 1 || totalElements > 0) && (
          <div className="flex shrink-0 justify-end border-t px-4 py-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page <= 0}
                className="flex items-center gap-1.5 rounded border border-input bg-background px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted"
              >
                <ChevronLeft className="size-4" />
                Précédent
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((p) =>
                    Math.min(Math.max(0, totalPages - 1), p + 1)
                  )
                }
                disabled={
                  totalPages <= 1 || page >= Math.max(1, totalPages) - 1
                }
                className="flex items-center gap-1.5 rounded border border-input bg-background px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-muted"
              >
                Suivant
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
