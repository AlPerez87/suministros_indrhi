import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';

// GET - Obtener todas las entradas de mercancía
export async function GET() {
  try {
    const entradas = await query<any[]>(
      `SELECT id, numero_entrada, numero_orden, fecha, suplidor, recibido_por
       FROM entradas_mercancia
       ORDER BY fecha DESC`
    );

    // Para cada entrada, obtener sus artículos
    const entradasConArticulos = await Promise.all(
      entradas.map(async (entrada) => {
        const articulos = await query<any[]>(
          `SELECT articulo_id, cantidad 
           FROM entradas_articulos 
           WHERE entrada_id = ?`,
          [entrada.id]
        );

        return {
          ...entrada,
          articulos_cantidades: articulos.map((a) => ({
            articulo_id: a.articulo_id,
            cantidad: a.cantidad,
          })),
          fecha: new Date(entrada.fecha),
        };
      })
    );

    return NextResponse.json(entradasConArticulos);
  } catch (error) {
    console.error('Error al obtener entradas de mercancía:', error);
    return NextResponse.json(
      { error: 'Error al obtener entradas de mercancía', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Crear nueva entrada de mercancía
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      numero_entrada,
      numero_orden,
      fecha,
      suplidor,
      articulos_cantidades,
      recibido_por,
    } = body;

    if (!id || !numero_entrada || !numero_orden || !suplidor || !articulos_cantidades) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    await transaction(async (conn) => {
      // Insertar entrada
      await conn.execute(
        `INSERT INTO entradas_mercancia 
         (id, numero_entrada, numero_orden, fecha, suplidor, recibido_por)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, numero_entrada, numero_orden, fecha || new Date(), suplidor, recibido_por || null]
      );

      // Insertar artículos de la entrada
      for (const art of articulos_cantidades) {
        await conn.execute(
          `INSERT INTO entradas_articulos (entrada_id, articulo_id, cantidad)
           VALUES (?, ?, ?)`,
          [id, art.articulo_id, art.cantidad]
        );

        // Actualizar existencia del artículo
        await conn.execute(
          `UPDATE articulos 
           SET existencia = existencia + ?,
               valor_total = (existencia + ?) * valor
           WHERE id = ?`,
          [art.cantidad, art.cantidad, art.articulo_id]
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Entrada de mercancía creada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear entrada de mercancía:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe una entrada con ese número' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear entrada de mercancía', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar entrada de mercancía
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

    await transaction(async (conn) => {
      // Obtener artículos antes de eliminar para restar del inventario
      const [articulos]: any = await conn.execute(
        'SELECT articulo_id, cantidad FROM entradas_articulos WHERE entrada_id = ?',
        [id]
      );

      // Restar del inventario
      for (const art of articulos) {
        await conn.execute(
          `UPDATE articulos 
           SET existencia = existencia - ?,
               valor_total = (existencia - ?) * valor
           WHERE id = ?`,
          [art.cantidad, art.cantidad, art.articulo_id]
        );
      }

      // Eliminar entrada (los artículos se eliminan por CASCADE)
      await conn.execute('DELETE FROM entradas_mercancia WHERE id = ?', [id]);
    });

    return NextResponse.json({
      success: true,
      message: 'Entrada de mercancía eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar entrada de mercancía:', error);
    return NextResponse.json(
      { error: 'Error al eliminar entrada de mercancía', details: String(error) },
      { status: 500 }
    );
  }
}

