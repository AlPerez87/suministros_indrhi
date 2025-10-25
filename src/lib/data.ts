import { 
  User, 
  Role, 
  Article, 
  SupplyRequest, 
  RequestStatus,
  Departamento,
  SolicitudDepartamento,
  AutorizacionSolicitud,
  SolicitudAprobada,
  SolicitudGestionada,
  EntradaMercancia,
  SolicitudDespachada
} from "./types";

export { Role } from "./types";

export const users: User[] = [
  {
    id: "user-1",
    name: "Sarah Connor",
    email: "sarah.c@example.com",
    role: "SuperAdmin",
    department: "Tecnología",
    avatar: "https://picsum.photos/seed/user1/100/100",
    password: "1234",
  },
  {
    id: "user-2",
    name: "John Doe",
    email: "john.d@example.com",
    role: "Admin",
    department: "Administración",
    avatar: "https://picsum.photos/seed/user2/100/100",
    password: "admin456",
  },
  {
    id: "user-3",
    name: "Jane Smith",
    email: "jane.s@example.com",
    role: "Department",
    department: "Recursos Humanos",
    avatar: "https://picsum.photos/seed/user3/100/100",
    password: "user123",
  },
  {
    id: "user-4",
    name: "Mike Johnson",
    email: "mike.j@example.com",
    role: "Supply",
    department: "Suministros",
    avatar: "https://picsum.photos/seed/user4/100/100",
    password: "supply123",
  },
  {
    id: "user-5",
    name: "Emily Davis",
    email: "emily.d@example.com",
    role: "Department",
    department: "Contabilidad",
    avatar: "https://picsum.photos/seed/user5/100/100",
    password: "user456",
  },
];

// Tabla Departamentos
export const departamentos: Departamento[] = [
  { id: "dept-1", codigo: "TEC", departamento: "Tecnología" },
  { id: "dept-2", codigo: "ADM", departamento: "Administración" },
  { id: "dept-3", codigo: "RRHH", departamento: "Recursos Humanos" },
  { id: "dept-4", codigo: "SUMIN", departamento: "Suministros" },
  { id: "dept-5", codigo: "CONT", departamento: "Contabilidad" },
  { id: "dept-6", codigo: "MKT", departamento: "Mercadeo" },
  { id: "dept-7", codigo: "OPR", departamento: "Operaciones" },
];

// Tabla Artículos (con campos nuevos y antiguos para compatibilidad)
export const articles: Article[] = [
  { 
    id: "art-1", 
    articulo: "ART-001",
    descripcion: "Papel Bond Tamaño Carta",
    existencia: 150,
    cantidad_minima: 20,
    unidad: "RESMA",
    valor: 350.00,
    valor_total: 52500.00,
    // Campos antiguos
    name: "Papel Bond Tamaño Carta", 
    quantityInStock: 150, 
    category: "Papelería" 
  },
  { 
    id: "art-2", 
    articulo: "ART-002",
    descripcion: "Bolígrafos Azules Caja x50",
    existencia: 80,
    cantidad_minima: 15,
    unidad: "CAJA",
    valor: 450.00,
    valor_total: 36000.00,
    name: "Bolígrafos Azules Caja x50", 
    quantityInStock: 80, 
    category: "Escritura" 
  },
  { 
    id: "art-3", 
    articulo: "ART-003",
    descripcion: "Engrapadoras Metálicas",
    existencia: 45,
    cantidad_minima: 10,
    unidad: "UNIDAD",
    valor: 280.00,
    valor_total: 12600.00,
    name: "Engrapadoras Metálicas", 
    quantityInStock: 45, 
    category: "Oficina" 
  },
  { 
    id: "art-4", 
    articulo: "ART-004",
    descripcion: "Grapas Caja x5000",
    existencia: 120,
    cantidad_minima: 25,
    unidad: "CAJA",
    valor: 95.00,
    valor_total: 11400.00,
    name: "Grapas Caja x5000", 
    quantityInStock: 120, 
    category: "Oficina" 
  },
  { 
    id: "art-5", 
    articulo: "ART-005",
    descripcion: "Libretas Empastadas 100 Hojas",
    existencia: 200,
    cantidad_minima: 30,
    unidad: "UNIDAD",
    valor: 125.00,
    valor_total: 25000.00,
    name: "Libretas Empastadas 100 Hojas", 
    quantityInStock: 200, 
    category: "Papelería" 
  },
  { 
    id: "art-6", 
    articulo: "ART-006",
    descripcion: "Tóner HP LaserJet Negro",
    existencia: 25,
    cantidad_minima: 5,
    unidad: "UNIDAD",
    valor: 3850.00,
    valor_total: 96250.00,
    name: "Tóner HP LaserJet Negro", 
    quantityInStock: 25, 
    category: "Impresión" 
  },
  { 
    id: "art-7", 
    articulo: "ART-007",
    descripcion: "Marcadores para Pizarra Pack x4",
    existencia: 65,
    cantidad_minima: 12,
    unidad: "PAQUETE",
    valor: 320.00,
    valor_total: 20800.00,
    name: "Marcadores para Pizarra Pack x4", 
    quantityInStock: 65, 
    category: "Reuniones" 
  },
  { 
    id: "art-8", 
    articulo: "ART-008",
    descripcion: "Carpetas de Archivo Tamaño Oficio",
    existencia: 180,
    cantidad_minima: 40,
    unidad: "UNIDAD",
    valor: 45.00,
    valor_total: 8100.00,
    name: "Carpetas de Archivo Tamaño Oficio", 
    quantityInStock: 180, 
    category: "Archivo" 
  },
  { 
    id: "art-9", 
    articulo: "ART-009",
    descripcion: "Clips Metálicos Caja x100",
    existencia: 90,
    cantidad_minima: 20,
    unidad: "CAJA",
    valor: 55.00,
    valor_total: 4950.00,
    name: "Clips Metálicos Caja x100", 
    quantityInStock: 90, 
    category: "Oficina" 
  },
  { 
    id: "art-10", 
    articulo: "ART-010",
    descripcion: "Alcohol en Gel 1 Galón",
    existencia: 40,
    cantidad_minima: 8,
    unidad: "GALÓN",
    valor: 890.00,
    valor_total: 35600.00,
    name: "Alcohol en Gel 1 Galón", 
    quantityInStock: 40, 
    category: "Limpieza" 
  },
];

