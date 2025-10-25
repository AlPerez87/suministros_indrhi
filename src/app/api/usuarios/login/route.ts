import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { TABLES } from '@/lib/db-config';

// POST - Login de usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const usuarios = await query<any[]>(
      `SELECT * FROM ${TABLES.USUARIOS} WHERE email = ? AND activo = 1 LIMIT 1`,
      [email]
    );

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 404 }
      );
    }

    const usuario = usuarios[0];

    // Verificar contraseña (sin encriptación por ahora)
    if (usuario.password !== password) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Retornar usuario sin la contraseña
    const { password: _, ...usuarioSinPassword } = usuario;

    return NextResponse.json({
      success: true,
      user: usuarioSinPassword,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión', details: String(error) },
      { status: 500 }
    );
  }
}
