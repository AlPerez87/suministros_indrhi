/**
 * Funciones de almacenamiento usando MySQL a través de API Routes
 * Este archivo reemplaza las funciones de localStorage con llamadas a la API
 */

import {
  Article,
  Departamento,
  SolicitudDepartamento,
  AutorizacionSolicitud,
  SolicitudAprobada,
  SolicitudGestionada,
  EntradaMercancia,
  SolicitudDespachada,
  User,
} from "./types";

// Configuración de la API
const API_BASE_URL = '/api';

// Helper para manejar errores de fetch
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en fetchAPI:', error);
    throw error;
  }
}

// ==================== ARTÍCULOS ====================

export async function getStoredArticles(): Promise<Article[]> {
  try {
    return await fetchAPI<Article[]>(`${API_BASE_URL}/articulos`);
  } catch (error) {
    console.error("Error al obtener artículos:", error);
    return [];
  }
}

export async function saveArticles(articles: Article[]): Promise<void> {
  // No se usa directamente, pero mantenemos por compatibilidad
  console.warn('saveArticles no se usa con MySQL');
}

export async function updateArticle(id: number | string, updates: Partial<Article>): Promise<Article[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/articulos`, {
      method: 'PUT',
      body: JSON.stringify({ id: Number(id), ...updates }),
    });
    return await getStoredArticles();
  } catch (error) {
    console.error("Error al actualizar artículo:", error);
    throw error;
  }
}

export async function addArticle(article: Article): Promise<Article[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/articulos`, {
      method: 'POST',
      body: JSON.stringify(article),
    });
    return await getStoredArticles();
  } catch (error) {
    console.error("Error al agregar artículo:", error);
    throw error;
  }
}

export async function deleteArticle(id: number | string): Promise<Article[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/articulos?id=${Number(id)}`, {
      method: 'DELETE',
    });
    return await getStoredArticles();
  } catch (error) {
    console.error("Error al eliminar artículo:", error);
    throw error;
  }
}

// ==================== DEPARTAMENTOS ====================

export async function getStoredDepartamentos(): Promise<Departamento[]> {
  try {
    return await fetchAPI<Departamento[]>(`${API_BASE_URL}/departamentos`);
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    return [];
  }
}

export async function saveDepartamentos(departamentos: Departamento[]): Promise<void> {
  console.warn('saveDepartamentos no se usa con MySQL');
}

export async function addDepartamento(departamento: Departamento): Promise<Departamento[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/departamentos`, {
      method: 'POST',
      body: JSON.stringify(departamento),
    });
    return await getStoredDepartamentos();
  } catch (error) {
    console.error("Error al agregar departamento:", error);
    throw error;
  }
}

export async function updateDepartamento(id: number | string, updates: Partial<Departamento>): Promise<Departamento[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/departamentos`, {
      method: 'PUT',
      body: JSON.stringify({ id: Number(id), ...updates }),
    });
    return await getStoredDepartamentos();
  } catch (error) {
    console.error("Error al actualizar departamento:", error);
    throw error;
  }
}

export async function deleteDepartamento(id: number | string): Promise<Departamento[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/departamentos?id=${Number(id)}`, {
      method: 'DELETE',
    });
    return await getStoredDepartamentos();
  } catch (error) {
    console.error("Error al eliminar departamento:", error);
    throw error;
  }
}

// ==================== SOLICITUDES DEPARTAMENTOS ====================

export async function getStoredSolicitudesDepartamentos(): Promise<SolicitudDepartamento[]> {
  try {
    return await fetchAPI<SolicitudDepartamento[]>(`${API_BASE_URL}/solicitudes`);
  } catch (error) {
    console.error("Error al obtener solicitudes departamentos:", error);
    return [];
  }
}

export async function saveSolicitudesDepartamentos(solicitudes: SolicitudDepartamento[]): Promise<void> {
  console.warn('saveSolicitudesDepartamentos no se usa con MySQL');
}

export async function addSolicitudDepartamento(solicitud: SolicitudDepartamento): Promise<SolicitudDepartamento[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/solicitudes`, {
      method: 'POST',
      body: JSON.stringify(solicitud),
    });
    return await getStoredSolicitudesDepartamentos();
  } catch (error) {
    console.error("Error al agregar solicitud departamento:", error);
    throw error;
  }
}

export async function updateSolicitudDepartamento(id: number | string, updates: Partial<SolicitudDepartamento>): Promise<SolicitudDepartamento[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/solicitudes`, {
      method: 'PUT',
      body: JSON.stringify({ id: Number(id), ...updates }),
    });
    return await getStoredSolicitudesDepartamentos();
  } catch (error) {
    console.error("Error al actualizar solicitud departamento:", error);
    throw error;
  }
}

