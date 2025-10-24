"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import { getStoredSolicitudesAprobadas } from "@/lib/storage";
import { SolicitudAprobada } from "@/lib/types";
import { formatDate } from "@/lib/format-utils";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { notificationManager } from "@/lib/notifications";

export function NotificationsBell() {
  const { user } = useUser();
  const router = useRouter();
  const [solicitudesAprobadas, setSolicitudesAprobadas] = useState<SolicitudAprobada[]>([]);
  const [open, setOpen] = useState(false);

  // Función para actualizar las solicitudes
  const updateSolicitudes = useCallback(() => {
    const solicitudes = getStoredSolicitudesAprobadas();
    setSolicitudesAprobadas(solicitudes);
  }, []);

  // Actualizar las solicitudes aprobadas cuando se abre el popover
  useEffect(() => {
    if (open) {
      updateSolicitudes();
    }
  }, [open, updateSolicitudes]);

  // Cargar inicialmente y suscribirse a cambios
  useEffect(() => {
    updateSolicitudes();

    // Suscribirse a notificaciones
    const unsubscribe = notificationManager.subscribe(updateSolicitudes);

    // Actualizar cada 30 segundos como fallback
    const interval = setInterval(updateSolicitudes, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [updateSolicitudes]);

  // Solo mostrar para Supply y SuperAdmin
  if (!user || (user.role !== "Supply" && user.role !== "SuperAdmin")) {
    return null;
  }

  const handleGoToAprobadas = () => {
    setOpen(false);
    router.push("/dashboard/gestion/aprobadas");
  };

  const notificationsCount = solicitudesAprobadas.length;

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {notificationsCount > 9 ? "9+" : notificationsCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notificaciones de solicitudes aprobadas</p>
          </TooltipContent>
        </Tooltip>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            <Badge variant="secondary" className="text-xs">
              {notificationsCount} nueva(s)
            </Badge>
          </div>

          <Separator />

          {notificationsCount === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No hay solicitudes aprobadas pendientes
            </div>
          ) : (
            <>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {solicitudesAprobadas.map((solicitud, index) => (
                    <div
                      key={solicitud.id}
                      className="rounded-lg border p-3 space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-sm">
                              #{solicitud.numero_solicitud}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Aprobada
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {solicitud.departamento}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(solicitud.fecha)}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {solicitud.articulos_cantidades.length} artículo(s) solicitado(s)
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <Button
                onClick={handleGoToAprobadas}
                className="w-full"
                size="sm"
              >
                Ver todas las solicitudes aprobadas
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
    </TooltipProvider>
  );
}

