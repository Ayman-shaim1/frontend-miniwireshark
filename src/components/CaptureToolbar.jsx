import { Button } from "@/components/ui/button";

export default function CaptureToolbar({
  interfaces,
  selectedInterface,
  onInterfaceChange,
  loading,
  onStart,
  onStop,
  isCapturing,
  error,
}) {
  return (
    <header className="shrink-0 border-b bg-card px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-semibold tracking-tight">
          Mini-Wireshark
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Interface</span>
            <select
              value={selectedInterface}
              onChange={(e) => onInterfaceChange(e.target.value)}
              disabled={loading}
              className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {loading ? "Chargement…" : "Sélectionner…"}
              </option>
              {interfaces.map((iface) => {
                const value =
                  typeof iface === "string"
                    ? iface
                    : (iface?.name ?? iface?.id ?? "");
                const label =
                  typeof iface === "string"
                    ? iface
                    : (iface?.name ?? iface?.description ?? value);
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onStart}
              disabled={loading || !selectedInterface || isCapturing}
            >
              Démarrer
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onStop}
              disabled={loading || !isCapturing}
            >
              Arrêter
            </Button>
          </div>

          <div className="flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                isCapturing ? "animate-pulse bg-emerald-500" : "bg-muted-foreground/40"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {isCapturing ? "Capture en cours" : "Arrêté"}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
    </header>
  );
}
