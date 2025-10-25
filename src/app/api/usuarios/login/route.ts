import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Login de usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y password son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const usuarios = await query<any[]>(
      `SELECT id, nombre as name, email, password, rol as role, departamento as department, avatar 
       FROM usuarios 
       WHERE email = ? AND activo = true`,
      [email]
    );

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const usuario = usuarios[0];

    // Verificar password (nota: en producción deberías usar hash)
    if (usuario.password !== password) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // No retornar el password
    const { password: _, ...usuarioSinPassword } = usuario;

    return NextResponse.json({
      success: true,
      user: usuarioSinPassword,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error en login', details: String(error) },
      { status: 500 }
    );
  }
}