export async function deleteSolicitudDepartamento(id: number | string): Promise<SolicitudDepartamento[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/solicitudes?id=${Number(id)}`, {
      method: 'DELETE',
    });
    return await getStoredSolicitudesDepartamentos();
  } catch (error) {
    console.error("Error al eliminar solicitud departamento:", error);
    throw error;
  }
}

// ==================== ENTRADAS MERCANCÍA ====================

export async function getStoredEntradasMercancia(): Promise<EntradaMercancia[]> {
  try {
    const data = await fetchAPI<EntradaMercancia[]>(`${API_BASE_URL}/entradas-mercancia`);
    console.log("Datos de entradas de mercancía:", data); // Debug
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error al obtener entradas mercancía:", error);
    return [];
  }
}

export async function saveEntradasMercancia(entradas: EntradaMercancia[]): Promise<void> {
  console.warn('saveEntradasMercancia no se usa con MySQL');
}

export async function addEntradaMercancia(entrada: EntradaMercancia): Promise<EntradaMercancia[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/entradas-mercancia`, {
      method: 'POST',
      body: JSON.stringify(entrada),
    });
    return await getStoredEntradasMercancia();
  } catch (error) {
    console.error("Error al agregar entrada mercancía:", error);
    throw error;
  }
}

// ==================== AUTORIZACION SOLICITUDES ====================

export async function getStoredAutorizacionSolicitudes(): Promise<AutorizacionSolicitud[]> {
  try {
    return await fetchAPI<AutorizacionSolicitud[]>(`${API_BASE_URL}/autorizar-solicitudes`);
  } catch (error) {
    console.error("Error al obtener autorizaciones:", error);
    return [];
  }
}

export async function saveAutorizacionSolicitudes(solicitudes: AutorizacionSolicitud[]): Promise<void> {
  console.warn('saveAutorizacionSolicitudes no se usa con MySQL');
}

export async function addAutorizacionSolicitud(solicitud: AutorizacionSolicitud): Promise<AutorizacionSolicitud[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/autorizar-solicitudes`, {
      method: 'POST',
      body: JSON.stringify(solicitud),
    });
    return await getStoredAutorizacionSolicitudes();
  } catch (error) {
    console.error("Error al agregar autorización:", error);
    throw error;
  }
}

export async function deleteAutorizacionSolicitud(id: number | string): Promise<AutorizacionSolicitud[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/autorizar-solicitudes?id=${Number(id)}`, {
      method: 'DELETE',
    });
    return await getStoredAutorizacionSolicitudes();
  } catch (error) {
    console.error("Error al eliminar autorización:", error);
    throw error;
  }
}

// ==================== SOLICITUDES APROBADAS ====================

export async function getStoredSolicitudesAprobadas(): Promise<SolicitudAprobada[]> {
  try {
    return await fetchAPI<SolicitudAprobada[]>(`${API_BASE_URL}/solicitudes-aprobadas`);
  } catch (error) {
    console.error("Error al obtener solicitudes aprobadas:", error);
    return [];
  }
}

export async function saveSolicitudesAprobadas(solicitudes: SolicitudAprobada[]): Promise<void> {
  console.warn('saveSolicitudesAprobadas no se usa con MySQL');
}

export async function addSolicitudAprobada(solicitud: SolicitudAprobada): Promise<SolicitudAprobada[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/solicitudes-aprobadas`, {
      method: 'POST',
      body: JSON.stringify(solicitud),
    });
    return await getStoredSolicitudesAprobadas();
  } catch (error) {
    console.error("Error al agregar solicitud aprobada:", error);
    throw error;
  }
}

export async function deleteSolicitudAprobada(id: number | string): Promise<SolicitudAprobada[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/solicitudes-aprobadas?id=${Number(id)}`, {
      method: 'DELETE',
    });
    return await getStoredSolicitudesAprobadas();
  } catch (error) {
    console.error("Error al eliminar solicitud aprobada:", error);
    throw error;
  }
}

// ==================== SOLICITUDES GESTIONADAS ====================

export async function getStoredSolicitudesGestionadas(): Promise<SolicitudGestionada[]> {
  try {
    return await fetchAPI<SolicitudGestionada[]>(`${API_BASE_URL}/solicitudes-gestionadas`);
  } catch (error) {
    console.error("Error al obtener solicitudes gestionadas:", error);
    return [];
  }
}

