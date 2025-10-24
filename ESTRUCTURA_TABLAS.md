# Estructura de Tablas del Sistema Suministro INDRHI

Este documento describe todas las tablas integradas en el Sistema de Suministro del Instituto Nacional de Recursos Hidráulicos (INDRHI).

## 📋 Tablas Implementadas

### 1. **Tabla Usuarios** (`User`)
Gestión de usuarios del sistema con diferentes roles.

**Campos:**
- `id`: string - Identificador único
- `name`: string - Nombre completo
- `email`: string - Correo electrónico
- `role`: Role - Rol del usuario (SuperAdmin, Admin, Supply, Department)
- `department`: string - Departamento al que pertenece
- `avatar`: string - URL del avatar
- `password`: string - Contraseña encriptada

**Roles disponibles:**
- `SuperAdmin`: Control total del sistema
- `Admin`: Gestión administrativa
- `Supply`: Equipo de suministros
- `Department`: Usuario de departamento

---

### 2. **Tabla Artículos** (`Article`)
Inventario de artículos disponibles en el sistema.

**Campos:**
- `id`: string - Identificador único
- `codigo_articulo`: string - Código del artículo (ej: ART-001)
- `descripcion`: string - Descripción del artículo
- `existencia`: number - Cantidad actual en stock
- `cantidad_minima`: number - Cantidad mínima requerida
- `unidad`: UnidadArticulo - Unidad de medida
- `valor`: number - Precio unitario en RD$
- `valor_total`: number - valor × existencia

**Unidades disponibles:**
- UNIDAD
- RESMA
- BLOCKS O TALONARIO
- PAQUETE
- GALÓN
- YARDA
- LIBRA
- CAJA

**Cálculo automático:**
- `valor_total` = `valor` × `existencia`

---

### 3. **Tabla Departamentos** (`Departamento`)
Catálogo de departamentos de la organización.

**Campos:**
- `id`: string - Identificador único
- `codigo`: string - Código del departamento (ej: TEC, ADM)
- `departamento`: string - Nombre del departamento

**Departamentos por defecto:**
- TEC - Tecnología
- ADM - Administración
- RRHH - Recursos Humanos
- SUMIN - Suministros
- CONT - Contabilidad
- MKT - Mercadeo
- OPR - Operaciones

---

### 4. **Tabla Solicitudes Departamentos** (`SolicitudDepartamento`)
Solicitudes creadas por los departamentos.

**Campos:**
- `id`: string - Identificador único
- `numero_solicitud`: number - Número autoincrementable (inicia en 1001)
- `fecha`: Date - Fecha de creación
- `departamento`: string - Departamento solicitante
- `articulos_cantidades`: ArticuloCantidad[] - Artículos y cantidades solicitadas
- `estado`: EstadoSolicitud - Estado actual

**Características:**
- `numero_solicitud` es **autoincrementable** y **no editable**
- Inicia en 1001

---

### 5. **Tabla Autorización Solicitudes** (`AutorizacionSolicitud`)
Solicitudes en proceso de autorización.

**Campos:**
- `id`: string - Identificador único
- `numero_solicitud`: number - Número de la solicitud
- `fecha`: Date - Fecha de autorización
- `departamento`: string - Departamento solicitante
- `articulos_cantidades`: ArticuloCantidad[] - Artículos y cantidades
- `estado`: EstadoSolicitud - Estado (En Autorización)

---

### 6. **Tabla Solicitudes Aprobadas** (`SolicitudAprobada`)
Solicitudes que han sido aprobadas.

**Campos:**
- `id`: string - Identificador único
- `numero_solicitud`: number - Número de la solicitud
- `fecha`: Date - Fecha de aprobación
- `departamento`: string - Departamento solicitante
- `articulos_cantidades`: ArticuloCantidad[] - Artículos y cantidades
- `estado`: EstadoSolicitud - Estado (Aprobada)

---

### 7. **Tabla Solicitudes Gestionadas** (`SolicitudGestionada`)
Solicitudes en proceso de gestión.

**Campos:**
- `id`: string - Identificador único
- `numero_solicitud`: number - Número de la solicitud
- `fecha`: Date - Fecha de gestión
- `departamento`: string - Departamento solicitante
- `articulos_cantidades`: ArticuloCantidad[] - Artículos y cantidades
- `estado`: EstadoSolicitud - Estado (En Gestión)

---

### 8. **Tabla Entrada Mercancía** (`EntradaMercancia`)
Registro de entradas de nuevos artículos al inventario.

**Campos:**
- `id`: string - Identificador único
- `numero_entrada`: string - Formato: EM-2025-0001 (autoincrementable)
- `numero_orden`: string - Formato: INDRHI-DAF-CD-2025-0001
- `fecha`: Date - Fecha de entrada
- `suplidor`: string - Nombre del suplidor
- `articulos_cantidades`: ArticuloEntrada[] - Artículos y cantidades

