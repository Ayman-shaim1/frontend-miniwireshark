import { request } from "./http.js";

function buildParams(dateDebut, dateFin) {
  const params = new URLSearchParams();
  if (dateDebut?.trim()) params.set("dateDebut", dateDebut.trim());
  if (dateFin?.trim()) params.set("dateFin", dateFin.trim());
  return params.toString();
}

export const dashboardService = {
  async getTop5Sources(dateDebut, dateFin) {
    const q = buildParams(dateDebut, dateFin);
    const path = `/dashboard/top5-sources${q ? `?${q}` : ""}`;
    return request(path);
  },

  async getTop5Destinations(dateDebut, dateFin) {
    const q = buildParams(dateDebut, dateFin);
    const path = `/dashboard/top5-destinations${q ? `?${q}` : ""}`;
    return request(path);
  },

  async getProtocolDistribution(dateDebut, dateFin) {
    const q = buildParams(dateDebut, dateFin);
    const path = `/dashboard/protocol-distribution${q ? `?${q}` : ""}`;
    return request(path);
  },

  async getPacketsByDate(dateDebut, dateFin) {
    const q = buildParams(dateDebut, dateFin);
    const path = `/dashboard/packets-by-date${q ? `?${q}` : ""}`;
    return request(path);
  },
};

export default dashboardService;