// Tabla Solicitudes Departamentos
export const solicitudesDepartamentos: SolicitudDepartamento[] = [
  {
    id: "sol-dept-1",
    numero_solicitud: 1001,
    fecha: new Date("2025-01-15T09:30:00Z"),
    departamento: "Recursos Humanos",
    articulos_cantidades: [
      { articulo_id: "art-1", cantidad: 10 },
      { articulo_id: "art-2", cantidad: 5 },
      { articulo_id: "art-5", cantidad: 15 },
    ],
    estado: "Pendiente",
    creado_por: "user-3", // Jane Smith - Department - Recursos Humanos
  },
  {
    id: "sol-dept-2",
    numero_solicitud: 1002,
    fecha: new Date("2025-01-16T10:15:00Z"),
    departamento: "Contabilidad",
    articulos_cantidades: [
      { articulo_id: "art-3", cantidad: 3 },
      { articulo_id: "art-4", cantidad: 10 },
    ],
    estado: "En Autorización",
    creado_por: "user-5", // Emily Davis - Department - Contabilidad
  },
  {
    id: "sol-dept-3",
    numero_solicitud: 1003,
    fecha: new Date("2025-01-17T14:20:00Z"),
    departamento: "Tecnología",
    articulos_cantidades: [
      { articulo_id: "art-6", cantidad: 2 },
      { articulo_id: "art-7", cantidad: 8 },
    ],
    estado: "Aprobada",
    creado_por: "user-1", // Sarah Connor - SuperAdmin - Tecnología
  },
];

// Tabla Autorización Solicitudes
export const autorizacionSolicitudes: AutorizacionSolicitud[] = [
  {
    id: "aut-sol-1",
    numero_solicitud: 1002,
    fecha: new Date("2025-01-16T10:15:00Z"),
    departamento: "Contabilidad",
    articulos_cantidades: [
      { articulo_id: "art-3", cantidad: 3 },
      { articulo_id: "art-4", cantidad: 10 },
    ],
    estado: "En Autorización",
  },
];

// Tabla Solicitudes Aprobadas
export const solicitudesAprobadas: SolicitudAprobada[] = [
  {
    id: "sol-apr-1",
    numero_solicitud: 1003,
    fecha: new Date("2025-01-17T14:20:00Z"),
    departamento: "Tecnología",
    articulos_cantidades: [
      { articulo_id: "art-6", cantidad: 2 },
      { articulo_id: "art-7", cantidad: 8 },
    ],
    estado: "Aprobada",
  },
];

// Tabla Solicitudes Gestionadas
export const solicitudesGestionadas: SolicitudGestionada[] = [
  {
    id: "sol-ges-1",
    numero_solicitud: 998,
    fecha: new Date("2025-01-10T11:00:00Z"),
    departamento: "Mercadeo",
    articulos_cantidades: [
      { articulo_id: "art-1", cantidad: 20 },
      { articulo_id: "art-7", cantidad: 10 },
    ],
    estado: "En Gestión",
  },
  {
    id: "sol-ges-2",
    numero_solicitud: 999,
    fecha: new Date("2025-01-12T15:30:00Z"),
    departamento: "Operaciones",
    articulos_cantidades: [
      { articulo_id: "art-8", cantidad: 30 },
      { articulo_id: "art-9", cantidad: 15 },
    ],
    estado: "En Gestión",
  },
];

