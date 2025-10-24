import { UnidadArticulo, EstadoSolicitud } from "./types";

/**
 * Unidades disponibles para artículos
 */
export const UNIDADES_ARTICULO: UnidadArticulo[] = [
  "UNIDAD",
  "RESMA",
  "BLOCKS O TALONARIO",
  "PAQUETE",
  "GALÓN",
  "YARDA",
  "LIBRA",
  "CAJA",
];

/**
 * Estados disponibles para solicitudes
 */
export const ESTADOS_SOLICITUD: EstadoSolicitud[] = [
  "Pendiente",
  "En Autorización",
  "Aprobada",
  "Rechazada",
  "En Gestión",
  "Despachada",
];

/**
 * Prefijo por defecto para números de entrada de mercancía
 */
export const ENTRADA_MERCANCIA_PREFIX = "EM";

/**
 * Prefijo por defecto para números de orden
 */
export const NUMERO_ORDEN_PREFIX = "INDRHI-DAF-CD";

/**
 * Año actual para los formatos
 */
export const CURRENT_YEAR = new Date().getFullYear();