**Características especiales:**
- `numero_entrada`: 
  - Formato: **EM-2025-0001**
  - **Autoincrementable** y **no editable**
  - Inicia en 0001
  
- `numero_orden`:
  - Formato: **INDRHI-DAF-CD-2025-0001**
  - Solo los últimos **4 dígitos son editables** manualmente
  - Prefijo fijo: INDRHI-DAF-CD-2025-

---

### 9. **Tabla Solicitudes Despachadas** (`SolicitudDespachada`)
Solicitudes que han sido completamente despachadas.

**Campos:**
- `id`: string - Identificador único
- `numero_solicitud`: number - Número de la solicitud
- `fecha`: Date - Fecha de despacho
- `departamento`: string - Departamento receptor
- `articulos_cantidades`: ArticuloCantidad[] - Artículos y cantidades despachadas
- `estado`: EstadoSolicitud - Estado (Despachada)
- `despachado_por`: string - Nombre del usuario que realizó el despacho

**Características:**
- `despachado_por` toma automáticamente el nombre del usuario del equipo de suministro que realiza el despacho

---

## 🔄 Estados de Solicitudes

Las solicitudes pueden tener los siguientes estados:

1. **Pendiente** - Solicitud creada, esperando revisión
2. **En Autorización** - Solicitud en proceso de autorización
3. **Aprobada** - Solicitud aprobada, lista para gestión
4. **Rechazada** - Solicitud rechazada
5. **En Gestión** - Solicitud siendo procesada por suministros
6. **Despachada** - Solicitud completada y entregada

---

## 💾 Sistema de Persistencia

Todas las tablas tienen persistencia en `localStorage` mediante el archivo `src/lib/storage.ts`:

### Funciones disponibles:

#### Artículos
- `getStoredArticles()` - Obtener todos los artículos
- `saveArticles(articles)` - Guardar artículos
- `updateArticle(id, updates)` - Actualizar un artículo
- `addArticle(article)` - Agregar un artículo
- `deleteArticle(id)` - Eliminar un artículo

#### Departamentos
- `getStoredDepartamentos()` - Obtener departamentos
- `saveDepartamentos(departamentos)` - Guardar departamentos
- `addDepartamento(departamento)` - Agregar departamento

#### Solicitudes
- `getStoredSolicitudesDepartamentos()` - Obtener solicitudes
- `saveSolicitudesDepartamentos(solicitudes)` - Guardar solicitudes
- `addSolicitudDepartamento(solicitud)` - Agregar solicitud
- `updateSolicitudDepartamento(id, updates)` - Actualizar solicitud

#### Entradas de Mercancía
- `getStoredEntradasMercancia()` - Obtener entradas
- `saveEntradasMercancia(entradas)` - Guardar entradas
- `addEntradaMercancia(entrada)` - Agregar entrada

#### Solicitudes Despachadas
- `getStoredSolicitudesDespachadas()` - Obtener despachadas
- `saveSolicitudesDespachadas(solicitudes)` - Guardar despachadas
- `addSolicitudDespachada(solicitud)` - Agregar despachada

### Utilidades
- `getNextNumeroSolicitud()` - Genera el próximo número de solicitud
- `getNextNumeroEntrada()` - Genera el próximo número de entrada (EM-2025-XXXX)
- `generateNumeroOrden(lastFourDigits)` - Genera número de orden con prefijo

---

## 🎨 Utilidades de Formato

Archivo `src/lib/format-utils.ts`:

- `formatCurrency(amount)` - Formatea en RD$ (ej: RD$ 1,250.00)
- `formatDate(date)` - Formatea fecha (ej: 21/10/2025)
- `formatDateTime(date)` - Formatea fecha y hora
- `calculateValorTotal(valor, existencia)` - Calcula valor total
- `getEstadoColor(estado)` - Retorna clases CSS para badges de estado
- `formatNumeroSolicitud(numero)` - Formatea con ceros (ej: 0001)

---

## 📊 Datos de Ejemplo

Cada tabla tiene datos de ejemplo precargados en `src/lib/data.ts`:

- 5 usuarios (1 SuperAdmin, 1 Admin, 1 Supply, 2 Department)
- 7 departamentos
- 10 artículos con precios en RD$
- 3 solicitudes de departamento en diferentes estados
- 3 entradas de mercancía de diferentes suplidores
- 3 solicitudes despachadas

---

## 🔐 Notas de Seguridad

- Todos los datos se almacenan en `localStorage` del navegador
- Los cambios persisten entre sesiones
- Al limpiar el `localStorage`, los datos vuelven a los valores iniciales
- Las contraseñas están en texto plano (solo para demo)

---

## 📝 Próximos Pasos

Este documento describe la estructura de datos. Los próximos pasos incluyen:

1. Crear interfaces de usuario para cada tabla
2. Implementar formularios de creación y edición
3. Crear vistas de listado con filtros
4. Implementar el flujo completo de estados de solicitudes
5. Agregar reportes y estadísticas

