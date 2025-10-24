import {
  Article,
  Departamento,
  SolicitudDepartamento,
  AutorizacionSolicitud,
  SolicitudAprobada,
  SolicitudGestionada,
  EntradaMercancia,
  SolicitudDespachada,
} from "./types";
import {
  articles as initialArticles,
  departamentos as initialDepartamentos,
  solicitudesDepartamentos as initialSolicitudesDepartamentos,
  autorizacionSolicitudes as initialAutorizacionSolicitudes,
  solicitudesAprobadas as initialSolicitudesAprobadas,
  solicitudesGestionadas as initialSolicitudesGestionadas,
  entradasMercancia as initialEntradasMercancia,
  solicitudesDespachadas as initialSolicitudesDespachadas,
} from "./data";

// Keys para localStorage
const STORAGE_KEYS = {
  ARTICLES: "indrhi_suministro_articles",
  DEPARTAMENTOS: "indrhi_suministro_departamentos",
  SOLICITUDES_DEPARTAMENTOS: "indrhi_suministro_solicitudes_departamentos",
  AUTORIZACION_SOLICITUDES: "indrhi_suministro_autorizacion_solicitudes",
  SOLICITUDES_APROBADAS: "indrhi_suministro_solicitudes_aprobadas",
  SOLICITUDES_GESTIONADAS: "indrhi_suministro_solicitudes_gestionadas",
  ENTRADAS_MERCANCIA: "indrhi_suministro_entradas_mercancia",
  SOLICITUDES_DESPACHADAS: "indrhi_suministro_solicitudes_despachadas",
};

// ==================== ARTÍCULOS ====================

export function getStoredArticles(): Article[] {
  if (typeof window === "undefined") {
    return initialArticles;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.ARTICLES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error al leer artículos de localStorage:", error);
  }

  saveArticles(initialArticles);
  return initialArticles;
}

export function saveArticles(articles: Article[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  } catch (error) {
    console.error("Error al guardar artículos en localStorage:", error);
  }
}

export function updateArticle(id: string, updates: Partial<Article>): Article[] {
  const articles = getStoredArticles();
  const updatedArticles = articles.map((a) =>
    a.id === id ? { ...a, ...updates } : a
  );
  saveArticles(updatedArticles);
  return updatedArticles;
}

export function addArticle(article: Article): Article[] {
  const articles = getStoredArticles();
  const updatedArticles = [article, ...articles];
  saveArticles(updatedArticles);
  return updatedArticles;
}

export function deleteArticle(id: string): Article[] {
  const articles = getStoredArticles();
  const updatedArticles = articles.filter((a) => a.id !== id);
  saveArticles(updatedArticles);
  return updatedArticles;
}

// ==================== DEPARTAMENTOS ====================

export function getStoredDepartamentos(): Departamento[] {
  if (typeof window === "undefined") {
    return initialDepartamentos;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.DEPARTAMENTOS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error al leer departamentos de localStorage:", error);
  }

  saveDepartamentos(initialDepartamentos);
  return initialDepartamentos;
}

export function saveDepartamentos(departamentos: Departamento[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEYS.DEPARTAMENTOS, JSON.stringify(departamentos));
  } catch (error) {
    console.error("Error al guardar departamentos en localStorage:", error);
  }
}

export function addDepartamento(departamento: Departamento): Departamento[] {
  const departamentos = getStoredDepartamentos();
  const updated = [departamento, ...departamentos];
  saveDepartamentos(updated);
  return updated;
}

export function updateDepartamento(id: string, updates: Partial<Departamento>): Departamento[] {
  const departamentos = getStoredDepartamentos();
  const updated = departamentos.map((d) => (d.id === id ? { ...d, ...updates } : d));
  saveDepartamentos(updated);
  return updated;
}

export function deleteDepartamento(id: string): Departamento[] {
  const departamentos = getStoredDepartamentos();
  const updated = departamentos.filter((d) => d.id !== id);
  saveDepartamentos(updated);
  return updated;
}

// ==================== SOLICITUDES DEPARTAMENTOS ====================

export function getStoredSolicitudesDepartamentos(): SolicitudDepartamento[] {
  if (typeof window === "undefined") {
    return initialSolicitudesDepartamentos;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.SOLICITUDES_DEPARTAMENTOS);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convertir strings de fecha a objetos Date
      return parsed.map((s: any) => ({
        ...s,
        fecha: new Date(s.fecha),
      }));
    }
  } catch (error) {
    console.error("Error al leer solicitudes departamentos de localStorage:", error);
  }

  saveSolicitudesDepartamentos(initialSolicitudesDepartamentos);
  return initialSolicitudesDepartamentos;
}

export function saveSolicitudesDepartamentos(solicitudes: SolicitudDepartamento[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEYS.SOLICITUDES_DEPARTAMENTOS, JSON.stringify(solicitudes));
  } catch (error) {
    console.error("Error al guardar solicitudes departamentos en localStorage:", error);
  }
}

export function addSolicitudDepartamento(solicitud: SolicitudDepartamento): SolicitudDepartamento[] {
  const solicitudes = getStoredSolicitudesDepartamentos();
  const updated = [solicitud, ...solicitudes];
  saveSolicitudesDepartamentos(updated);
  return updated;
}

