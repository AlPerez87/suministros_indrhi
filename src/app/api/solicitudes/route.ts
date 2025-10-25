import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { SolicitudDepartamento } from '@/lib/types';

// GET - Obtener todas las solicitudes
export async function GET() {
  try {
    // Obtener solicitudes
    const solicitudes = await query<any[]>(
      `SELECT id, numero_solicitud, fecha, departamento, estado, creado_por
       FROM solicitudes_departamentos
       ORDER BY numero_solicitud DESC`
    );

    // Para cada solicitud, obtener sus artículos
    const solicitudesConArticulos = await Promise.all(
      solicitudes.map(async (sol) => {
        const articulos = await query<any[]>(
          `SELECT articulo_id, cantidad 
           FROM solicitudes_articulos 
           WHERE solicitud_id = ?`,
          [sol.id]
        );

        return {
          ...sol,
          articulos_cantidades: articulos.map((a) => ({
            articulo_id: a.articulo_id,
            cantidad: a.cantidad,
          })),
          fecha: new Date(sol.fecha),
        };
      })
    );

    return NextResponse.json(solicitudesConArticulos);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Crear nueva solicitud
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      numero_solicitud,
      fecha,
      departamento,
      articulos_cantidades,
      estado,
      creado_por,
    } = body;

    if (!id || !numero_solicitud || !departamento || !articulos_cantidades) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Usar transacción para asegurar consistencia
    await transaction(async (conn) => {
      // Insertar solicitud
      await conn.execute(
        `INSERT INTO solicitudes_departamentos 
         (id, numero_solicitud, fecha, departamento, estado, creado_por)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          numero_solicitud,
          fecha || new Date(),
          departamento,
          estado || 'Pendiente',
          creado_por || null,
        ]
      );

      // Insertar artículos de la solicitud
      for (const art of articulos_cantidades) {
        await conn.execute(
          `INSERT INTO solicitudes_articulos (solicitud_id, articulo_id, cantidad)
           VALUES (?, ?, ?)`,
          [id, art.articulo_id, art.cantidad]
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud creada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear solicitud:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe una solicitud con ese número' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear solicitud', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Actualizar solicitud
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, estado, articulos_cantidades, ...otherUpdates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    await transaction(async (conn) => {
      // Actualizar solicitud principal
      const updates = { ...otherUpdates };
      if (estado !== undefined) updates.estado = estado;

      if (Object.keys(updates).length > 0) {
        const fields = Object.keys(updates)
          .map((key) => `${key} = ?`)
          .join(', ');
        const values = [...Object.values(updates), id];

        await conn.execute(
          `UPDATE solicitudes_departamentos SET ${fields} WHERE id = ?`,
          values
        );
      }

      // Si se actualizan los artículos, eliminar los antiguos e insertar los nuevos
      if (articulos_cantidades) {
        await conn.execute(
          'DELETE FROM solicitudes_articulos WHERE solicitud_id = ?',
          [id]
        );

        for (const art of articulos_cantidades) {
          await conn.execute(
            `INSERT INTO solicitudes_articulos (solicitud_id, articulo_id, cantidad)
             VALUES (?, ?, ?)`,
            [id, art.articulo_id, art.cantidad]
          );
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    return NextResponse.json(
      { error: 'Error al actualizar solicitud', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar solicitud
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

    // Al eliminar la solicitud, los artículos se eliminan automáticamente por CASCADE
    await query('DELETE FROM solicitudes_departamentos WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Solicitud eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    return NextResponse.json(
      { error: 'Error al eliminar solicitud', details: String(error) },
      { status: 500 }
    );
  }
}

