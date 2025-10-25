import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Departamento } from '@/lib/types';
import { TABLES } from '@/lib/db-config';

// GET - Obtener todos los departamentos
export async function GET() {
  try {
    const departamentos = await query<Departamento[]>(
      `SELECT * FROM ${TABLES.DEPARTAMENTOS} ORDER BY codigo`
    );
    return NextResponse.json(departamentos);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    return NextResponse.json(
      { error: 'Error al obtener departamentos', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo departamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codigo, departamento } = body;

    if (!codigo || !departamento) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO ${TABLES.DEPARTAMENTOS} (codigo, departamento)
      VALUES (?, ?)
    `;

    await query(sql, [codigo, departamento]);

    return NextResponse.json({
      success: true,
      message: 'Departamento creado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear departamento:', error);

    // Manejar error de duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe un departamento con ese código' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear departamento', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Actualizar departamento
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

    const sql = `UPDATE ${TABLES.DEPARTAMENTOS} SET ${fields} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({
      success: true,
      message: 'Departamento actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al actualizar departamento:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe un departamento con ese código' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar departamento', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar departamento
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

    // Eliminar permanentemente
    await query(`DELETE FROM ${TABLES.DEPARTAMENTOS} WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: 'Departamento eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar departamento:', error);
    return NextResponse.json(
      { error: 'Error al eliminar departamento', details: String(error) },
      { status: 500 }
    );
  }
}

