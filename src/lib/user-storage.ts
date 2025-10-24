import { User } from "./types";
import { users as initialUsers } from "./data";

const USERS_STORAGE_KEY = "indrhi_suministro_users";

/**
 * Obtiene todos los usuarios desde localStorage o devuelve los usuarios iniciales
 */
export function getStoredUsers(): User[] {
  if (typeof window === "undefined") {
    return initialUsers;
  }

  try {
    const stored = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error al leer usuarios de localStorage:", error);
  }

  // Si no hay datos en localStorage, guardar los iniciales y devolverlos
  saveUsers(initialUsers);
  return initialUsers;
}

/**
 * Guarda los usuarios en localStorage
 */
export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error al guardar usuarios en localStorage:", error);
  }
}

/**
 * Actualiza un usuario específico
 */
export function updateUser(userId: string, updates: Partial<User>): User[] {
  const users = getStoredUsers();
  const updatedUsers = users.map(u => 
    u.id === userId ? { ...u, ...updates } : u
  );
  saveUsers(updatedUsers);
  return updatedUsers;
}

/**
 * Agrega un nuevo usuario
 */
export function addUser(user: User): User[] {
  const users = getStoredUsers();
  const updatedUsers = [user, ...users];
  saveUsers(updatedUsers);
  return updatedUsers;
}

/**
 * Elimina un usuario
 */
export function deleteUser(userId: string): User[] {
  const users = getStoredUsers();
  const updatedUsers = users.filter(u => u.id !== userId);
  saveUsers(updatedUsers);
  return updatedUsers;
}

/**
 * Encuentra un usuario por ID
 */
export function findUserById(userId: string): User | undefined {
  const users = getStoredUsers();
  return users.find(u => u.id === userId);
}

