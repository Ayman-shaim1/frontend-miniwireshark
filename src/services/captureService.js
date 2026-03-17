import { request } from './http.js';

class CaptureService {
  static #instance = null;

  static getInstance() {
    if (CaptureService.#instance === null) {
      CaptureService.#instance = new CaptureService();
    }
    return CaptureService.#instance;
  }

  /** Retourne la liste des interfaces réseau disponibles */
  async getInterfaces() {
    return request('/capture/interfaces');
  }

  /** Indique si la capture est en cours */
  async getStatus() {
    return request('/capture/status');
  }

  /** Démarre la capture sur l'interface spécifiée */
  async startCapture(interfaceName) {
    return request('/capture/start', {
      method: 'POST',
      body: JSON.stringify({ interface: interfaceName }),
    });
  }

  /** Arrête la capture */
  async stopCapture() {
    return request('/capture/stop', {
      method: 'POST',
    });
  }

  /** Récupère la liste des paquets capturés */
  async getPackets() {
    return request('/capture/packets');
  }
}

export const captureService = CaptureService.getInstance();
export default captureService;
