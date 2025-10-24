/**
 * Formatea un número como moneda en Pesos Dominicanos (RD$)
 */
export function formatCurrency(amount: number): string {
  return `RD$ ${amount.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formatea una fecha en formato local español
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Formatea una fecha con hora en formato local español
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calcula el valor total de un artículo (valor * existencia)
 */
export function calculateValorTotal(valor: number, existencia: number): number {
  return valor * existencia;
}

/**
 * Obtiene el badge color para el estado de una solicitud
 */
export function getEstadoColor(estado: string): string {
  const estados: Record<string, string> = {
    "Pendiente": "bg-yellow-100 text-yellow-800",
    "En Autorización": "bg-blue-100 text-blue-800",
    "Aprobada": "bg-green-100 text-green-800",
    "Rechazada": "bg-red-100 text-red-800",
    "En Gestión": "bg-purple-100 text-purple-800",
    "Despachada": "bg-gray-100 text-gray-800",
  };
  return estados[estado] || "bg-gray-100 text-gray-800";
}

/**
 * Formatea el número de solicitud con ceros a la izquierda
 */
export function formatNumeroSolicitud(numero: number): string {
  return String(numero).padStart(4, "0");
}

