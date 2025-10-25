import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Article } from '@/lib/types';

// GET - Obtener todos los artículos
export async function GET() {
  try {
    const articulos = await query<Article[]>(
      'SELECT * FROM articulos WHERE activo = true ORDER BY codigo_articulo'
    );
    return NextResponse.json(articulos);
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
      id,
      codigo_articulo,
      descripcion,
      existencia,
      cantidad_minima,
      unidad,
      valor,
    } = body;

    // Calcular valor_total
    const valor_total = (existencia || 0) * (valor || 0);

    const sql = `
      INSERT INTO articulos 
      (id, codigo_articulo, descripcion, existencia, cantidad_minima, unidad, valor, valor_total, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
    `;

    await query(sql, [
      id,
      codigo_articulo,
      descripcion,
      existencia || 0,
      cantidad_minima || 0,
      unidad,
      valor || 0,
      valor_total,
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

    // Si se actualiza existencia o valor, recalcular valor_total
    if (updates.existencia !== undefined || updates.valor !== undefined) {
      const [articulo]: any = await query(
        'SELECT existencia, valor FROM articulos WHERE id = ?',
        [id]
      );

      if (!articulo) {
        return NextResponse.json(
          { error: 'Artículo no encontrado' },
          { status: 404 }
        );
      }

      const existencia =
        updates.existencia !== undefined
          ? updates.existencia
          : articulo.existencia;
      const valor = updates.valor !== undefined ? updates.valor : articulo.valor;
      updates.valor_total = existencia * valor;
    }

    // Construir query dinámicamente
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    const sql = `UPDATE articulos SET ${fields} WHERE id = ?`;
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

// DELETE - Eliminar artículo (soft delete)
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
    await query('UPDATE articulos SET activo = false WHERE id = ?', [id]);

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

