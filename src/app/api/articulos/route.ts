import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Article } from '@/lib/types';
import { TABLES } from '@/lib/db-config';

// GET - Obtener todos los artículos
export async function GET() {
  try {
    const articulos = await query<Article[]>(
      `SELECT * FROM ${TABLES.ARTICULOS} ORDER BY articulo`
    );
    
    // Calcular valor_total para cada artículo
    const articulosConTotal = articulos.map(art => ({
      ...art,
      valor_total: (art.existencia || 0) * (art.valor || 0)
    }));
    
    return NextResponse.json(articulosConTotal);
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    return NextResponse.json(
      { error: 'Error al obtener artículos', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo artículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      articulo,
      descripcion,
      existencia,
      cantidad_minima,
      unidad,
      valor,
    } = body;

    const sql = `
      INSERT INTO ${TABLES.ARTICULOS} 
      (articulo, descripcion, existencia, cantidad_minima, unidad, valor)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      articulo,
      descripcion || null,
      existencia || 0,
      cantidad_minima || 0,
      unidad || 'UNIDAD',
      valor || 0,
    ]);

    return NextResponse.json({
      success: true,
      message: 'Artículo creado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear artículo:', error);
    
    // Manejar error de duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe un artículo con ese código' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear artículo', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Actualizar artículo
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

    // Remover valor_total si viene en los updates (no existe en DB)
    delete updates.valor_total;

    // Construir query dinámicamente
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    const sql = `UPDATE ${TABLES.ARTICULOS} SET ${fields} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({
      success: true,
      message: 'Artículo actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar artículo', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar artículo
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
    await query(`DELETE FROM ${TABLES.ARTICULOS} WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: 'Artículo eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar artículo', details: String(error) },
      { status: 500 }
    );
  }
}

