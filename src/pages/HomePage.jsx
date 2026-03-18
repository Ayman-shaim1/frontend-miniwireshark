import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useDeferredValue,
} from "react";
import { LineChart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CaptureToolbar from "@/components/CaptureToolbar";
import LiveChartDrawer from "@/components/LiveChartDrawer";
import captureService from "@/services/captureService";
import { packetSocket } from "@/services/packetSocket";

export default function HomePage() {
  const [interfaces, setInterfaces] = useState([]);
  const [selectedInterface, setSelectedInterface] = useState("");
  const [status, setStatus] = useState(null);
  const [packets, setPackets] = useState([]);
  const [colFilters, setColFilters] = useState({
    time: "",
    source: "",
    destination: "",
    protocol: "",
    length: "",
    info: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartDrawerOpen, setChartDrawerOpen] = useState(false);

  const uniqueProtocols = useMemo(() => {
    const set = new Set();
    packets.forEach((p) => {
      const v = p.protocol ?? "";
      if (v) set.add(v);
    });
    return ["", ...[...set].sort()];
  }, [packets]);

  const filteredPackets = useMemo(() => {
    return packets.filter((pkt) => {
      const src = `${pkt.srcIp ?? pkt.source ?? ""}:${pkt.srcPort ?? ""}`;
      const dst = `${pkt.dstIp ?? pkt.destination ?? ""}:${pkt.dstPort ?? ""}`;
      const time =
        pkt.timestamp != null
          ? new Date(pkt.timestamp).toLocaleTimeString(undefined, {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : (pkt.time ?? "");
      const protocol = (pkt.protocol ?? "").toLowerCase();
      const length = String(pkt.length ?? "");
      const info = (pkt.info ?? "").toLowerCase();

      const qTime = colFilters.time.trim();
      const qSrc = colFilters.source.trim().toLowerCase();
      const qDst = colFilters.destination.trim().toLowerCase();
      const qProto = colFilters.protocol.trim().toLowerCase();
      const qLen = colFilters.length.trim();
      const qInfo = colFilters.info.trim().toLowerCase();

      if (qTime && !time.startsWith(qTime) && !time.includes(qTime))
        return false;
      if (qSrc && !src.toLowerCase().includes(qSrc)) return false;
      if (qDst && !dst.toLowerCase().includes(qDst)) return false;
      if (qProto && protocol !== qProto) return false;
      if (qLen && length !== qLen && !length.includes(qLen)) return false;
      if (qInfo && !info.includes(qInfo)) return false;
      return true;
    });
  }, [packets, colFilters]);

  const setColFilter = (col, value) => {
    setColFilters((prev) => ({ ...prev, [col]: value }));
  };

  const handlePacket = useCallback((packet) => {
    setPackets((prev) => [packet, ...prev].slice(0, 3000));
  }, []);

  const deferredFilteredPackets = useDeferredValue(filteredPackets);

  const loadInterfaces = async () => {
    try {
      setError(null);
      const data = await captureService.getInterfaces();
      const list = Array.isArray(data)
        ? data
        : (data?.interfaces ?? data?.data ?? []);
      setInterfaces(list);
      if (list.length > 0 && !selectedInterface) {
        const first =
          typeof list[0] === "string"
            ? list[0]
            : (list[0]?.name ?? list[0]?.id);
        setSelectedInterface(first ?? "");
      }
    } catch (err) {
      setError(err.message);
      setInterfaces([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    try {
      const data = await captureService.getStatus();
      setStatus(data);
    } catch (err) {
      setStatus(null);
    }
  };

  useEffect(() => {
    loadInterfaces();
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const isCapturing =
    status?.capturing ?? status?.active ?? status?.running ?? false;

  useEffect(() => {
    const unsubscribe = packetSocket.subscribe(handlePacket);
    return unsubscribe;
  }, [handlePacket]);

  const handleStart = async () => {
    if (!selectedInterface) return;
    setLoading(true);
    setError(null);
    try {
      await captureService.startCapture(selectedInterface);
      await refreshStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setError(null);
    try {
      await captureService.stopCapture();
      await refreshStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <CaptureToolbar
        interfaces={interfaces}
        selectedInterface={selectedInterface}
        onInterfaceChange={setSelectedInterface}
        loading={loading}
        onStart={handleStart}
        onStop={handleStop}
        isCapturing={isCapturing}
        error={error}
      />

      {/* Zone tableau */}
      <main className="min-h-0 flex-1 overflow-hidden p-4">
        <div className="flex h-full flex-col rounded-lg border bg-card">
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-medium">Paquets capturés</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {filteredPackets.length}{" "}
                {filteredPackets.length !== packets.length
                  ? `/ ${packets.length} `
                  : ""}
                paquet{filteredPackets.length !== 1 ? "s" : ""}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setChartDrawerOpen(true)}
              >
                <LineChart className="size-4" />
                Live line chart
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPackets([])}
                disabled={packets.length === 0}
              >
                <Trash2 className="size-4" />
                Effacer
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 border-b bg-muted/80 backdrop-blur-sm">
                <tr>
                  <th className="h-9 px-4 text-left font-medium">Time</th>
                  <th className="h-9 px-4 text-left font-medium">Source</th>
                  <th className="h-9 px-4 text-left font-medium">
                    Destination
                  </th>
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
                      {uniqueProtocols
                        .filter((p) => p)
                        .map((p) => (
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
                {filteredPackets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-16 text-center text-muted-foreground"
                    >
                      {packets.length === 0
                        ? "Aucun paquet capturé. Sélectionnez une interface et démarrez la capture."
                        : "Aucun paquet ne correspond aux filtres."}
                    </td>
                  </tr>
                ) : (
                  filteredPackets.map((pkt, i) => {
                    const src =
                      pkt.srcIp != null
                        ? `${pkt.srcIp}${pkt.srcPort != null ? `:${pkt.srcPort}` : ""}`
                        : (pkt.source ?? "—");
                    const dst =
                      pkt.dstIp != null
                        ? `${pkt.dstIp}${pkt.dstPort != null ? `:${pkt.dstPort}` : ""}`
                        : (pkt.destination ?? "—");
                    const time =
                      pkt.timestamp != null
                        ? new Date(pkt.timestamp).toLocaleTimeString()
                        : (pkt.time ?? "—");
                    return (
                      <tr
                        key={pkt.id ?? pkt.no ?? i}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="px-4 py-2">{time}</td>
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
        </div>
      </main>

      <LiveChartDrawer
        open={chartDrawerOpen}
        onClose={() => setChartDrawerOpen(false)}
        packets={deferredFilteredPackets}
        totalPackets={packets.length}
        filteredCount={filteredPackets.length}
      />
    </div>
  );
}