export async function saveSolicitudesGestionadas(solicitudes: SolicitudGestionada[]): Promise<void> {
  console.warn('saveSolicitudesGestionadas no se usa con MySQL');
}

export async function addSolicitudGestionada(solicitud: SolicitudGestionada): Promise<SolicitudGestionada[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/solicitudes-gestionadas`, {
      method: 'POST',
      body: JSON.stringify(solicitud),
    });
    return await getStoredSolicitudesGestionadas();
  } catch (error) {
    console.error("Error al agregar solicitud gestionada:", error);
    throw error;
  }
}

export async function deleteSolicitudGestionada(id: number | string): Promise<SolicitudGestionada[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/solicitudes-gestionadas?id=${Number(id)}`, {
      method: 'DELETE',
    });
    return await getStoredSolicitudesGestionadas();
  } catch (error) {
    console.error("Error al eliminar solicitud gestionada:", error);
    throw error;
  }
}

// ==================== SOLICITUDES DESPACHADAS ====================

export async function getStoredSolicitudesDespachadas(): Promise<SolicitudDespachada[]> {
  try {
    return await fetchAPI<SolicitudDespachada[]>(`${API_BASE_URL}/solicitudes-despachadas`);
  } catch (error) {
    console.error("Error al obtener solicitudes despachadas:", error);
    return [];
  }
}

export async function saveSolicitudesDespachadas(solicitudes: SolicitudDespachada[]): Promise<void> {
  console.warn('saveSolicitudesDespachadas no se usa con MySQL');
}

export async function addSolicitudDespachada(solicitud: SolicitudDespachada): Promise<SolicitudDespachada[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/solicitudes-despachadas`, {
      method: 'POST',
      body: JSON.stringify(solicitud),
    });
    return await getStoredSolicitudesDespachadas();
  } catch (error) {
    console.error("Error al agregar solicitud despachada:", error);
    throw error;
  }
}

// ==================== UTILIDADES ====================

export async function getNextNumeroSolicitud(): Promise<number> {
  try {
    const solicitudes = await getStoredSolicitudesDepartamentos();
    if (solicitudes.length === 0) {
      return 1;
    }
    const maxNumero = Math.max(...solicitudes.map((s) => s.numero_solicitud));
    return maxNumero + 1;
  } catch (error) {
    console.error("Error al obtener próximo número de solicitud:", error);
    return 1;
  }
}

export async function getNextNumeroEntrada(): Promise<string> {
  try {
    const currentYear = new Date().getFullYear();
    const entradas = await getStoredEntradasMercancia();

    // Verificar que entradas sea un array válido
    if (!Array.isArray(entradas)) {
      console.error('Entradas no es un array válido:', entradas);
      return `EM-${currentYear}-0001`;
    }

    const entradasDelAno = entradas.filter((e) =>
      e && e.numero_entrada && e.numero_entrada.includes(`-${currentYear}-`)
    );

    if (entradasDelAno.length === 0) {
      return `EM-${currentYear}-0001`;
    }

    const numeros = entradasDelAno
      .map((e) => {
        if (!e || !e.numero_entrada) return 0;
        const match = e.numero_entrada.match(/EM-\d{4}-(\d{4})/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
    const nextNumero = maxNumero + 1;

    return `EM-${currentYear}-${String(nextNumero).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error al obtener próximo número de entrada:", error);
    return `EM-${new Date().getFullYear()}-0001`;
  }
}

export function generateNumeroOrden(lastFourDigits: string): string {
  const currentYear = new Date().getFullYear();
  return `INDRHI-DAF-CD-${currentYear}-${lastFourDigits}`;
}

// ==================== USUARIOS (API) ====================

export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetchAPI<{ success: boolean; user: User }>(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.user;
  } catch (error) {
    console.error("Error en login:", error);
    return null;
  }
}

export async function getStoredUsers(): Promise<User[]> {
  try {
    return await fetchAPI<User[]>(`${API_BASE_URL}/usuarios`);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
}

export async function addUser(user: User): Promise<User[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return await getStoredUsers();
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    throw error;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/usuarios`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
    return await getStoredUsers();
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<User[]> {
  try {
    await fetchAPI(`${API_BASE_URL}/usuarios?id=${id}`, {
      method: 'DELETE',
    });
    return await getStoredUsers();
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
}

