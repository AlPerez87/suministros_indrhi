import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SolicitudDespachada } from '@/lib/types';
import { TABLES, parseArticulosCantidades, serializeArticulosCantidades } from '@/lib/db-config';

// GET - Obtener todas las solicitudes despachadas
export async function GET() {
  try {
    // Obtener artículos para el mapeo
    const articulos = await query<any[]>(
      `SELECT id, articulo, descripcion FROM ${TABLES.ARTICULOS}`
    );

    // Obtener solicitudes despachadas
    const solicitudes = await query<any[]>(
      `SELECT * FROM ${TABLES.SOLICITUDES_DESPACHADAS} ORDER BY numero_solicitud DESC`
    );

    // Parsear articulos_cantidades
    const solicitudesFormateadas = solicitudes.map((sol) => ({
      ...sol,
      articulos_cantidades: parseArticulosCantidades(sol.articulos_cantidades, articulos),
      fecha: new Date(sol.fecha),
    }));

    return NextResponse.json(solicitudesFormateadas);
  } catch (error) {
    console.error('Error al obtener solicitudes despachadas:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes despachadas', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Crear nueva solicitud despachada
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      numero_solicitud,
      fecha,
      departamento,
      articulos_cantidades,
      estado,
      despachado_por,
    } = body;

    if (!numero_solicitud || !departamento || !articulos_cantidades) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Obtener artículos para convertir IDs a nombres
    const articulos = await query<any[]>(
      `SELECT id, articulo, descripcion FROM ${TABLES.ARTICULOS}`
    );

    // Convertir al formato de texto
    const articulosText = serializeArticulosCantidades(articulos_cantidades, articulos);

    const sql = `
      INSERT INTO ${TABLES.SOLICITUDES_DESPACHADAS} 
      (numero_solicitud, fecha, departamento, articulos_cantidades, estado, despachado_por)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      numero_solicitud,
      fecha || new Date(),
      departamento,
      articulosText,
      estado || 'Despachada',
      despachado_por || null,
    ]);

    return NextResponse.json({
      success: true,
      message: 'Solicitud despachada registrada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear solicitud despachada:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe una solicitud con ese número' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear solicitud despachada', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Actualizar solicitud despachada
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

    // Si hay articulos_cantidades, convertir al formato de texto
    if (updates.articulos_cantidades && Array.isArray(updates.articulos_cantidades)) {
      const articulos = await query<any[]>(
        `SELECT id, articulo, descripcion FROM ${TABLES.ARTICULOS}`
      );
      updates.articulos_cantidades = serializeArticulosCantidades(updates.articulos_cantidades, articulos);
    }

    // Construir query dinámicamente
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    const sql = `UPDATE ${TABLES.SOLICITUDES_DESPACHADAS} SET ${fields} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({
      success: true,
      message: 'Solicitud despachada actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar solicitud despachada:', error);
    return NextResponse.json(
      { error: 'Error al actualizar solicitud despachada', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar solicitud despachada
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

    await query(`DELETE FROM ${TABLES.SOLICITUDES_DESPACHADAS} WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: 'Solicitud despachada eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar solicitud despachada:', error);
    return NextResponse.json(
      { error: 'Error al eliminar solicitud despachada', details: String(error) },
      { status: 500 }
    );
  }
}

