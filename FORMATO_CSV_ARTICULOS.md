# Formato CSV para Importación de Artículos

## Estructura del Archivo

El archivo CSV debe contener las siguientes columnas en el orden especificado:

```csv
codigo_articulo,descripcion,existencia,cantidad_minima,unidad,valor
```

## Descripción de Campos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| **codigo_articulo** | Texto | Código único del artículo | ART-001 |
| **descripcion** | Texto | Descripción del artículo | Papel Bond Carta |
| **existencia** | Número | Cantidad actual en stock | 500 |
| **cantidad_minima** | Número | Cantidad mínima permitida | 50 |
| **unidad** | Texto | Unidad de medida | RESMA |
| **valor** | Número | Precio unitario en RD$ | 250.00 |

## Unidades Válidas

- UNIDAD
- RESMA
- BLOCKS O TALONARIO
- PAQUETE
- GALÓN
- YARDA
- LIBRA
- CAJA

## Ejemplo de Archivo CSV

```csv
codigo_articulo,descripcion,existencia,cantidad_minima,unidad,valor
ART-001,Papel Bond Carta,500,50,RESMA,250.00
ART-002,Lápiz HB,1000,100,UNIDAD,5.50
ART-003,Borrador Blanco,200,20,UNIDAD,8.00
ART-004,Cuaderno 100 Hojas,300,30,UNIDAD,45.00
ART-005,Bolígrafo Azul,500,50,UNIDAD,12.00
```

## Notas Importantes

⚠️ **ADVERTENCIA**: La importación de artículos eliminará:
- Todos los artículos actuales
- Todas las solicitudes de departamentos
- Todas las autorizaciones de solicitudes
- Todas las solicitudes aprobadas
- Todas las solicitudes gestionadas
- Todas las entradas de mercancía
- Todas las solicitudes despachadas

✅ **Recomendaciones**:
1. Asegúrate de tener un respaldo de los datos actuales antes de importar
2. Verifica que todos los códigos de artículos sean únicos
3. Revisa que las unidades coincidan con las unidades válidas
4. Confirma que los valores numéricos sean correctos
5. Solo el SuperAdmin puede realizar importaciones

## Proceso de Importación

1. Prepara tu archivo CSV con el formato correcto
2. Ve a la pantalla de **Configuración > Artículos**
3. Haz clic en el botón **Importar CSV**
4. Selecciona tu archivo CSV
5. Revisa la vista previa de los datos
6. Confirma la importación

El sistema validará automáticamente:
- Que el archivo tenga las columnas correctas
- Que los datos sean del formato esperado
- Que no haya filas vacías