// Tabla Entrada Mercancía
export const entradasMercancia: EntradaMercancia[] = [
  {
    id: "em-1",
    numero_entrada: "EM-2025-0001",
    numero_orden: "INDRHI-DAF-CD-2025-0001",
    fecha: new Date("2025-01-05T08:00:00Z"),
    suplidor: "Distribuidora Nacional de Suministros",
    articulos_cantidades: [
      { articulo_id: "art-1", cantidad: 50 },
      { articulo_id: "art-2", cantidad: 30 },
      { articulo_id: "art-5", cantidad: 100 },
    ],
  },
  {
    id: "em-2",
    numero_entrada: "EM-2025-0002",
    numero_orden: "INDRHI-DAF-CD-2025-0002",
    fecha: new Date("2025-01-12T09:30:00Z"),
    suplidor: "Papelería Central S.A.",
    articulos_cantidades: [
      { articulo_id: "art-3", cantidad: 25 },
      { articulo_id: "art-4", cantidad: 50 },
      { articulo_id: "art-8", cantidad: 80 },
    ],
  },
  {
    id: "em-3",
    numero_entrada: "EM-2025-0003",
    numero_orden: "INDRHI-DAF-CD-2025-0003",
    fecha: new Date("2025-01-18T10:00:00Z"),
    suplidor: "Tecnología y Oficina RD",
    articulos_cantidades: [
      { articulo_id: "art-6", cantidad: 10 },
      { articulo_id: "art-7", cantidad: 20 },
    ],
  },
];

// Tabla Solicitudes Despachadas
export const solicitudesDespachadas: SolicitudDespachada[] = [
  {
    id: "sol-desp-1",
    numero_solicitud: 995,
    fecha: new Date("2025-01-08T14:00:00Z"),
    departamento: "Administración",
    articulos_cantidades: [
      { articulo_id: "art-1", cantidad: 15 },
      { articulo_id: "art-3", cantidad: 5 },
    ],
    estado: "Despachada",
    despachado_por: "Mike Johnson",
  },
  {
    id: "sol-desp-2",
    numero_solicitud: 996,
    fecha: new Date("2025-01-11T16:30:00Z"),
    departamento: "Recursos Humanos",
    articulos_cantidades: [
      { articulo_id: "art-2", cantidad: 8 },
      { articulo_id: "art-5", cantidad: 20 },
      { articulo_id: "art-9", cantidad: 10 },
    ],
    estado: "Despachada",
    despachado_por: "Mike Johnson",
  },
  {
    id: "sol-desp-3",
    numero_solicitud: 997,
    fecha: new Date("2025-01-14T13:45:00Z"),
    departamento: "Contabilidad",
    articulos_cantidades: [
      { articulo_id: "art-4", cantidad: 15 },
      { articulo_id: "art-8", cantidad: 25 },
    ],
    estado: "Despachada",
    despachado_por: "Mike Johnson",
  },
];

// Mantener compatibilidad con el código existente
export const supplyRequests: SupplyRequest[] = [
  {
    id: "req-1",
    userId: "user-3",
    department: "Recursos Humanos",
    status: "Pending",
    items: [
      { articleId: "art-1", quantity: 5 },
      { articleId: "art-2", quantity: 2 },
    ],
    createdAt: new Date("2025-01-01T10:00:00Z"),
    updatedAt: new Date("2025-01-01T10:00:00Z"),
  },
  {
    id: "req-2",
    userId: "user-5",
    department: "Contabilidad",
    status: "Approved",
    items: [{ articleId: "art-3", quantity: 3 }],
    createdAt: new Date("2025-01-02T11:30:00Z"),
    updatedAt: new Date("2025-01-02T14:00:00Z"),
  },
  {
    id: "req-3",
    userId: "user-3",
    department: "Recursos Humanos",
    status: "Rejected",
    items: [{ articleId: "art-6", quantity: 10 }],
    createdAt: new Date("2025-01-03T09:00:00Z"),
    updatedAt: new Date("2025-01-03T12:00:00Z"),
  },
  {
    id: "req-4",
    userId: "user-5",
    department: "Contabilidad",
    status: "Dispatched",
    items: [
        { articleId: "art-5", quantity: 10 },
        { articleId: "art-7", quantity: 2 },
    ],
    createdAt: new Date("2024-12-28T15:00:00Z"),
    updatedAt: new Date("2024-12-29T16:00:00Z"),
  },
];
