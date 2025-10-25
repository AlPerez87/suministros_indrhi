import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { User } from '@/lib/types';

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    const usuarios = await query<any[]>(
      'SELECT id, nombre as name, email, rol as role, departamento as department, avatar, activo FROM usuarios WHERE activo = true ORDER BY nombre'
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
    const { id, name, email, password, role, department, avatar } = body;

    if (!id || !name || !email || !password || !role || !department) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO usuarios (id, nombre, email, password, rol, departamento, avatar, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, true)
    `;

    await query(sql, [id, name, email, password, role, department, avatar || null]);

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
    const { id, name, email, role, department, avatar, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    // Construir updates dinámicamente
    const updates: any = {};
    if (name !== undefined) updates.nombre = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.rol = role;
    if (department !== undefined) updates.departamento = department;
    if (avatar !== undefined) updates.avatar = avatar;
    if (password !== undefined) updates.password = password;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    const sql = `UPDATE usuarios SET ${fields} WHERE id = ?`;
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

// DELETE - Eliminar usuario (soft delete)
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

    // Soft delete - marcar como inactivo
    await query('UPDATE usuarios SET activo = false WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario', details: String(error) },
      { status: 500 }
    );
  }
}

