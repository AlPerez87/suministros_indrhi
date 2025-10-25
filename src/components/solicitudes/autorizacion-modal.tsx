"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AutorizacionSolicitud } from "@/lib/types";
import { getStoredArticles } from "@/lib/storage-api";
import { formatDate } from "@/lib/format-utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AutorizacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitud: AutorizacionSolicitud | null;
  onApprove: (solicitud: AutorizacionSolicitud) => void;
  onReject: (solicitud: AutorizacionSolicitud) => void;
}

export function AutorizacionModal({
  open,
  onOpenChange,
  solicitud,
  onApprove,
  onReject,
}: AutorizacionModalProps) {
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const arts = await getStoredArticles();
        setAllArticles(Array.isArray(arts) ? arts : []);
      } catch (error) {
        console.error("Error al cargar artículos:", error);
        setAllArticles([]);
      }
    };
    if (open && solicitud) {
      fetchArticles();
    }
  }, [open, solicitud]);

  if (!solicitud) return null;

  const handleConfirmApprove = () => {
    onApprove(solicitud);
    setShowApproveDialog(false);
    onOpenChange(false);
  };

  const handleConfirmReject = () => {
    onReject(solicitud);
    setShowRejectDialog(false);
    onOpenChange(false);
  };

  // Calcular total de artículos
  const totalArticulos = solicitud.articulos_cantidades.reduce(
    (sum, item) => sum + item.cantidad,
    0
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-2xl">
              Detalles de Solicitud #{solicitud.numero_solicitud}
            </DialogTitle>
            <DialogDescription>
              Revisa los detalles de la solicitud antes de aprobar o rechazar.
            </DialogDescription>
          </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
          {/* Información General */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Número de Solicitud
              </Label>
              <div className="font-mono font-bold text-xl">
                #{solicitud.numero_solicitud}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Estado</Label>
              <div>
                <Badge variant="secondary">{solicitud.estado}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Departamento</Label>
              <div className="font-medium text-lg">{solicitud.departamento}</div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Fecha</Label>
              <div className="font-medium">{formatDate(solicitud.fecha)}</div>
            </div>
          </div>

          <Separator />

          {/* Artículos Solicitados */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">
              Artículos Solicitados ({solicitud.articulos_cantidades.length})
            </Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-center w-[100px]">Unidad</TableHead>
                  <TableHead className="text-center w-[120px]">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitud.articulos_cantidades.map((item, index) => {
                  const articulo = allArticles.find(
                    (a) => a.id === item.articulo_id
                  );

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm font-medium">
                        {articulo?.articulo || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {articulo?.descripcion || "Artículo desconocido"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {articulo?.unidad || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-2xl font-bold text-primary">
                          {item.cantidad}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Resumen */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de Artículos:</span>
              <span className="font-semibold">{totalArticulos} unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipos de Artículos:</span>
              <span className="font-semibold">
                {solicitud.articulos_cantidades.length} diferentes
              </span>
            </div>
          </div>
          </div>
        </ScrollArea>
        </DialogContent>
      </Dialog>

    <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Aprobar esta solicitud?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás por aprobar la solicitud #{solicitud.numero_solicitud} del departamento de {solicitud.departamento}. La solicitud será movida a solicitudes aprobadas y estará lista para ser gestionada por el equipo de suministro.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmApprove}>
            Aprobar Solicitud
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Rechazar esta solicitud?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás por rechazar la solicitud #{solicitud.numero_solicitud} del departamento de {solicitud.departamento}. Esta acción cambiará el estado de la solicitud a "Rechazada" y el departamento será notificado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Rechazar Solicitud
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

