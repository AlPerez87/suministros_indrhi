export type Role = "SuperAdmin" | "Admin" | "Supply" | "Department";

// Mapeo de roles a español
export const roleToSpanish: { [key in Role]: string } = {
  SuperAdmin: "Superadministrador",
  Admin: "Administrador",
  Supply: "Suministro",
  Department: "Departamento",
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar: string;
  password: string;
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

// Tabla artículos
export type Article = {
  id: string;
  codigo_articulo: string;
  descripcion: string;
  existencia: number;
  cantidad_minima: number;
  unidad: UnidadArticulo;
  valor: number; // Precio unitario en RD$
  valor_total: number; // valor * existencia
  // Campos antiguos para compatibilidad
  name: string;
  quantityInStock: number;
  category: string;
};

// Tabla departamentos
export type Departamento = {
  id: string;
  codigo: string;
  departamento: string;
};

// Estados de las solicitudes
export type EstadoSolicitud = 
  | "Pendiente" 
  | "En Autorización" 
  | "Aprobada" 
  | "Rechazada"
  | "En Gestión"
  | "Despachada";

// Artículos y cantidades en solicitudes
export type ArticuloCantidad = {
  articulo_id: string;
  cantidad: number;
};

// Tabla solicitudes_departamentos
export type SolicitudDepartamento = {
  id: string;
  numero_solicitud: number; // Autoincrementable
  fecha: Date;
  departamento: string;
  articulos_cantidades: ArticuloCantidad[];
  estado: EstadoSolicitud;
  creado_por?: string; // ID del usuario que creó la solicitud
};

// Tabla autorizacion_solicitudes
export type AutorizacionSolicitud = {
  id: string;
  numero_solicitud: number;
  fecha: Date;
  departamento: string;
  articulos_cantidades: ArticuloCantidad[];
  estado: EstadoSolicitud;
};

// Tabla solicitudes_aprobadas
export type SolicitudAprobada = {
  id: string;
  numero_solicitud: number;
  fecha: Date;
  departamento: string;
  articulos_cantidades: ArticuloCantidad[];
  estado: EstadoSolicitud;
};

// Tabla solicitudes_gestionadas
export type SolicitudGestionada = {
  id: string;
  numero_solicitud: number;
  fecha: Date;
  departamento: string;
  articulos_cantidades: ArticuloCantidad[];
  estado: EstadoSolicitud;
};

// Artículos y cantidades en entrada de mercancía
export type ArticuloEntrada = {
  articulo_id: string;
  cantidad: number;
};

// Tabla entrada_mercancia
export type EntradaMercancia = {
  id: string;
  numero_entrada: string; // Formato: EM-2025-0001 (autoincrementable)
  numero_orden: string; // Formato: INDRHI-DAF-CD-2025-0001
  fecha: Date;
  suplidor: string;
  articulos_cantidades: ArticuloEntrada[];
};

// Tabla solicitudes_despachadas
export type SolicitudDespachada = {
  id: string;
  numero_solicitud: number;
  fecha: Date;
  departamento: string;
  articulos_cantidades: ArticuloCantidad[];
  estado: EstadoSolicitud;
  despachado_por: string; // Nombre del usuario que despachó
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
