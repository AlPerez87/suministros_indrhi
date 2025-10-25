# 🗄️ Guía de Migración a MySQL

Esta guía te ayudará a migrar el sistema de localStorage a una base de datos MySQL.

## Requisitos Previos

1. **XAMPP** instalado (o cualquier servidor MySQL)
2. **MySQL** corriendo en el puerto 3306
3. **phpMyAdmin** o cualquier cliente MySQL

## Paso 1: Crear la Base de Datos

### A. Usando phpMyAdmin (XAMPP)

1. Inicia XAMPP y activa **Apache** y **MySQL**
2. Abre phpMyAdmin: `http://localhost/phpmyadmin`
3. Crea una nueva base de datos llamada: `suministros_indrhi`
4. Selecciona collation: `utf8mb4_general_ci`

### B. Usando línea de comandos

```sql
CREATE DATABASE suministros_indrhi CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE suministros_indrhi;
```

## Paso 2: Crear las Tablas

Ejecuta el siguiente script SQL en tu base de datos:

```sql
-- Tabla de Usuarios
CREATE TABLE usuarios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('SuperAdmin', 'Admin', 'Department', 'Supply') NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Departamentos
CREATE TABLE departamentos (
    id VARCHAR(50) PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Artículos
CREATE TABLE articulos (
    id VARCHAR(50) PRIMARY KEY,
    codigo_articulo VARCHAR(20) UNIQUE NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    existencia INT DEFAULT 0,
    cantidad_minima INT DEFAULT 0,
    unidad VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) DEFAULT 0.00,
    valor_total DECIMAL(10,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Solicitudes Departamentos
CREATE TABLE solicitudes_departamentos (
    id VARCHAR(50) PRIMARY KEY,
    numero_solicitud INT UNIQUE NOT NULL AUTO_INCREMENT,
    fecha DATETIME NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    estado ENUM('Pendiente', 'En Autorización', 'Aprobada', 'Rechazada') DEFAULT 'Pendiente',
    creado_por VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Artículos de Solicitudes
CREATE TABLE solicitudes_articulos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitud_id VARCHAR(50) NOT NULL,
    articulo_id VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes_departamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (articulo_id) REFERENCES articulos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Autorizaciones
CREATE TABLE autorizacion_solicitudes (
    id VARCHAR(50) PRIMARY KEY,
    numero_solicitud INT NOT NULL,
    fecha DATETIME NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    estado ENUM('En Autorización', 'Aprobada', 'Rechazada') DEFAULT 'En Autorización',
    autorizado_por VARCHAR(50),
    fecha_autorizacion DATETIME,
    comentarios TEXT,
    FOREIGN KEY (numero_solicitud) REFERENCES solicitudes_departamentos(numero_solicitud),
    FOREIGN KEY (autorizado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Solicitudes Aprobadas
CREATE TABLE solicitudes_aprobadas (
    id VARCHAR(50) PRIMARY KEY,
    numero_solicitud INT NOT NULL,
    fecha DATETIME NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Aprobada',
    fecha_aprobacion DATETIME,
    FOREIGN KEY (numero_solicitud) REFERENCES solicitudes_departamentos(numero_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Solicitudes Gestionadas
CREATE TABLE solicitudes_gestionadas (
    id VARCHAR(50) PRIMARY KEY,
    numero_solicitud INT NOT NULL,
    fecha DATETIME NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    estado VARCHAR(50) DEFAULT 'En Gestión',
    gestionado_por VARCHAR(50),
    fecha_gestion DATETIME,
    FOREIGN KEY (numero_solicitud) REFERENCES solicitudes_departamentos(numero_solicitud),
    FOREIGN KEY (gestionado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Entradas de Mercancía
CREATE TABLE entradas_mercancia (
    id VARCHAR(50) PRIMARY KEY,
    numero_entrada VARCHAR(20) UNIQUE NOT NULL,
    numero_orden VARCHAR(50) NOT NULL,
    fecha DATETIME NOT NULL,
    suplidor VARCHAR(255) NOT NULL,
    recibido_por VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recibido_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Artículos de Entradas
CREATE TABLE entradas_articulos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entrada_id VARCHAR(50) NOT NULL,
    articulo_id VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (entrada_id) REFERENCES entradas_mercancia(id) ON DELETE CASCADE,
    FOREIGN KEY (articulo_id) REFERENCES articulos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Solicitudes Despachadas
CREATE TABLE solicitudes_despachadas (
    id VARCHAR(50) PRIMARY KEY,
    numero_solicitud INT NOT NULL,
    fecha DATETIME NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Despachada',
    despachado_por VARCHAR(255),
    fecha_despacho DATETIME,
    FOREIGN KEY (numero_solicitud) REFERENCES solicitudes_departamentos(numero_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Notificaciones
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    leida BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices para mejorar el rendimiento
CREATE INDEX idx_solicitudes_estado ON solicitudes_departamentos(estado);
CREATE INDEX idx_solicitudes_departamento ON solicitudes_departamentos(departamento);
CREATE INDEX idx_articulos_codigo ON articulos(codigo_articulo);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);
```

