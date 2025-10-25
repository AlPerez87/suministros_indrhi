"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  getStoredSolicitudesGestionadas,
  deleteSolicitudGestionada,
  addSolicitudDespachada,
  updateSolicitudDepartamento,
  getStoredArticles,
} from "@/lib/storage-api";
import { SolicitudGestionada, SolicitudDespachada } from "@/lib/types";
import { DataTable } from "@/components/solicitudes/data-table";
import { getColumns } from "@/components/solicitudes/columns";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format-utils";
import { Send } from "lucide-react";

export default function SolicitudesGestionadasPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [solicitudes, setSolicitudes] = useState<SolicitudGestionada[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudGestionada | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allArticles, setAllArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [solData, artData] = await Promise.all([
          getStoredSolicitudesGestionadas(),
          getStoredArticles(),
        ]);
        setSolicitudes(Array.isArray(solData) ? solData : []);
        setAllArticles(Array.isArray(artData) ? artData : []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setSolicitudes([]);
        setAllArticles([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading && user?.rol !== "SuperAdmin" && user?.rol !== "Admin" && user?.rol !== "Supply") {
      toast({
        variant: "destructive",
        title: "Acceso Denegado",
        description: "No tienes permiso para ver esta página.",
      });
      router.replace("/dashboard");
    }
  }, [user, isLoading, router, toast]);

  if (isLoading) return <div>Cargando...</div>;
  if (!user || (user.rol !== "SuperAdmin" && user.rol !== "Admin" && user.rol !== "Supply")) {
    return null;
  }

  const handleViewDetails = (solicitud: SolicitudGestionada) => {
    setSelectedSolicitud(solicitud);
    setIsModalOpen(true);
  };

  const handleDespachar = () => {
    if (!selectedSolicitud || !user) return;

    // 1. Eliminar de solicitudes_gestionadas
    const updatedGestionadas = deleteSolicitudGestionada(selectedSolicitud.id);
    setSolicitudes(updatedGestionadas);

    // 2. Actualizar estado en solicitudes_departamentos
    updateSolicitudDepartamento(
      selectedSolicitud.id.replace("sol-ges-", "sol-dept-"),
      { estado: "Despachada" }
    );

    // 3. Agregar a solicitudes_despachadas
    const solicitudDespachada: SolicitudDespachada = {
      id: `sol-desp-${Date.now()}`,
      numero_solicitud: selectedSolicitud.numero_solicitud,
      fecha: selectedSolicitud.fecha,
      departamento: selectedSolicitud.departamento,
      articulos_cantidades: selectedSolicitud.articulos_cantidades,
      estado: "Despachada",
      despachado_por: user.nombre,
    };

    addSolicitudDespachada(solicitudDespachada);

    toast({
      title: "Solicitud Despachada",
      description: `Solicitud #${selectedSolicitud.numero_solicitud} ha sido despachada exitosamente.`,
    });

    setIsModalOpen(false);
    setSelectedSolicitud(null);
  };

  const columns = getColumns({
    onViewDetails: handleViewDetails,
  });

  // Calcular totales para la solicitud seleccionada
  const calcularTotales = () => {
    if (!selectedSolicitud) return { totalArticulos: 0, valorEstimado: 0 };

    const totalArticulos = selectedSolicitud.articulos_cantidades.reduce(
      (sum, item) => sum + item.cantidad,
      0
    );

    const valorEstimado = selectedSolicitud.articulos_cantidades.reduce((sum, item) => {
      const articulo = allArticles.find((a) => a.id === item.articulo_id);
      return sum + (articulo?.valor || 0) * item.cantidad;
    }, 0);

    return { totalArticulos, valorEstimado };
  };

  const { totalArticulos, valorEstimado } = calcularTotales();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes Gestionadas"
        description="Revisa y despacha las solicitudes gestionadas."
      />

      <DataTable
        columns={columns}
        data={solicitudes as any}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Vista Previa - Solicitud #{selectedSolicitud?.numero_solicitud}
            </DialogTitle>
            <DialogDescription>
              Revisa los detalles finales antes de despachar la solicitud.
            </DialogDescription>
          </DialogHeader>

          {selectedSolicitud && (
            <div className="space-y-6 py-4">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Número de Solicitud
                  </Label>
                  <div className="font-mono font-bold text-xl">
                    #{selectedSolicitud.numero_solicitud}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Estado</Label>
                  <div>
                    <Badge variant="secondary">{selectedSolicitud.estado}</Badge>
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
                  <div className="font-medium">
                    {formatDate(selectedSolicitud.fecha)}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Artículos Asignados */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">
                  Artículos a Despachar
                </Label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Código</th>
                        <th className="text-left p-3 font-semibold">Descripción</th>
                        <th className="text-left p-3 font-semibold">Unidad</th>
                        <th className="text-right p-3 font-semibold">Cantidad</th>
                        <th className="text-right p-3 font-semibold">Valor Unit.</th>
                        <th className="text-right p-3 font-semibold">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSolicitud.articulos_cantidades.map((item, index) => {
                        const articulo = allArticles.find(
                          (a) => a.id === item.articulo_id
                        );
                        const valorTotal = (articulo?.valor || 0) * item.cantidad;

                        return (
                          <tr
                            key={index}
                            className="border-t hover:bg-muted/50 transition-colors"
                          >
                            <td className="p-3 font-mono text-sm">
                              {articulo?.articulo || "N/A"}
                            </td>
                            <td className="p-3">
                              {articulo?.descripcion || "Artículo desconocido"}
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {articulo?.unidad || "N/A"}
                            </td>
                            <td className="p-3 text-right font-semibold">
                              {item.cantidad}
                            </td>
                            <td className="p-3 text-right text-sm">
                              RD$ {articulo?.valor.toFixed(2) || "0.00"}
                            </td>
                            <td className="p-3 text-right font-semibold">
                              RD$ {valorTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted font-semibold">
                      <tr>
                        <td colSpan={3} className="p-3 text-right">
                          TOTALES:
                        </td>
                        <td className="p-3 text-right">{totalArticulos}</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right text-lg">
                          RD$ {valorEstimado.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Resumen Final */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Artículos:</span>
                  <span className="font-semibold">{totalArticulos} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipos de Artículos:</span>
                  <span className="font-semibold">
                    {selectedSolicitud.articulos_cantidades.length} diferentes
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Valor Total a Despachar:</span>
                  <span className="font-bold text-primary">
                    RD$ {valorEstimado.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="text-muted-foreground">Despachado por:</span>
                  <span className="font-semibold">{user.nombre}</span>
                </div>
              </div>

              {/* Advertencia */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  ⚠️ <strong>Importante:</strong> Al despachar esta solicitud, se actualizará el
                  estado y se enviará a la tabla de solicitudes despachadas. Esta acción no se
                  puede deshacer.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={handleDespachar}>
              <Send className="mr-2 h-4 w-4" />
              Despachar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
