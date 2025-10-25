/**
 * Script de migración de datos de localStorage a MySQL
 * 
 * Este script migra todos los datos existentes en localStorage a la base de datos MySQL.
 * 
 * IMPORTANTE: Ejecutar desde el navegador, NO desde Node.js
 * Abre la consola del navegador (F12) y pega este código.
 */

import { 
  getStoredArticles as getArticlesLocalStorage,
  getStoredDepartamentos as getDepartamentosLocalStorage,
  getStoredSolicitudesDepartamentos as getSolicitudesLocalStorage,
  getStoredEntradasMercancia as getEntradasLocalStorage,
} from '../lib/storage';

import {
  addArticle,
  addDepartamento,
  addSolicitudDepartamento,
  addEntradaMercancia,
  addUser,
} from '../lib/storage-api';

import { getStoredUsers } from '../lib/user-storage';

export async function migrateAllDataToMySQL() {
  console.log('🚀 Iniciando migración de datos a MySQL...');
  let errores = 0;
  let exitosos = 0;

  try {
    // 1. Migrar Usuarios
    console.log('\n📊 Migrando usuarios...');
    const usuarios = getStoredUsers();
    for (const usuario of usuarios) {
      try {
        await addUser(usuario);
        exitosos++;
        console.log(`✅ Usuario migrado: ${usuario.name}`);
      } catch (error) {
        errores++;
        console.error(`❌ Error migrando usuario ${usuario.name}:`, error);
      }
    }

    // 2. Migrar Departamentos
    console.log('\n📊 Migrando departamentos...');
    const departamentos = getDepartamentosLocalStorage();
    for (const dept of departamentos) {
      try {
        await addDepartamento(dept);
        exitosos++;
        console.log(`✅ Departamento migrado: ${dept.departamento}`);
      } catch (error) {
        errores++;
        console.error(`❌ Error migrando departamento ${dept.departamento}:`, error);
      }
    }

    // 3. Migrar Artículos
    console.log('\n📊 Migrando artículos...');
    const articulos = getArticlesLocalStorage();
    for (const articulo of articulos) {
      try {
        await addArticle(articulo);
        exitosos++;
        console.log(`✅ Artículo migrado: ${articulo.descripcion}`);
      } catch (error) {
        errores++;
        console.error(`❌ Error migrando artículo ${articulo.descripcion}:`, error);
      }
    }

    // 4. Migrar Entradas de Mercancía
    console.log('\n📊 Migrando entradas de mercancía...');
    const entradas = getEntradasLocalStorage();
    for (const entrada of entradas) {
      try {
        await addEntradaMercancia(entrada);
        exitosos++;
        console.log(`✅ Entrada migrada: ${entrada.numero_entrada}`);
      } catch (error) {
        errores++;
        console.error(`❌ Error migrando entrada ${entrada.numero_entrada}:`, error);
      }
    }

    // 5. Migrar Solicitudes
    console.log('\n📊 Migrando solicitudes...');
    const solicitudes = getSolicitudesLocalStorage();
    for (const solicitud of solicitudes) {
      try {
        await addSolicitudDepartamento(solicitud);
        exitosos++;
        console.log(`✅ Solicitud migrada: #${solicitud.numero_solicitud}`);
      } catch (error) {
        errores++;
        console.error(`❌ Error migrando solicitud #${solicitud.numero_solicitud}:`, error);
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(50));
    console.log(`✅ Exitosos: ${exitosos}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📈 Total: ${exitosos + errores}`);
    console.log('='.repeat(50));

    if (errores === 0) {
      console.log('🎉 ¡Migración completada exitosamente!');
    } else {
      console.warn('⚠️ Migración completada con algunos errores. Revisa los logs arriba.');
    }

  } catch (error) {
    console.error('❌ Error fatal durante la migración:', error);
    throw error;
  }
}

// Función helper para ejecutar desde consola del navegador
if (typeof window !== 'undefined') {
  (window as any).migrateToMySQL = migrateAllDataToMySQL;
  console.log('✅ Script de migración cargado');
  console.log('💡 Para ejecutar la migración, escribe en la consola: migrateToMySQL()');
}

