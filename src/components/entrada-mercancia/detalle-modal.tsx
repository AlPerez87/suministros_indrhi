"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntradaMercancia } from "@/lib/types";
import { formatDate } from "@/lib/format-utils";
import { getStoredArticles } from "@/lib/storage";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, FileText, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DetalleModalProps {
  entrada: EntradaMercancia | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetalleModal({ entrada, open, onOpenChange }: DetalleModalProps) {
  if (!entrada) return null;

  const articulos = getStoredArticles();
  const totalArticulos = entrada.articulos_cantidades.length;
  const totalCantidad = entrada.articulos_cantidades.reduce(
    (sum, item) => sum + item.cantidad,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Detalles de Entrada de Mercancía</DialogTitle>
          <DialogDescription>
            Información completa de la entrada #{entrada.numero_entrada}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Columna Izquierda - Información General */}
          <div className="w-80 border-r p-6 space-y-6 overflow-y-auto">
            <h3 className="font-semibold text-lg">Información General</h3>

            {/* Número de Entrada */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <Label className="text-xs">Número de Entrada</Label>
              </div>
              <div className="text-xl font-bold font-mono bg-primary/5 px-3 py-2 rounded border border-primary/20">
                {entrada.numero_entrada}
              </div>
            </div>

            {/* Número de Orden */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <Label className="text-xs">Número de Orden</Label>
              </div>
              <div className="text-sm font-mono bg-muted px-3 py-2 rounded break-all">
                {entrada.numero_orden}
              </div>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <Label className="text-xs">Fecha de Entrada</Label>
              </div>
              <div className="text-base font-medium">
                {formatDate(entrada.fecha)}
              </div>
            </div>

            {/* Suplidor */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <Label className="text-xs">Suplidor</Label>
              </div>
              <div className="text-base font-medium bg-muted px-3 py-2 rounded">
                {entrada.suplidor}
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 rounded-lg border-2 border-primary/30 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" />
                <span className="font-semibold">Resumen</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Artículos diferentes:</span>
                  <span className="text-3xl font-bold text-primary">{totalArticulos}</span>
                </div>
                <div className="h-px bg-primary/20" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cantidad total:</span>
                  <span className="text-2xl font-bold">{totalCantidad}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Artículos */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Artículos Ingresados</h3>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {totalArticulos} artículo{totalArticulos !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Tabla de Artículos */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[120px]">Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-center w-[150px]">Existencia Actual</TableHead>
                      <TableHead className="text-center w-[150px]">Cantidad Ingresada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entrada.articulos_cantidades.map((item, index) => {
                      const articulo = articulos.find((a) => a.id === item.articulo_id);
                      if (!articulo) return null;

                      return (
                        <TableRow key={index} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm font-medium">
                            {articulo.codigo_articulo}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{articulo.descripcion}</span>
                              <span className="text-xs text-muted-foreground">
                                Unidad: {articulo.unidad}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-semibold">
                              {articulo.existencia} {articulo.unidad}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-2xl font-bold text-primary">
                                {item.cantidad}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {articulo.unidad}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

