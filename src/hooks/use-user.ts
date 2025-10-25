"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { getStoredUsers } from "@/lib/storage-api";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      let userId: string | null = null;
      try {
        userId = window.localStorage.getItem("userId");
      } catch (error) {
        console.error("No se pudo acceder al localStorage:", error);
      }
      
      if (!userId) {
        setIsLoading(false);
        router.replace("/");
        return;
      }
      
      try {
        const users = await getStoredUsers();
        console.log("Usuarios cargados:", users); // Debug
        const currentUser = users.find(u => u.id === userId);
        console.log("Usuario actual:", currentUser); // Debug
        if (currentUser) {
          setUser(currentUser);
        } else {
          console.log("Usuario no encontrado, redirigiendo al login");
          router.replace("/");
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        // En caso de error, intentar con datos de fallback
        const fallbackUser = {
          id: userId,
          nombre: "Usuario",
          email: "usuario@indrhi.gob.do",
          rol: "Department",
          departamento: "General",
          activo: true
        };
        setUser(fallbackUser);
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, [router]);

  const logout = () => {
    try {
      window.localStorage.removeItem("userId");
    } catch (error) {
       console.error("No se pudo acceder al localStorage:", error);
    }
    setUser(null);
    router.push("/");
  };

  return { user, isLoading, logout };
}
