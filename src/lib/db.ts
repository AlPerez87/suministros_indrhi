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
  queueLimit: 0,
  timezone: '+00:00', // UTC
};

// Pool de conexiones
let pool: mysql.Pool | null = null;

/**
 * Obtiene o crea el pool de conexiones a MySQL
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Pool de conexiones MySQL creado');
  }
  return pool;
}

/**
 * Ejecuta una query SQL con parámetros
 * @param sql - Query SQL con placeholders (?)
 * @param params - Parámetros para reemplazar en la query
 * @returns Resultados de la query
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const pool = getPool();
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error('❌ Error ejecutando query:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Verifica la conexión a MySQL
 * @returns true si la conexión es exitosa, false en caso contrario
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    console.log('✅ Conexión a MySQL exitosa');
    console.log(`📊 Base de datos: ${dbConfig.database}`);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error);
    console.error('Configuración:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
    });
    return false;
  }
}

/**
 * Cierra el pool de conexiones (útil al cerrar la aplicación)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔒 Pool de conexiones cerrado');
  }
}

/**
 * Ejecuta una transacción
 * @param callback - Función que recibe la conexión para ejecutar queries
 */
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

