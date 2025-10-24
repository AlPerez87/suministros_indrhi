"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { findUserById } from "@/lib/user-storage";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let userId: string | null = null;
    try {
      userId = window.localStorage.getItem("userId");
    } catch (error) {
      console.error("No se pudo acceder al localStorage:", error);
    }
    
    if (!userId) {
      router.replace("/");
    } else {
      const currentUser = findUserById(userId);
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace("/");
      }
    }
    setIsLoading(false);
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