## Paso 3: Instalar Dependencias de MySQL para Node.js

```bash
npm install mysql2
```

## Paso 4: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Configuración de Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=suministros_indrhi
DB_USER=root
DB_PASSWORD=

# Google Genkit AI (Opcional)
GOOGLE_GENAI_API_KEY=tu-api-key-aquí
```

**IMPORTANTE:** El archivo `.env.local` está en `.gitignore` y NO se subirá a GitHub (por seguridad).

## Paso 5: Crear la Conexión a MySQL

Crea el archivo `src/lib/db.ts`:

```typescript
import mysql from 'mysql2/promise';

// Configuración de la conexión
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'suministros_indrhi',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear pool de conexiones
let pool: mysql.Pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Función helper para ejecutar queries
export async function query(sql: string, params?: any[]) {
  const pool = getPool();
  const [results] = await pool.execute(sql, params);
  return results;
}

// Verificar conexión
export async function testConnection() {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    console.log('✅ Conexión a MySQL exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error);
    return false;
  }
}
```

## Paso 6: Crear API Routes

Crea los siguientes archivos en `src/app/api/`:

### API para Artículos: `src/app/api/articulos/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Obtener todos los artículos
export async function GET() {
  try {
    const articulos = await query('SELECT * FROM articulos WHERE activo = true ORDER BY codigo_articulo');
    return NextResponse.json(articulos);
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    return NextResponse.json({ error: 'Error al obtener artículos' }, { status: 500 });
  }
}

// POST - Crear nuevo artículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, codigo_articulo, descripcion, existencia, cantidad_minima, unidad, valor } = body;
    
    const valor_total = existencia * valor;
    
    const sql = `
      INSERT INTO articulos (id, codigo_articulo, descripcion, existencia, cantidad_minima, unidad, valor, valor_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(sql, [id, codigo_articulo, descripcion, existencia, cantidad_minima, unidad, valor, valor_total]);
    
    return NextResponse.json({ success: true, message: 'Artículo creado exitosamente' });
  } catch (error) {
    console.error('Error al crear artículo:', error);
    return NextResponse.json({ error: 'Error al crear artículo' }, { status: 500 });
  }
}

// PUT - Actualizar artículo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    // Calcular valor_total si se actualizó existencia o valor
    if (updates.existencia !== undefined || updates.valor !== undefined) {
      const [articulo]: any = await query('SELECT existencia, valor FROM articulos WHERE id = ?', [id]);
      const existencia = updates.existencia !== undefined ? updates.existencia : articulo.existencia;
      const valor = updates.valor !== undefined ? updates.valor : articulo.valor;
      updates.valor_total = existencia * valor;
    }
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    const sql = `UPDATE articulos SET ${fields} WHERE id = ?`;
    await query(sql, values);
    
    return NextResponse.json({ success: true, message: 'Artículo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    return NextResponse.json({ error: 'Error al actualizar artículo' }, { status: 500 });
  }
}

// DELETE - Eliminar artículo (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }
    
    await query('UPDATE articulos SET activo = false WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Artículo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    return NextResponse.json({ error: 'Error al eliminar artículo' }, { status: 500 });
  }
}
```

