"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  getStoredSolicitudesAprobadas,
  deleteSolicitudAprobada,
  addSolicitudGestionada,
  updateSolicitudDepartamento,
  getStoredArticles,
} from "@/lib/storage";
import { SolicitudAprobada, SolicitudGestionada, ArticuloCantidad } from "@/lib/types";
import { DataTable } from "@/components/solicitudes/data-table";
import { getColumns } from "@/components/solicitudes/columns";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { notificationManager } from "@/lib/notifications";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format-utils";
import { ArrowLeft, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SolicitudesAprobadasPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [solicitudes, setSolicitudes] = useState<SolicitudAprobada[]>(() =>
    getStoredSolicitudesAprobadas()
  );
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudAprobada | null>(null);
  const [cantidadesAsignadas, setCantidadesAsignadas] = useState<ArticuloCantidad[]>([]);

  const allArticles = getStoredArticles();

  useEffect(() => {
    if (!isLoading && user?.role !== "SuperAdmin" && user?.role !== "Admin" && user?.role !== "Supply") {
      toast({
        variant: "destructive",
        title: "Acceso Denegado",
        description: "No tienes permiso para ver esta página.",
      });
      router.replace("/dashboard");
    }
  }, [user, isLoading, router, toast]);

  if (isLoading) return <div>Cargando...</div>;
  if (!user || (user.role !== "SuperAdmin" && user.role !== "Admin" && user.role !== "Supply")) {
    return null;
  }

  const handleViewDetails = (solicitud: SolicitudAprobada) => {
    setSelectedSolicitud(solicitud);
    // Inicializar cantidades asignadas con las cantidades solicitadas
    setCantidadesAsignadas(
      solicitud.articulos_cantidades.map((a) => ({ ...a }))
    );
  };

  const handleCantidadChange = (index: number, cantidad: number) => {
    const newCantidades = [...cantidadesAsignadas];
    newCantidades[index].cantidad = cantidad;
    setCantidadesAsignadas(newCantidades);
  };

  const handleGuardarGestion = () => {
    if (!selectedSolicitud) return;

    // Validar que al menos un artículo tenga cantidad > 0
    const articulosConCantidad = cantidadesAsignadas.filter((a) => a.cantidad > 0);
    if (articulosConCantidad.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes asignar al menos una cantidad mayor a 0.",
      });
      return;
    }

    // 1. Eliminar de solicitudes_aprobadas
    const updatedAprobadas = deleteSolicitudAprobada(selectedSolicitud.id);
    setSolicitudes(updatedAprobadas);

    // 2. Actualizar estado en solicitudes_departamentos
    updateSolicitudDepartamento(
      selectedSolicitud.id.replace("sol-apr-", "sol-dept-"),
      { estado: "En Gestión" }
    );

    // 3. Agregar a solicitudes_gestionadas
    const solicitudGestionada: SolicitudGestionada = {
      id: `sol-ges-${Date.now()}`,
      numero_solicitud: selectedSolicitud.numero_solicitud,
      fecha: selectedSolicitud.fecha,
      departamento: selectedSolicitud.departamento,
      articulos_cantidades: articulosConCantidad,
      estado: "En Gestión",
    };

    addSolicitudGestionada(solicitudGestionada);

    toast({
      title: "Solicitud Gestionada",
      description: `Solicitud #${selectedSolicitud.numero_solicitud} ha sido enviada a gestión.`,
    });

    // Notificar cambios en las notificaciones
    notificationManager.notify();

    setSelectedSolicitud(null);
    setCantidadesAsignadas([]);
  };

  const handleCancelar = () => {
    setSelectedSolicitud(null);
    setCantidadesAsignadas([]);
  };

  const columns = getColumns({
    onViewDetails: handleViewDetails,
  });

  // Si hay una solicitud seleccionada, mostrar la vista dividida
  if (selectedSolicitud) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleCancelar}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la Lista
          </Button>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Solicitud #{selectedSolicitud.numero_solicitud}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Lado Izquierdo: Datos Originales (Solo Lectura) */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitud Original</CardTitle>
              <CardDescription>
                Información de la solicitud aprobada (solo lectura)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Número de Solicitud
                </Label>
                <div className="font-mono font-bold text-xl">
                  #{selectedSolicitud.numero_solicitud}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Departamento</Label>
                <div className="font-medium text-lg">
                  {selectedSolicitud.departamento}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Fecha</Label>
                <div className="font-medium">{formatDate(selectedSolicitud.fecha)}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Estado</Label>
                <Badge variant="outline">{selectedSolicitud.estado}</Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="font-semibold">Artículos Solicitados</Label>
                <div className="border rounded-lg divide-y">
                  {selectedSolicitud.articulos_cantidades.map((item, index) => {
                    const articulo = allArticles.find((a) => a.id === item.articulo_id);
                    return (
                      <div key={index} className="p-3 space-y-1">
                        <div className="font-medium">{articulo?.descripcion}</div>
                        <div className="text-sm text-muted-foreground">
                          Código: {articulo?.codigo_articulo}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm">Cantidad Solicitada:</span>
                          <Badge variant="secondary" className="font-semibold">
                            {item.cantidad} {articulo?.unidad}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Disponible en Stock:</span>
                          <span className="font-semibold text-sm">
                            {articulo?.existencia} {articulo?.unidad}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lado Derecho: Asignación de Cantidades (Editable) */}
          <Card>
            <CardHeader>
              <CardTitle>Asignación de Cantidades</CardTitle>
              <CardDescription>
                Define las cantidades a asignar para cada artículo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="font-semibold">Cantidades a Asignar</Label>
                <div className="space-y-3">
                  {cantidadesAsignadas.map((item, index) => {
                    const articulo = allArticles.find((a) => a.id === item.articulo_id);
                    const cantidadSolicitada = selectedSolicitud.articulos_cantidades[index].cantidad;
                    const stockDisponible = articulo?.existencia || 0;

                    return (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div>
                          <div className="font-medium">{articulo?.descripcion}</div>
                          <div className="text-sm text-muted-foreground">
                            Código: {articulo?.codigo_articulo}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Solicitado:</span>
                            <span className="font-semibold">{cantidadSolicitada}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stock:</span>
                            <span className={`font-semibold ${stockDisponible < cantidadSolicitada ? 'text-destructive' : 'text-green-600'}`}>
                              {stockDisponible}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`cantidad-${index}`}>
                            Cantidad a Asignar ({articulo?.unidad})
                          </Label>
                          <Input
                            id={`cantidad-${index}`}
                            type="number"
                            min="0"
                            max={Math.min(cantidadSolicitada, stockDisponible)}
                            value={item.cantidad}
                            onChange={(e) =>
                              handleCantidadChange(index, Number(e.target.value))
                            }
                            className="font-semibold"
                          />
                          {item.cantidad > stockDisponible && (
                            <p className="text-xs text-destructive">
                              ⚠ La cantidad excede el stock disponible
                            </p>
                          )}
                          {item.cantidad > cantidadSolicitada && (
                            <p className="text-xs text-destructive">
                              ⚠ La cantidad excede lo solicitado
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Solicitado:</span>
                  <span className="font-semibold">
                    {selectedSolicitud.articulos_cantidades.reduce(
                      (sum, item) => sum + item.cantidad,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total a Asignar:</span>
                  <span className="font-bold text-primary">
                    {cantidadesAsignadas.reduce(
                      (sum, item) => sum + item.cantidad,
                      0
                    )}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleCancelar} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleGuardarGestion} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar y Enviar a Gestión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista de tabla normal
  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes Aprobadas"
        description="Listado de solicitudes aprobadas listas para gestionar y asignar cantidades."
      />

      <DataTable
        columns={columns}
        data={solicitudes as any}
      />
    </div>
  );
}
