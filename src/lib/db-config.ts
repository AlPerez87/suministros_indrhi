/**
 * Configuración de base de datos
 * Define el prefijo de tablas para evitar conflictos
 */

// Prefijo de tablas en la base de datos
export const TABLE_PREFIX = 'sum_';

// Nombres de tablas con prefijo
export const TABLES = {
  ARTICULOS: `${TABLE_PREFIX}articulos`,
  DEPARTAMENTOS: `${TABLE_PREFIX}departamentos`,
  USUARIOS: `${TABLE_PREFIX}usuarios`,
  SOLICITUDES: `${TABLE_PREFIX}solicitudes`,
  AUTORIZAR_SOLICITUDES: `${TABLE_PREFIX}autorizar_solicitudes`,
  SOLICITUDES_APROBADAS: `${TABLE_PREFIX}solicitudes_aprobadas`,
  SOLICITUDES_GESTIONADAS: `${TABLE_PREFIX}solicitudes_gestionadas`,
  SOLICITUDES_DESPACHADAS: `${TABLE_PREFIX}solicitudes_despachadas`,
  ENTRADA_MERCANCIA: `${TABLE_PREFIX}entrada_mercancia`,
} as const;

/**
 * Parsea el formato de articulos_cantidades desde MySQL
 * Formato: "NOMBRE_ARTICULO = CANTIDAD" separados por <br>
 * Ejemplo: "CARPETA CON ARGOLLA 5 PULGADAS = 8<br>ALCOHOL ISOPROPÍLICO = 10"
 * 
 * @param articulosText - Texto con artículos y cantidades
 * @param articulosDB - Array de artículos de la DB para mapear nombres a IDs
 * @returns Array de objetos con articulo_id, cantidad y articulo_nombre
 */
export function parseArticulosCantidades(
  articulosText: string | null | undefined,
  articulosDB: Array<{id: number, articulo: string, descripcion: string | null}> = []
): Array<{articulo_id: number, cantidad: number, articulo_nombre: string}> {
  if (!articulosText || typeof articulosText !== 'string' || articulosText.trim() === '') {
    return [];
  }

  // Separar por <br> (puede ser <br>, <br/>, <BR>, etc.)
  const lineas = articulosText.split(/<br\s*\/?>/i).filter(l => l && l.trim());

  return lineas.map(linea => {
    // Formato: "NOMBRE_ARTICULO = CANTIDAD"
    const partes = linea.split('=').map(p => p.trim());
    
    if (partes.length !== 2) {
      console.warn(`Formato inválido en línea: ${linea}`);
      return null;
    }

    const nombreArticulo = partes[0];
    const cantidad = parseInt(partes[1]);

    if (isNaN(cantidad)) {
      console.warn(`Cantidad inválida en línea: ${linea}`);
      return null;
    }

    // Buscar el ID del artículo por nombre
    let articulo_id = 0;
    
    if (articulosDB.length > 0) {
      // Buscar por coincidencia exacta en 'articulo' o 'descripcion'
      const articuloEncontrado = articulosDB.find(art => 
        art.articulo?.toUpperCase() === nombreArticulo.toUpperCase() ||
        art.descripcion?.toUpperCase() === nombreArticulo.toUpperCase()
      );
      
      if (articuloEncontrado) {
        articulo_id = articuloEncontrado.id;
      } else {
        console.warn(`No se encontró artículo con nombre: ${nombreArticulo}`);
      }
    }

    return {
      articulo_id,
      cantidad,
      articulo_nombre: nombreArticulo
    };
  }).filter(item => item !== null) as Array<{articulo_id: number, cantidad: number, articulo_nombre: string}>;
}

/**
 * Convierte array de artículos a formato de texto para MySQL
 * Formato: "NOMBRE_ARTICULO = CANTIDAD<br>OTRO_ARTICULO = CANTIDAD"
 * 
 * @param articulos - Array de objetos con articulo_id y cantidad
 * @param articulosDB - Array de artículos de la DB para obtener nombres
 * @returns String en formato para MySQL
 */
export function serializeArticulosCantidades(
  articulos: Array<{articulo_id: number, cantidad: number}>,
  articulosDB: Array<{id: number, articulo: string, descripcion: string | null}>
): string {
  if (!articulos || articulos.length === 0) {
    return '';
  }

  const lineas = articulos.map(art => {
    // Buscar el nombre del artículo
    const articuloEncontrado = articulosDB.find(a => a.id === art.articulo_id);
    
    if (!articuloEncontrado) {
      console.warn(`No se encontró artículo con ID: ${art.articulo_id}`);
      return null;
    }

    // Usar la descripción si existe, sino el código
    const nombre = articuloEncontrado.descripcion || articuloEncontrado.articulo;
    
    return `${nombre.toUpperCase()} = ${art.cantidad}`;
  }).filter(linea => linea !== null);

  return lineas.join('<br>');
}

