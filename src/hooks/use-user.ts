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
        router.replace("/");
      } else {
        try {
          const users = await getStoredUsers();
          const currentUser = users.find(u => u.id === userId);
          if (currentUser) {
            setUser(currentUser);
          } else {
            router.replace("/");
          }
        } catch (error) {
          console.error("Error al cargar usuario:", error);
          router.replace("/");
        }
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
