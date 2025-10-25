import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { EntradaMercancia } from '@/lib/types';
import { TABLES } from '@/lib/db-config';

/**
 * Parsea articulos_cantidades_unidades desde formato de texto
 * Formato: "NOMBRE_ARTICULO = CANTIDAD (UNIDAD)<br>..."
 */
function parseArticulosConUnidades(
  text: string | null | undefined,
  articulosDB: Array<{id: number, articulo: string, descripcion: string | null}>
): Array<{articulo_id: number, cantidad: number, unidad: string, articulo_nombre: string}> {
  console.log('Parseando texto de artículos:', text); // Debug

  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.log('Texto vacío o inválido, retornando array vacío');
    return [];
  }

  const lineas = text.split(/<br\s*\/?>/i).filter(l => l && l.trim());

  console.log('Líneas encontradas:', lineas.length); // Debug

  if (lineas.length === 0) {
    return [];
  }

  return lineas.map((linea, index) => {
    console.log(`Procesando línea ${index + 1}:`, linea); // Debug

    // Formato: "NOMBRE = CANTIDAD (UNIDAD)" o "NOMBRE = CANTIDAD"
    const match = linea.match(/(.+?)\s*=\s*(\d+)(?:\s*\((.+?)\))?/);

    if (!match) {
      console.warn(`Formato inválido en línea: ${linea}`);
      return null;
    }

    const nombreArticulo = match[1].trim();
    const cantidad = parseInt(match[2]);
    const unidad = match[3]?.trim() || 'UNIDAD';

    if (isNaN(cantidad)) {
      console.warn(`Cantidad inválida en línea: ${linea}`);
      return null;
    }

    // Buscar el ID del artículo
    let articulo_id = 0;
    const articuloEncontrado = articulosDB.find(art =>
      art.articulo?.toUpperCase() === nombreArticulo.toUpperCase() ||
      art.descripcion?.toUpperCase() === nombreArticulo.toUpperCase()
    );

    if (articuloEncontrado) {
      articulo_id = articuloEncontrado.id;
      console.log(`Artículo encontrado: ${nombreArticulo} -> ID: ${articulo_id}`);
    } else {
      console.warn(`Artículo no encontrado: ${nombreArticulo}`);
    }

    return {
      articulo_id,
      cantidad,
      unidad,
      articulo_nombre: nombreArticulo
    };
  }).filter(item => item !== null) as Array<{articulo_id: number, cantidad: number, unidad: string, articulo_nombre: string}>;
}

/**
 * Serializa artículos con unidades a formato de texto
 */
function serializeArticulosConUnidades(
  articulos: Array<{articulo_id: number, cantidad: number, unidad: string}>,
  articulosDB: Array<{id: number, articulo: string, descripcion: string | null}>
): string {
  if (!articulos || articulos.length === 0) {
    return '';
  }

  const lineas = articulos.map(art => {
    const articuloEncontrado = articulosDB.find(a => a.id === art.articulo_id);
    
    if (!articuloEncontrado) {
      return null;
    }

    const nombre = articuloEncontrado.descripcion || articuloEncontrado.articulo;
    return `${nombre.toUpperCase()} = ${art.cantidad} (${art.unidad})`;
  }).filter(linea => linea !== null);

  return lineas.join('<br>');
}

// GET - Obtener todas las entradas de mercancía
export async function GET() {
  try {
    console.log('Obteniendo entradas de mercancía...'); // Debug

    // Obtener artículos para el mapeo
    const articulos = await query<any[]>(
      `SELECT id, articulo, descripcion FROM ${TABLES.ARTICULOS}`
    );
    console.log('Artículos obtenidos:', articulos.length); // Debug

    // Obtener entradas
    const entradas = await query<any[]>(
      `SELECT * FROM ${TABLES.ENTRADA_MERCANCIA} ORDER BY numero_entrada DESC`
    );
    console.log('Entradas obtenidas:', entradas.length); // Debug

    // Verificar si entradas es un array válido
    if (!Array.isArray(entradas)) {
      console.error('Entradas no es un array:', entradas);
      return NextResponse.json([]);
    }

    // Parsear articulos_cantidades_unidades
    const entradasFormateadas = entradas.map((entrada) => {
      console.log('Procesando entrada:', entrada.numero_entrada); // Debug
      return {
        ...entrada,
        articulos_cantidades_unidades: parseArticulosConUnidades(
          entrada.articulos_cantidades_unidades,
          articulos
        ),
        fecha: new Date(entrada.fecha),
      };
    });

    console.log('Entradas formateadas:', entradasFormateadas.length); // Debug
    return NextResponse.json(entradasFormateadas);
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
      numero_entrada,
      numero_orden,
      fecha,
      suplidor,
      articulos_cantidades_unidades,
    } = body;

    if (!numero_entrada || !numero_orden || !suplidor || !articulos_cantidades_unidades) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    await transaction(async (conn) => {
      // Obtener artículos para convertir IDs a nombres
      const [articulos] = await conn.execute(
        `SELECT id, articulo, descripcion, existencia FROM ${TABLES.ARTICULOS}`
      );

      // Convertir al formato de texto
      const articulosText = serializeArticulosConUnidades(
        articulos_cantidades_unidades,
        articulos as any[]
      );

      // Insertar entrada
      await conn.execute(
        `INSERT INTO ${TABLES.ENTRADA_MERCANCIA} 
         (numero_entrada, numero_orden, fecha, suplidor, articulos_cantidades_unidades)
         VALUES (?, ?, ?, ?, ?)`,
        [
          numero_entrada,
          numero_orden,
          fecha || new Date(),
          suplidor,
          articulosText,
        ]
      );

      // Actualizar existencias de artículos
      for (const item of articulos_cantidades_unidades) {
        await conn.execute(
          `UPDATE ${TABLES.ARTICULOS} 
           SET existencia = existencia + ? 
           WHERE id = ?`,
          [item.cantidad, item.articulo_id]
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Entrada de mercancía registrada exitosamente',
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

// PUT - Actualizar entrada de mercancía
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

    // Si hay articulos_cantidades_unidades, convertir al formato de texto
    if (updates.articulos_cantidades_unidades && Array.isArray(updates.articulos_cantidades_unidades)) {
      const articulos = await query<any[]>(
        `SELECT id, articulo, descripcion FROM ${TABLES.ARTICULOS}`
      );
      updates.articulos_cantidades_unidades = serializeArticulosConUnidades(
        updates.articulos_cantidades_unidades,
        articulos
      );
    }

    // Construir query dinámicamente
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    const sql = `UPDATE ${TABLES.ENTRADA_MERCANCIA} SET ${fields} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({
      success: true,
      message: 'Entrada de mercancía actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar entrada de mercancía:', error);
    return NextResponse.json(
      { error: 'Error al actualizar entrada de mercancía', details: String(error) },
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

    await query(`DELETE FROM ${TABLES.ENTRADA_MERCANCIA} WHERE id = ?`, [id]);

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
