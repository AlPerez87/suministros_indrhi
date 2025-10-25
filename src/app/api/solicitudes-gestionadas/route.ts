import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SolicitudGestionada } from '@/lib/types';
import { TABLES, parseArticulosCantidades, serializeArticulosCantidades } from '@/lib/db-config';

// GET - Obtener todas las solicitudes gestionadas
export async function GET() {
  try {
    // Obtener artículos para el mapeo
    const articulos = await query<any[]>(
      `SELECT id, articulo, descripcion FROM ${TABLES.ARTICULOS}`
    );

    // Obtener solicitudes gestionadas
    const solicitudes = await query<any[]>(
      `SELECT * FROM ${TABLES.SOLICITUDES_GESTIONADAS} ORDER BY numero_solicitud DESC`
    );

    // Parsear articulos_cantidades
    const solicitudesFormateadas = solicitudes.map((sol) => ({
      ...sol,
      articulos_cantidades: parseArticulosCantidades(sol.articulos_cantidades, articulos),
      fecha: new Date(sol.fecha),
    }));

    return NextResponse.json(solicitudesFormateadas);
  } catch (error) {
    console.error('Error al obtener solicitudes gestionadas:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes gestionadas', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Crear nueva solicitud gestionada
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      numero_solicitud,
      fecha,
      departamento,
      articulos_cantidades,
      estado,
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
      INSERT INTO ${TABLES.SOLICITUDES_GESTIONADAS} 
      (numero_solicitud, fecha, departamento, articulos_cantidades, estado)
      VALUES (?, ?, ?, ?, ?)
    `;

    await query(sql, [
      numero_solicitud,
      fecha || new Date(),
      departamento,
      articulosText,
      estado || 'Gestionada',
    ]);

    return NextResponse.json({
      success: true,
      message: 'Solicitud gestionada registrada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear solicitud gestionada:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe una solicitud con ese número' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear solicitud gestionada', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Actualizar solicitud gestionada
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

    const sql = `UPDATE ${TABLES.SOLICITUDES_GESTIONADAS} SET ${fields} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({
      success: true,
      message: 'Solicitud gestionada actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar solicitud gestionada:', error);
    return NextResponse.json(
      { error: 'Error al actualizar solicitud gestionada', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar solicitud gestionada
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

    await query(`DELETE FROM ${TABLES.SOLICITUDES_GESTIONADAS} WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: 'Solicitud gestionada eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar solicitud gestionada:', error);
    return NextResponse.json(
      { error: 'Error al eliminar solicitud gestionada', details: String(error) },
      { status: 500 }
    );
  }
}

