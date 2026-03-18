import { request, API_BASE } from "./http.js";

class HistoryService {
  static #instance = null;

  static getInstance() {
    if (HistoryService.#instance === null) {
      HistoryService.#instance = new HistoryService();
    }
    return HistoryService.#instance;
  }

  /** Historique des paquets capturés (paginé, avec filtres) */
  async getHistory({
    page = 0,
    size = 100,
    dateDebut,
    dateFin,
    source,
    destination,
    protocol,
    length,
    info,
  } = {}) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));
    if (dateDebut?.trim()) params.set("dateDebut", dateDebut.trim());
    if (dateFin?.trim()) params.set("dateFin", dateFin.trim());
    if (source?.trim()) params.set("source", source.trim());
    if (destination?.trim()) params.set("destination", destination.trim());
    if (protocol?.trim()) params.set("protocol", protocol.trim());
    if (length != null && length !== "") params.set("length", String(length));
    if (info?.trim()) params.set("info", info.trim());
    return request(`/history?${params}`);
  }

  /** Exporte l'historique en JSON ou CSV avec les filtres appliqués. Retourne un Blob. */
  async exportHistory(format, filters = {}) {
    const params = new URLSearchParams();
    params.set("format", format === "csv" ? "csv" : "json");
    if (filters.dateDebut?.trim()) params.set("dateDebut", filters.dateDebut.trim());
    if (filters.dateFin?.trim()) params.set("dateFin", filters.dateFin.trim());
    if (filters.source?.trim()) params.set("source", filters.source.trim());
    if (filters.destination?.trim()) params.set("destination", filters.destination.trim());
    if (filters.protocol?.trim()) params.set("protocol", filters.protocol.trim());
    if (filters.length != null && filters.length !== "") params.set("length", String(filters.length));
    if (filters.info?.trim()) params.set("info", filters.info.trim());

    const url = `${API_BASE}/history/export?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Export échoué: ${res.status}`);
    return res.blob();
  }
}

export const historyService = HistoryService.getInstance();
export default historyService;
