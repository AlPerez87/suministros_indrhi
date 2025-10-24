"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  getStoredSolicitudesDespachadas,
  getStoredArticles,
} from "@/lib/storage";
import { SolicitudDespachada } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";

export default function SolicitudesDespachadasPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [solicitudes, setSolicitudes] = useState<SolicitudDespachada[]>(() => 
    getStoredSolicitudesDespachadas()
  );
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudDespachada | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtro, setFiltro] = useState("");

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

  const handleViewDetails = (solicitud: SolicitudDespachada) => {
    setSelectedSolicitud(solicitud);
    setIsModalOpen(true);
  };

  // Filtrar solicitudes
  const solicitudesFiltradas = solicitudes.filter((sol) => {
    const searchTerm = filtro.toLowerCase();
    return (
      sol.numero_solicitud.toString().includes(searchTerm) ||
      sol.departamento.toLowerCase().includes(searchTerm) ||
      sol.despachado_por.toLowerCase().includes(searchTerm)
    );
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
        title="Solicitudes Despachadas"
        description="Registro histórico de solicitudes despachadas y completadas."
      />

      {/* Filtro de Búsqueda */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por número, departamento o despachador..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="secondary" className="text-sm">
          {solicitudesFiltradas.length} solicitud(es)
        </Badge>
      </div>

      {/* Tabla de Solicitudes Despachadas */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Solicitud</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Artículos</TableHead>
              <TableHead>Despachado Por</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudesFiltradas.length > 0 ? (
              solicitudesFiltradas.map((solicitud) => (
                <TableRow key={solicitud.id}>
                  <TableCell className="font-mono font-semibold">
                    #{solicitud.numero_solicitud}
                  </TableCell>
                  <TableCell>{formatDate(solicitud.fecha)}</TableCell>
                  <TableCell className="font-medium">
                    {solicitud.departamento}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {solicitud.articulos_cantidades.length} artículo(s)
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {solicitud.despachado_por}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{solicitud.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(solicitud)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No se encontraron solicitudes despachadas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Detalles */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Detalles de Solicitud Despachada #{selectedSolicitud?.numero_solicitud}
            </DialogTitle>
            <DialogDescription>
              Información completa de la solicitud despachada.
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
                    <Badge variant="outline">{selectedSolicitud.estado}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Departamento</Label>
                  <div className="font-medium text-lg">
                    {selectedSolicitud.departamento}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Fecha de Despacho</Label>
                  <div className="font-medium">
                    {formatDate(selectedSolicitud.fecha)}
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label className="text-sm text-muted-foreground">Despachado Por</Label>
                  <div>
                    <Badge variant="secondary" className="text-base px-4 py-2">
                      {selectedSolicitud.despachado_por}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Artículos Despachados */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">
                  Artículos Despachados
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
                              {articulo?.codigo_articulo || "N/A"}
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-800 font-medium">Total de Artículos:</span>
                  <span className="font-semibold text-green-900">
                    {totalArticulos} unidades
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800 font-medium">Tipos de Artículos:</span>
                  <span className="font-semibold text-green-900">
                    {selectedSolicitud.articulos_cantidades.length} diferentes
                  </span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-green-300">
                  <span className="font-semibold text-green-900">Valor Total Despachado:</span>
                  <span className="font-bold text-green-700">
                    RD$ {valorEstimado.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Información de Despacho */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="text-sm text-center text-muted-foreground">
                  ✓ Esta solicitud fue despachada exitosamente por{" "}
                  <strong>{selectedSolicitud.despachado_por}</strong> el{" "}
                  <strong>{formatDate(selectedSolicitud.fecha)}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
