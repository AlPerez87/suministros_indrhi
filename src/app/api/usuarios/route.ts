import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { User } from '@/lib/types';
import { TABLES } from '@/lib/db-config';

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    const usuarios = await query<any[]>(
      `SELECT * FROM ${TABLES.USUARIOS} ORDER BY nombre`
    );
    
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      email,
      password,
      rol,
      departamento,
      avatar,
    } = body;

    if (!nombre || !email || !password || !rol) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO ${TABLES.USUARIOS} 
      (nombre, email, password, rol, departamento, avatar, activo)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `;

    await query(sql, [
      nombre,
      email,
      password,
      rol,
      departamento || null,
      avatar || null,
    ]);

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear usuario', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    // Construir query dinámicamente
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    const sql = `UPDATE ${TABLES.USUARIOS} SET ${fields} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar usuario', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    // Desactivar usuario en vez de eliminarlo
    await query(`UPDATE ${TABLES.USUARIOS} SET activo = 0 WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario', details: String(error) },
      { status: 500 }
    );
  }
}
