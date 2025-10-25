# Migración a MySQL Completada

## ✅ Código Migrado

Todos los archivos del proyecto han sido actualizados para usar MySQL en lugar de localStorage.

## 📋 Paso Final: Insertar Datos Iniciales

Para completar la migración, necesitas insertar los datos iniciales en MySQL:

### 1. Asegúrate de que XAMPP esté corriendo
- Abre XAMPP Control Panel
- Inicia **MySQL**
- Inicia **Apache** (para phpMyAdmin)

### 2. Ejecuta el script SQL
- Abre: http://localhost/phpmyadmin
- Selecciona la base de datos: `suministros_indrhi`
- Click en la pestaña **"SQL"**
- Abre el archivo: `scripts/insertar-datos-iniciales.sql`
- Copia todo el contenido y pégalo en phpMyAdmin
- Click en **"Continuar"**

### 3. Reinicia el servidor
```bash
npm run dev
```

### 4. Accede a la aplicación
- URL: http://localhost:9002
- Usuario: `sarah.c@example.com`
- Password: `1234`

## 🔧 Configuración

El archivo `.env.local` debe contener:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=suministros_indrhi
DB_USER=root
DB_PASSWORD=
```

## ✅ Verificación

Verifica que la conexión funciona:
- http://localhost:9002/api/test-connection

Debe mostrar: `"success": true`