export function updateSolicitudDepartamento(id: string, updates: Partial<SolicitudDepartamento>): SolicitudDepartamento[] {
  const solicitudes = getStoredSolicitudesDepartamentos();
  const updated = solicitudes.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveSolicitudesDepartamentos(updated);
  return updated;
}

export function deleteSolicitudDepartamento(id: string): SolicitudDepartamento[] {
  const solicitudes = getStoredSolicitudesDepartamentos();
  const updated = solicitudes.filter((s) => s.id !== id);
  saveSolicitudesDepartamentos(updated);
  return updated;
}

// ==================== AUTORIZACION SOLICITUDES ====================

export function getStoredAutorizacionSolicitudes(): AutorizacionSolicitud[] {
  if (typeof window === "undefined") {
    return initialAutorizacionSolicitudes;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.AUTORIZACION_SOLICITUDES);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({
        ...s,
        fecha: new Date(s.fecha),
      }));
    }
  } catch (error) {
    console.error("Error al leer autorizaciones de localStorage:", error);
  }

  saveAutorizacionSolicitudes(initialAutorizacionSolicitudes);
  return initialAutorizacionSolicitudes;
}

export function saveAutorizacionSolicitudes(solicitudes: AutorizacionSolicitud[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEYS.AUTORIZACION_SOLICITUDES, JSON.stringify(solicitudes));
  } catch (error) {
    console.error("Error al guardar autorizaciones en localStorage:", error);
  }
}

export function addAutorizacionSolicitud(solicitud: AutorizacionSolicitud): AutorizacionSolicitud[] {
  const solicitudes = getStoredAutorizacionSolicitudes();
  const updated = [solicitud, ...solicitudes];
  saveAutorizacionSolicitudes(updated);
  return updated;
}

export function deleteAutorizacionSolicitud(id: string): AutorizacionSolicitud[] {
  const solicitudes = getStoredAutorizacionSolicitudes();
  const updated = solicitudes.filter((s) => s.id !== id);
  saveAutorizacionSolicitudes(updated);
  return updated;
}

// ==================== SOLICITUDES APROBADAS ====================

export function getStoredSolicitudesAprobadas(): SolicitudAprobada[] {
  if (typeof window === "undefined") {
    return initialSolicitudesAprobadas;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.SOLICITUDES_APROBADAS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({
        ...s,
        fecha: new Date(s.fecha),
      }));
    }
  } catch (error) {
    console.error("Error al leer solicitudes aprobadas de localStorage:", error);
  }

  saveSolicitudesAprobadas(initialSolicitudesAprobadas);
  return initialSolicitudesAprobadas;
}

export function saveSolicitudesAprobadas(solicitudes: SolicitudAprobada[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEYS.SOLICITUDES_APROBADAS, JSON.stringify(solicitudes));
  } catch (error) {
    console.error("Error al guardar solicitudes aprobadas en localStorage:", error);
  }
}

export function addSolicitudAprobada(solicitud: SolicitudAprobada): SolicitudAprobada[] {
  const solicitudes = getStoredSolicitudesAprobadas();
  const updated = [solicitud, ...solicitudes];
  saveSolicitudesAprobadas(updated);
  return updated;
}

export function deleteSolicitudAprobada(id: string): SolicitudAprobada[] {
  const solicitudes = getStoredSolicitudesAprobadas();
  const updated = solicitudes.filter((s) => s.id !== id);
  saveSolicitudesAprobadas(updated);
  return updated;
}

// ==================== SOLICITUDES GESTIONADAS ====================

export function getStoredSolicitudesGestionadas(): SolicitudGestionada[] {
  if (typeof window === "undefined") {
    return initialSolicitudesGestionadas;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.SOLICITUDES_GESTIONADAS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({
        ...s,
        fecha: new Date(s.fecha),
      }));
    }
  } catch (error) {
    console.error("Error al leer solicitudes gestionadas de localStorage:", error);
  }

  saveSolicitudesGestionadas(initialSolicitudesGestionadas);
  return initialSolicitudesGestionadas;
}

export function saveSolicitudesGestionadas(solicitudes: SolicitudGestionada[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEYS.SOLICITUDES_GESTIONADAS, JSON.stringify(solicitudes));
  } catch (error) {
    console.error("Error al guardar solicitudes gestionadas en localStorage:", error);
  }
}

export function addSolicitudGestionada(solicitud: SolicitudGestionada): SolicitudGestionada[] {
  const solicitudes = getStoredSolicitudesGestionadas();
  const updated = [solicitud, ...solicitudes];
  saveSolicitudesGestionadas(updated);
  return updated;
}

export function deleteSolicitudGestionada(id: string): SolicitudGestionada[] {
  const solicitudes = getStoredSolicitudesGestionadas();
  const updated = solicitudes.filter((s) => s.id !== id);
  saveSolicitudesGestionadas(updated);
  return updated;
}

// ==================== ENTRADAS MERCANCÍA ====================

