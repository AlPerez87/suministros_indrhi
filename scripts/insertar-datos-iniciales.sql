-- Script para insertar datos iniciales en MySQL
-- Sistema de Suministros INDRHI
-- Ejecuta este script después de crear las tablas

USE suministros_indrhi;

-- Limpiar datos existentes (opcional, comentar si no quieres eliminar)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE solicitudes_articulos;
-- TRUNCATE TABLE solicitudes_departamentos;
-- TRUNCATE TABLE entradas_articulos;
-- TRUNCATE TABLE entradas_mercancia;
-- TRUNCATE TABLE articulos;
-- TRUNCATE TABLE departamentos;
-- TRUNCATE TABLE usuarios;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ==================== USUARIOS ====================
INSERT INTO usuarios (id, nombre, email, password, rol, departamento, avatar, activo) VALUES
('user-1', 'Sarah Connor', 'sarah.c@example.com', '1234', 'SuperAdmin', 'Tecnología', 'https://picsum.photos/seed/user1/100/100', true),
('user-2', 'John Doe', 'john.d@example.com', 'admin456', 'Admin', 'Administración', 'https://picsum.photos/seed/user2/100/100', true),
('user-3', 'Jane Smith', 'jane.s@example.com', 'user123', 'Department', 'Recursos Humanos', 'https://picsum.photos/seed/user3/100/100', true),
('user-4', 'Mike Johnson', 'mike.j@example.com', 'supply123', 'Supply', 'Suministros', 'https://picsum.photos/seed/user4/100/100', true),
('user-5', 'Emily Davis', 'emily.d@example.com', 'user456', 'Department', 'Contabilidad', 'https://picsum.photos/seed/user5/100/100', true);

-- ==================== DEPARTAMENTOS ====================
INSERT INTO departamentos (id, codigo, departamento, activo) VALUES
('dept-1', 'TEC', 'Tecnología', true),
('dept-2', 'ADM', 'Administración', true),
('dept-3', 'RRHH', 'Recursos Humanos', true),
('dept-4', 'SUMIN', 'Suministros', true),
('dept-5', 'CONT', 'Contabilidad', true),
('dept-6', 'MKT', 'Mercadeo', true),
('dept-7', 'OPR', 'Operaciones', true);

-- ==================== ARTÍCULOS ====================
INSERT INTO articulos (id, codigo_articulo, descripcion, existencia, cantidad_minima, unidad, valor, valor_total, activo) VALUES
('art-1', 'ART-001', 'Papel Bond Tamaño Carta', 150, 20, 'RESMA', 350.00, 52500.00, true),
('art-2', 'ART-002', 'Bolígrafos Azules Caja x50', 80, 15, 'CAJA', 450.00, 36000.00, true),
('art-3', 'ART-003', 'Engrapadoras Metálicas', 45, 10, 'UNIDAD', 280.00, 12600.00, true),
('art-4', 'ART-004', 'Grapas Caja x5000', 120, 25, 'CAJA', 95.00, 11400.00, true),
('art-5', 'ART-005', 'Libretas Empastadas 100 Hojas', 200, 30, 'UNIDAD', 125.00, 25000.00, true),
('art-6', 'ART-006', 'Tóner HP LaserJet Negro', 25, 5, 'UNIDAD', 3850.00, 96250.00, true),
('art-7', 'ART-007', 'Marcadores para Pizarra Pack x4', 65, 12, 'PAQUETE', 320.00, 20800.00, true),
('art-8', 'ART-008', 'Carpetas de Archivo Tamaño Oficio', 180, 40, 'UNIDAD', 45.00, 8100.00, true),
('art-9', 'ART-009', 'Clips Metálicos Caja x100', 90, 20, 'CAJA', 55.00, 4950.00, true),
('art-10', 'ART-010', 'Alcohol en Gel 1 Galón', 40, 8, 'GALÓN', 890.00, 35600.00, true);

-- ==================== ENTRADAS DE MERCANCÍA ====================
INSERT INTO entradas_mercancia (id, numero_entrada, numero_orden, fecha, suplidor, recibido_por) VALUES
('em-1', 'EM-2025-0001', 'INDRHI-DAF-CD-2025-0001', '2025-01-05 08:00:00', 'Distribuidora Nacional de Suministros', 'user-4'),
('em-2', 'EM-2025-0002', 'INDRHI-DAF-CD-2025-0002', '2025-01-12 09:30:00', 'Papelería Central S.A.', 'user-4'),
('em-3', 'EM-2025-0003', 'INDRHI-DAF-CD-2025-0003', '2025-01-18 10:00:00', 'Tecnología y Oficina RD', 'user-4');

-- Artículos de entradas de mercancía
INSERT INTO entradas_articulos (entrada_id, articulo_id, cantidad) VALUES
-- Entrada 1
('em-1', 'art-1', 50),
('em-1', 'art-2', 30),
('em-1', 'art-5', 100),
-- Entrada 2
('em-2', 'art-3', 25),
('em-2', 'art-4', 50),
('em-2', 'art-8', 80),
-- Entrada 3
('em-3', 'art-6', 10),
('em-3', 'art-7', 20);

-- ==================== SOLICITUDES DEPARTAMENTOS ====================
INSERT INTO solicitudes_departamentos (id, numero_solicitud, fecha, departamento, estado, creado_por) VALUES
('sol-dept-1', 1001, '2025-01-15 09:30:00', 'Recursos Humanos', 'Pendiente', 'user-3'),
('sol-dept-2', 1002, '2025-01-16 10:15:00', 'Contabilidad', 'En Autorización', 'user-5'),
('sol-dept-3', 1003, '2025-01-17 14:20:00', 'Tecnología', 'Aprobada', 'user-1');

-- Artículos de solicitudes
INSERT INTO solicitudes_articulos (solicitud_id, articulo_id, cantidad) VALUES
-- Solicitud 1
('sol-dept-1', 'art-1', 10),
('sol-dept-1', 'art-2', 5),
('sol-dept-1', 'art-5', 15),
-- Solicitud 2
('sol-dept-2', 'art-3', 3),
('sol-dept-2', 'art-4', 10),
-- Solicitud 3
('sol-dept-3', 'art-6', 2),
('sol-dept-3', 'art-7', 8);

-- ==================== VERIFICACIÓN ====================
-- Consultas para verificar que los datos se insertaron correctamente

SELECT 'USUARIOS' as Tabla, COUNT(*) as Total FROM usuarios
UNION ALL
SELECT 'DEPARTAMENTOS', COUNT(*) FROM departamentos
UNION ALL
SELECT 'ARTÍCULOS', COUNT(*) FROM articulos
UNION ALL
SELECT 'ENTRADAS MERCANCÍA', COUNT(*) FROM entradas_mercancia
UNION ALL
SELECT 'SOLICITUDES', COUNT(*) FROM solicitudes_departamentos;

-- Mostrar inventario actual
SELECT 
  codigo_articulo,
  descripcion,
  existencia,
  cantidad_minima,
  CONCAT('RD$', FORMAT(valor_total, 2)) as valor_total
FROM articulos
WHERE activo = true
ORDER BY codigo_articulo;

-- Mostrar usuarios
SELECT 
  nombre,
  email,
  rol,
  departamento
FROM usuarios
WHERE activo = true
ORDER BY rol, nombre;

SELECT '✅ Datos iniciales insertados correctamente' as Status;

