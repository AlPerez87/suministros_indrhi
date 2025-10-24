# Formato CSV para Importación de Departamentos

## Estructura del Archivo

El archivo CSV debe contener las siguientes columnas en el orden especificado:

```csv
codigo,departamento
```

## Descripción de Campos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| **codigo** | Texto | Código único del departamento (máx. 10 caracteres) | RRHH |
| **departamento** | Texto | Nombre completo del departamento | Recursos Humanos |

## Ejemplo de Archivo CSV

```csv
codigo,departamento
RRHH,Recursos Humanos
TEC,Tecnología
ADM,Administración
FIN,Finanzas
LOG,Logística
COM,Compras
VEN,Ventas
MKT,Marketing
SEG,Seguridad
MAN,Mantenimiento
```

## Notas Importantes

⚠️ **ADVERTENCIA**: La importación de departamentos eliminará:
- Todos los departamentos actuales
- Todas las solicitudes de departamentos
- Todas las autorizaciones de solicitudes
- Todas las solicitudes aprobadas
- Todas las solicitudes gestionadas
- Todas las entradas de mercancía
- Todas las solicitudes despachadas
- **NOTA**: Los artículos también serán eliminados

✅ **Recomendaciones**:
1. Asegúrate de tener un respaldo de los datos actuales antes de importar
2. Verifica que todos los códigos de departamentos sean únicos
3. Los códigos se convertirán automáticamente a MAYÚSCULAS
4. Confirma que los nombres de departamentos sean correctos
5. Solo el SuperAdmin puede realizar importaciones

## Proceso de Importación

1. Prepara tu archivo CSV con el formato correcto
2. Ve a la pantalla de **Configuración > Departamentos**
3. Haz clic en el botón **Importar CSV**
4. Selecciona tu archivo CSV
5. Revisa la vista previa de los datos
6. Confirma la importación

El sistema validará automáticamente:
- Que el archivo tenga las columnas correctas
- Que los datos sean del formato esperado
- Que no haya filas vacías

## Códigos Recomendados

Se recomienda usar códigos cortos y descriptivos:

| Tipo de Departamento | Código Sugerido |
|---------------------|----------------|
| Recursos Humanos | RRHH |
| Tecnología | TEC |
| Administración | ADM |
| Finanzas | FIN |
| Logística | LOG |
| Compras | COM |
| Ventas | VEN |
| Marketing | MKT |
| Seguridad | SEG |
| Mantenimiento | MAN |
| Legal | LEG |
| Auditoría | AUD |
| Calidad | CAL |
| Producción | PRO |
| Almacén | ALM |

