import { request } from "./http.js";

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
}

export const historyService = HistoryService.getInstance();
export default historyService;