### Similar para otros recursos (departamentos, solicitudes, etc.)

## Paso 7: Actualizar los Archivos de Storage

Modifica `src/lib/storage.ts` para usar las API routes en lugar de localStorage:

```typescript
// Ejemplo para getStoredArticles
export async function getStoredArticles(): Promise<Article[]> {
  try {
    const response = await fetch('/api/articulos');
    if (!response.ok) throw new Error('Error al obtener artículos');
    return await response.json();
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    return [];
  }
}

// Ejemplo para addArticle
export async function addArticle(article: Article): Promise<Article[]> {
  try {
    const response = await fetch('/api/articulos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    
    if (!response.ok) throw new Error('Error al crear artículo');
    
    return await getStoredArticles(); // Refrescar lista
  } catch (error) {
    console.error('Error al agregar artículo:', error);
    throw error;
  }
}
```

## Paso 8: Migrar Datos Existentes

Crea un script para migrar los datos de localStorage a MySQL:

```typescript
// src/scripts/migrate-to-mysql.ts
import { getStoredArticles } from '@/lib/storage';
import { query } from '@/lib/db';

async function migrateData() {
  console.log('Iniciando migración de datos...');
  
  // Migrar artículos
  const articulos = getStoredArticles();
  for (const articulo of articulos) {
    await query(`
      INSERT INTO articulos (id, codigo_articulo, descripcion, existencia, cantidad_minima, unidad, valor, valor_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        descripcion = VALUES(descripcion),
        existencia = VALUES(existencia)
    `, [
      articulo.id,
      articulo.codigo_articulo,
      articulo.descripcion,
      articulo.existencia,
      articulo.cantidad_minima,
      articulo.unidad,
      articulo.valor,
      articulo.valor_total
    ]);
  }
  
  console.log('✅ Migración completada');
}

migrateData().catch(console.error);
```

## Paso 9: Probar la Conexión

1. Asegúrate de que MySQL esté corriendo en XAMPP
2. Verifica que la base de datos y tablas estén creadas
3. Reinicia el servidor de desarrollo: `npm run dev`
4. Prueba crear, leer, actualizar y eliminar datos

## Solución de Problemas

### Error: "Cannot connect to MySQL"
- Verifica que MySQL esté corriendo en XAMPP
- Revisa las credenciales en `.env.local`
- Verifica que el puerto sea el correcto (3306)

### Error: "Table doesn't exist"
- Asegúrate de haber ejecutado el script SQL completo
- Verifica que estés usando la base de datos correcta

### Error: "Access denied for user"
- Verifica el usuario y contraseña en `.env.local`
- En XAMPP, el usuario por defecto es `root` sin contraseña

## Ventajas de Usar MySQL

1. ✅ **Persistencia real**: Los datos no se pierden al limpiar el navegador
2. ✅ **Multi-usuario**: Varios usuarios pueden acceder simultáneamente
3. ✅ **Escalabilidad**: Maneja grandes volúmenes de datos
4. ✅ **Seguridad**: Control de acceso y respaldos
5. ✅ **Consultas complejas**: Joins, agregaciones, etc.
6. ✅ **Integridad**: Claves foráneas y restricciones

## Próximos Pasos Recomendados

1. ✅ Implementar autenticación con JWT
2. ✅ Agregar middleware de autorización
3. ✅ Implementar validación de datos con Zod
4. ✅ Agregar sistema de logs
5. ✅ Implementar respaldos automáticos
6. ✅ Optimizar queries con índices
7. ✅ Agregar paginación en las consultas