export function getStoredEntradasMercancia(): EntradaMercancia[] {
  if (typeof window === "undefined") {
    return initialEntradasMercancia;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.ENTRADAS_MERCANCIA);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((e: any) => ({
        ...e,
        fecha: new Date(e.fecha),
      }));
    }
  } catch (error) {
    console.error("Error al leer entradas mercancía de localStorage:", error);
  }

  saveEntradasMercancia(initialEntradasMercancia);
  return initialEntradasMercancia;
}

export function saveEntradasMercancia(entradas: EntradaMercancia[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEYS.ENTRADAS_MERCANCIA, JSON.stringify(entradas));
  } catch (error) {
    console.error("Error al guardar entradas mercancía en localStorage:", error);
  }
}

export function addEntradaMercancia(entrada: EntradaMercancia): EntradaMercancia[] {
  const entradas = getStoredEntradasMercancia();
  const updated = [entrada, ...entradas];
  saveEntradasMercancia(updated);
  return updated;
}

// ==================== SOLICITUDES DESPACHADAS ====================

export function getStoredSolicitudesDespachadas(): SolicitudDespachada[] {
  if (typeof window === "undefined") {
    return initialSolicitudesDespachadas;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.SOLICITUDES_DESPACHADAS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({
        ...s,
        fecha: new Date(s.fecha),
      }));
    }
  } catch (error) {
    console.error("Error al leer solicitudes despachadas de localStorage:", error);
  }

  saveSolicitudesDespachadas(initialSolicitudesDespachadas);
  return initialSolicitudesDespachadas;
}

export function saveSolicitudesDespachadas(solicitudes: SolicitudDespachada[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEYS.SOLICITUDES_DESPACHADAS, JSON.stringify(solicitudes));
  } catch (error) {
    console.error("Error al guardar solicitudes despachadas en localStorage:", error);
  }
}

export function addSolicitudDespachada(solicitud: SolicitudDespachada): SolicitudDespachada[] {
  const solicitudes = getStoredSolicitudesDespachadas();
  const updated = [solicitud, ...solicitudes];
  saveSolicitudesDespachadas(updated);
  return updated;
}

// ==================== UTILIDADES ====================

/**
 * Genera el próximo número de solicitud basado en las existentes
 */
export function getNextNumeroSolicitud(): number {
  const solicitudes = getStoredSolicitudesDepartamentos();
  if (solicitudes.length === 0) {
    return 1;
  }
  const maxNumero = Math.max(...solicitudes.map((s) => s.numero_solicitud));
  return maxNumero + 1;
}

/**
 * Genera el próximo número de entrada de mercancía
 */
export function getNextNumeroEntrada(): string {
  const currentYear = new Date().getFullYear();
  const entradas = getStoredEntradasMercancia();
  
  // Filtrar solo las entradas del año actual
  const entradasDelAno = entradas.filter(e => 
    e.numero_entrada.includes(`-${currentYear}-`)
  );
  
  if (entradasDelAno.length === 0) {
    return `EM-${currentYear}-0001`;
  }

  const numeros = entradasDelAno
    .map((e) => {
      const match = e.numero_entrada.match(/EM-\d{4}-(\d{4})/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
  const nextNumero = maxNumero + 1;

  return `EM-${currentYear}-${String(nextNumero).padStart(4, "0")}`;
}

/**
 * Genera el formato de número de orden con solo los últimos 4 dígitos editables
 */
export function generateNumeroOrden(lastFourDigits: string): string {
  const currentYear = new Date().getFullYear();
  return `INDRHI-DAF-CD-${currentYear}-${lastFourDigits}`;
}

// ==================== LIMPIEZA DE DATOS ====================

/**
 * Limpia todos los datos del sistema excepto usuarios
 * Útil para reimportar datos desde CSV
 */
export function clearAllData(): void {
  if (typeof window === "undefined") return;

  try {
    // Limpiar artículos
    window.localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    
    // Limpiar departamentos
    window.localStorage.removeItem(STORAGE_KEYS.DEPARTAMENTOS);
    
    // Limpiar todas las solicitudes y gestiones
    window.localStorage.removeItem(STORAGE_KEYS.SOLICITUDES_DEPARTAMENTOS);
    window.localStorage.removeItem(STORAGE_KEYS.AUTORIZACION_SOLICITUDES);
    window.localStorage.removeItem(STORAGE_KEYS.SOLICITUDES_APROBADAS);
    window.localStorage.removeItem(STORAGE_KEYS.SOLICITUDES_GESTIONADAS);
    window.localStorage.removeItem(STORAGE_KEYS.SOLICITUDES_DESPACHADAS);
    
    // Limpiar entradas de mercancía
    window.localStorage.removeItem(STORAGE_KEYS.ENTRADAS_MERCANCIA);
    
    console.log("Todos los datos han sido limpiados exitosamente");
  } catch (error) {
    console.error("Error al limpiar datos:", error);
  }
}

/**
 * Limpia solo los artículos
 */
export function clearArticles(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.ARTICLES);
}

/**
 * Limpia solo los departamentos
 */
export function clearDepartamentos(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.DEPARTAMENTOS);
}

