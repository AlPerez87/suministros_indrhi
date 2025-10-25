import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

/**
 * Endpoint para probar la conexión a MySQL
 * GET /api/test-connection
 */
export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: '✅ Conexión a MySQL exitosa',
        database: process.env.DB_NAME || 'suministros_indrhi',
        host: process.env.DB_HOST || 'localhost',
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '❌ No se pudo conectar a MySQL',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error probando conexión:', error);
    return NextResponse.json({
      success: false,
      message: '❌ Error al probar conexión',
      error: String(error),
    }, { status: 500 });
  }
}

