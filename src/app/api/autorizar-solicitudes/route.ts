import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AutorizacionSolicitud } from '@/lib/types';
import { TABLES, parseArticulosCantidades, serializeArticulosCantidades } from '@/lib/db-config';

// GET - Obtener todas las solicitudes en autorización
export async function GET() {
  try {
    // Obtener artículos para el mapeo
    const articulos = await query<any[]>(
      `SELECT id, articulo, descripcion FROM ${TABLES.ARTICULOS}`
    );

    // Obtener solicitudes en autorización
    const solicitudes = await query<any[]>(
      `SELECT * FROM ${TABLES.AUTORIZAR_SOLICITUDES} ORDER BY numero_solicitud DESC`
    );

    // Parsear articulos_cantidades
    const solicitudesFormateadas = solicitudes.map((sol) => ({
      ...sol,
      articulos_cantidades: parseArticulosCantidades(sol.articulos_cantidades, articulos),
      fecha: new Date(sol.fecha),
    }));

    return NextResponse.json(solicitudesFormateadas);
  } catch (error) {
    console.error('Error al obtener solicitudes en autorización:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes en autorización', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Crear nueva solicitud en autorización
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
      INSERT INTO ${TABLES.AUTORIZAR_SOLICITUDES} 
      (numero_solicitud, fecha, departamento, articulos_cantidades, estado)
      VALUES (?, ?, ?, ?, ?)
    `;

    await query(sql, [
      numero_solicitud,
      fecha || new Date(),
      departamento,
      articulosText,
      estado || 'Pendiente',
    ]);

    return NextResponse.json({
      success: true,
      message: 'Solicitud enviada a autorización exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear solicitud en autorización:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe una solicitud con ese número' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear solicitud en autorización', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Actualizar solicitud en autorización
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

    const sql = `UPDATE ${TABLES.AUTORIZAR_SOLICITUDES} SET ${fields} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({
      success: true,
      message: 'Solicitud en autorización actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar solicitud en autorización:', error);
    return NextResponse.json(
      { error: 'Error al actualizar solicitud en autorización', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar solicitud de autorización
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

    await query(`DELETE FROM ${TABLES.AUTORIZAR_SOLICITUDES} WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: 'Solicitud eliminada de autorización exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar solicitud de autorización:', error);
    return NextResponse.json(
      { error: 'Error al eliminar solicitud de autorización', details: String(error) },
      { status: 500 }
    );
  }
}

