
"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getStoredUsers } from "@/lib/user-storage";

export default function LoginPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [users, setUsers] = React.useState(() => getStoredUsers());

  React.useEffect(() => {
    // Actualizar usuarios al montar el componente
    setUsers(getStoredUsers());
  }, []);

  const handleLogin = () => {
    if (selectedUser && password) {
      const user = users.find(u => u.id === selectedUser);
      if (user && user.password === password) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("userId", user.id);
        }
        router.push("/dashboard");
      } else {
        setError("Contraseña incorrecta. Por favor, intenta de nuevo.");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="relative h-32 w-full mb-4">
            <Image
              src="/logo-indrhi.png"
              alt="Logo INDRHI - Instituto Nacional de Recursos Hidráulicos"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <CardTitle className="font-headline text-2xl">
            Sistema Suministro INDRHI
          </CardTitle>
          <CardDescription>
            Por favor, selecciona un usuario para iniciar sesión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="user-role">Usuario</Label>
              <Select onValueChange={(value) => { setSelectedUser(value); setError(""); }}>
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Selecciona un usuario..." />
                </SelectTrigger>
                <SelectContent position="popper">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive text-center">
                {error}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={!selectedUser || !password}
          >
            Iniciar Sesión
          </Button>
        </CardFooter>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Ingresa tu usuario y contraseña para acceder al sistema.</p>
      </footer>
    </div>
  );
}
