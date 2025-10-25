export type Role = "SuperAdmin" | "Admin" | "Supply" | "Department";

// Mapeo de roles a español
export const roleToSpanish: { [key in Role]: string } = {
  SuperAdmin: "Superadministrador",
  Admin: "Administrador",
  Supply: "Suministro",
  Department: "Departamento",
};

// Tabla usuarios (MySQL estructura actualizada)
export type User = {
  id: string; // varchar(50) en MySQL
  nombre: string;
  email: string;
  password: string;
  rol: Role;
  departamento: string;
  avatar: string | null;
  activo: boolean; // tinyint(1)
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
};

// Unidades disponibles para artículos
export type UnidadArticulo = 
  | "UNIDAD" 
  | "RESMA" 
  | "BLOCKS O TALONARIO" 
  | "PAQUETE" 
  | "GALÓN" 
  | "YARDA" 
  | "LIBRA" 
  | "CAJA";

// Tabla artículos (MySQL estructura actualizada)
export type Article = {
  id: number; // AUTO_INCREMENT en MySQL
  articulo: string; // Código del artículo (ej: ART-001)
  descripcion: string | null;
  existencia: number | null;
  cantidad_minima: number;
  unidad: UnidadArticulo;
  valor: number; // Precio unitario en RD$
  // Campos calculados (no en DB)
  valor_total?: number; // valor * existencia
};

// Tabla departamentos (MySQL estructura actualizada)
export type Departamento = {
  id: number; // AUTO_INCREMENT en MySQL
  codigo: string;
  departamento: string;
};

// Estados de las solicitudes (basado en estructura MySQL)
export type EstadoSolicitud = 
  | "En revisión"
  | "Pendiente" 
  | "Aprobada" 
  | "Rechazada"
  | "Gestionada"
  | "Despachada";

// Artículos y cantidades en solicitudes
// NOTA: En MySQL se almacena como "NOMBRE_ARTICULO = CANTIDAD"
export type ArticuloCantidad = {
  articulo_id: number; // ID para frontend
  cantidad: number;
  articulo_nombre?: string; // Nombre del artículo (usado en MySQL)
};

// Tabla solicitudes (MySQL estructura actualizada)
export type SolicitudDepartamento = {
  id: number; // AUTO_INCREMENT en MySQL
  numero_solicitud: number; // UNIQUE
  fecha: Date;
  departamento: string;
  articulos_cantidades: ArticuloCantidad[]; // Almacenado como TEXT en MySQL
  estado: EstadoSolicitud;
};

// Tabla autorizar_solicitudes (MySQL estructura actualizada)
export type AutorizacionSolicitud = {
  id: number; // AUTO_INCREMENT en MySQL
  numero_solicitud: number; // UNIQUE
  fecha: Date;
  departamento: string;
  articulos_cantidades: ArticuloCantidad[]; // Almacenado como TEXT en MySQL
  estado: EstadoSolicitud;
};

// Tabla solicitudes_aprobadas (MySQL estructura actualizada)
export type SolicitudAprobada = {
  id: number; // AUTO_INCREMENT en MySQL
  numero_solicitud: number; // UNIQUE
  fecha: Date;
  departamento: string;
  articulos_cantidades: ArticuloCantidad[]; // Almacenado como TEXT en MySQL
  estado: EstadoSolicitud;
};

// Tabla solicitudes_gestionadas (MySQL estructura actualizada)
export type SolicitudGestionada = {
  id: number; // AUTO_INCREMENT en MySQL
  numero_solicitud: number; // UNIQUE
  fecha: Date;
  departamento: string;
  articulos_cantidades: ArticuloCantidad[]; // Almacenado como TEXT en MySQL
  estado: EstadoSolicitud;
};

// Artículos, cantidades y unidades en entrada de mercancía
export type ArticuloEntrada = {
  articulo_id: number; // ID numérico del artículo
  cantidad: number;
  unidad: UnidadArticulo;
};

// Tabla entrada_mercancia (MySQL estructura actualizada)
export type EntradaMercancia = {
  id: number; // AUTO_INCREMENT en MySQL
  numero_entrada: string; // Formato: EM-2025-0001 (UNIQUE)
  numero_orden: string; // Formato: INDRHI-DAF-CD-2025-0001
  fecha: Date;
  suplidor: string;
  articulos_cantidades_unidades: ArticuloEntrada[]; // Almacenado como TEXT en MySQL
};

// Tabla solicitudes_despachadas (MySQL estructura actualizada)
export type SolicitudDespachada = {
  id: number; // AUTO_INCREMENT en MySQL
  numero_solicitud: number; // UNIQUE
  fecha: Date;
  departamento: string;
  articulos_cantidades: ArticuloCantidad[]; // Almacenado como TEXT en MySQL
  estado: EstadoSolicitud;
  despachado_por: string | null; // Nombre del usuario que despachó
};

// Tipos antiguos para compatibilidad con código existente
export type RequestStatus = "Pending" | "Approved" | "Rejected" | "Dispatched";

export type RequestItem = {
  articleId: string;
  quantity: number;
};

export type SupplyRequest = {
  id: string;
  userId: string;
  department: string;
  status: RequestStatus;
  items: RequestItem[];
  createdAt: Date;
  updatedAt: Date;
};
