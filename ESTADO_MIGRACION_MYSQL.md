# Estado Actual de la Migración a MySQL

## ✅ COMPLETADO

### 1. Configuración Base
- ✅ **`src/lib/db-config.ts`** - Configuración de prefijos y funciones de conversión
  - Prefijo: `sum_`
  - `parseArticulosCantidades()` - Convierte `"NOMBRE = CANTIDAD<br>NOMBRE = CANTIDAD"` a array
  - `serializeArticulosCantidades()` - Convierte array a formato texto
  - Mapeo automático de nombres de artículos a IDs

### 2. Tipos TypeScript Actualizados
- ✅ **`src/lib/types.ts`**
  - `User`: id es `string` (varchar50), tiene campos `fecha_creacion`, `fecha_actualizacion`
  - `Article`: id es `number`, campo `articulo` (no `codigo_articulo`)
  - `Departamento`: id es `number`
  - `ArticuloCantidad`: incluye `articulo_nombre` para el mapeo
  - Todas las solicitudes: id es `number` (AUTO_INCREMENT)
  - Estados en español

### 3. APIs Creadas/Actualizadas

#### ✅ **`src/app/api/articulos/route.ts`**
- GET: Obtiene todos, calcula `valor_total`
- POST: Crea nuevo artículo
- PUT: Actualiza artículo
- DELETE: Elimina permanentemente
- Usa `sum_articulos`

#### ✅ **`src/app/api/departamentos/route.ts`**
- GET, POST, PUT, DELETE
- Usa `sum_departamentos`

#### ✅ **`src/app/api/solicitudes/route.ts`** [ACTUALIZADO]
- GET: Carga artículos y convierte formato texto a array con IDs
- POST: Convierte array a formato texto antes de guardar
- PUT: Maneja actualización de articulos_cantidades
- DELETE: Elimina solicitud
- Usa `sum_solicitudes`
- **IMPORTANTE**: Hace mapeo automático nombre↔ID

#### ✅ **`src/app/api/usuarios/route.ts`** [NUEVO]
- GET, POST, PUT, DELETE
- Usa `sum_usuarios`
- Soft delete (activo = 0)

#### ✅ **`src/app/api/usuarios/login/route.ts`** [NUEVO]
- POST: Autenticación con email/password
- Retorna usuario sin contraseña

## ⏳ PENDIENTE

### APIs por Crear (Siguen la misma lógica que solicitudes)

1. **`src/app/api/autorizar-solicitudes/route.ts`**
   - Tabla: `sum_autorizar_solicitudes`
   - Mismo formato de articulos_cantidades

2. **`src/app/api/solicitudes-aprobadas/route.ts`**
   - Tabla: `sum_solicitudes_aprobadas`
   - Mismo formato de articulos_cantidades

3. **`src/app/api/solicitudes-gestionadas/route.ts`**
   - Tabla: `sum_solicitudes_gestionadas`
   - Mismo formato de articulos_cantidades

4. **`src/app/api/solicitudes-despachadas/route.ts`**
   - Tabla: `sum_solicitudes_despachadas`
   - Mismo formato de articulos_cantidades
   - Incluye campo `despachado_por`

5. **`src/app/api/entradas-mercancia/route.ts`**
   - Tabla: `sum_entrada_mercancia`
   - Campo: `articulos_cantidades_unidades` (mismo formato + unidad)

### Frontend por Actualizar

#### **`src/lib/storage-api.ts`**
- Adaptar todas las respuestas al nuevo formato
- Cambiar campos: `name` → `nombre`, `role` → `rol`, etc.
- Manejar que `articulos_cantidades` viene con mapeo completo

#### Componentes que Usan Artículos
- Cambiar `codigo_articulo` a `articulo`
- Cambiar `art.name` a `art.articulo` o `art.descripcion`
- Los modales ya no necesitan generar IDs, MySQL lo hace

#### Componentes de Usuario
- Cambiar `user.name` a `user.nombre`
- Cambiar `user.role` a `user.rol`
- Cambiar `user.department` a `user.departamento`

## 🔑 INFORMACIÓN CLAVE

### Estructura de Tablas MySQL

```sql
-- Prefijo: sum_

-- Usuarios: id varchar(50), nombre, email, password, rol ENUM, departamento, avatar, activo tinyint(1)
-- Artículos: id int AUTO_INCREMENT, articulo varchar, descripcion text, existencia int, cantidad_minima int, unidad varchar, valor float
-- Departamentos: id int AUTO_INCREMENT, codigo varchar, departamento varchar
-- Solicitudes: id int AUTO_INCREMENT, numero_solicitud int UNIQUE, fecha date, departamento varchar, articulos_cantidades TEXT, estado ENUM
```

### Formato articulos_cantidades

**En MySQL (TEXT):**
```
CARPETA CON ARGOLLA 5 PULGADAS = 8<br>ALCOHOL ISOPROPÍLICO = 10
```

**En Frontend (Array):**
```json
[
  {"articulo_id": 1, "cantidad": 8, "articulo_nombre": "CARPETA CON ARGOLLA 5 PULGADAS"},
  {"articulo_id": 3, "cantidad": 10, "articulo_nombre": "ALCOHOL ISOPROPÍLICO"}
]
```

### Mapeo Automático

Las funciones en `db-config.ts` hacen el mapeo automáticamente:
- **Lectura**: Busca el ID del artículo por su nombre en la DB
- **Escritura**: Busca el nombre/descripción del artículo por su ID

## 📝 PRÓXIMOS PASOS

1. Crear las 5 APIs faltantes (copiar estructura de solicitudes.route.ts)
2. Actualizar `storage-api.ts` para que llame a las nuevas APIs
3. Actualizar componentes para usar nuevos nombres de campos
4. Probar login y autenticación
5. Probar CRUD de artículos
6. Probar flujo completo de solicitudes

## ⚠️ IMPORTANTE

- **No usar más `localStorage`** - Todo debe ir a MySQL
- **Los IDs se generan automáticamente** - No crear IDs en frontend
- **Nombres de artículos deben coincidir** - El mapeo busca coincidencias exactas
- **Estados en español** - "En revisión", "Pendiente", "Aprobada", etc.

