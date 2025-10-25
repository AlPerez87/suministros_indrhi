"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SolicitudDepartamento, ArticuloCantidad } from "@/lib/types";
import { getStoredArticles, getStoredDepartamentos } from "@/lib/storage-api";
import { Trash2, Plus, Package, Search, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SolicitudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitud?: SolicitudDepartamento;
  onSave: (data: Partial<SolicitudDepartamento>) => void;
  defaultDepartamento?: string;
  hideExistencias?: boolean; // Ocultar existencias para usuarios Department
}

export function SolicitudModal({
  open,
  onOpenChange,
  solicitud,
  onSave,
  defaultDepartamento,
  hideExistencias = false,
}: SolicitudModalProps) {
  const [departamento, setDepartamento] = useState<string>("");
  const [articulos, setArticulos] = useState<ArticuloCantidad[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticuloId, setSelectedArticuloId] = useState("");
  const [cantidadInput, setCantidadInput] = useState("");
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [allDepartamentos, setAllDepartamentos] = useState<any[]>([]);

  // Cargar artículos y departamentos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [arts, depts] = await Promise.all([
          getStoredArticles(),
          getStoredDepartamentos(),
        ]);
        setAllArticles(Array.isArray(arts) ? arts : []);
        setAllDepartamentos(Array.isArray(depts) ? depts : []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setAllArticles([]);
        setAllDepartamentos([]);
      }
    };
    if (open) {
      fetchData();
    }
  }, [open]);

  // Filtrar artículos por búsqueda y excluir los ya agregados
  const articulosFiltrados = allArticles.filter((art) => {
    // Excluir artículos ya agregados
    const yaAgregado = articulos.some((a) => a.articulo_id === art.id);
    if (yaAgregado) return false;

    // Aplicar búsqueda
    const searchLower = searchTerm.toLowerCase();
    return (
      art.codigo_articulo.toLowerCase().includes(searchLower) ||
      art.descripcion.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    if (solicitud) {
      setDepartamento(solicitud.departamento);
      setArticulos(solicitud.articulos_cantidades || []);
    } else {
      setDepartamento(defaultDepartamento || "");
      setArticulos([]);
    }
    setSearchTerm("");
    setSelectedArticuloId("");
    setCantidadInput("");
  }, [solicitud, open, defaultDepartamento]);

  const handleAddArticulo = () => {
    if (!selectedArticuloId || !cantidadInput || parseInt(cantidadInput) <= 0) {
      alert("Por favor selecciona un artículo e ingresa una cantidad válida");
      return;
    }

    // Verificar si el artículo ya está agregado
    if (articulos.some((a) => a.articulo_id === selectedArticuloId)) {
      alert("Este artículo ya ha sido agregado");
      return;
    }

    const nuevoArticulo: ArticuloCantidad = {
      articulo_id: selectedArticuloId,
      cantidad: parseInt(cantidadInput),
    };

    setArticulos([...articulos, nuevoArticulo]);
    setSelectedArticuloId("");
    setCantidadInput("");
    setSearchTerm("");
  };

  const handleRemoveArticulo = (articulo_id: string) => {
    setArticulos(articulos.filter((a) => a.articulo_id !== articulo_id));
  };

  const handleUpdateCantidad = (articulo_id: string, cantidad: number) => {
    setArticulos(
      articulos.map((a) =>
        a.articulo_id === articulo_id ? { ...a, cantidad } : a
      )
    );
  };

  const handleSubmit = () => {
    if (!departamento) {
      alert("Por favor selecciona un departamento");
      return;
    }

    if (articulos.length === 0) {
      alert("Debes agregar al menos un artículo");
      return;
    }

    onSave({
      departamento,
      articulos_cantidades: articulos,
    });

    // Reset form
    setDepartamento(defaultDepartamento || "");
    setArticulos([]);
    setSearchTerm("");
    setSelectedArticuloId("");
    setCantidadInput("");
    onOpenChange(false);
  };

  const totalArticulos = articulos.length;
  const totalCantidad = articulos.reduce((sum, art) => sum + art.cantidad, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {solicitud ? "Editar Solicitud de Artículos" : "Nueva Solicitud de Artículos"}
          </DialogTitle>
          <DialogDescription>
            {solicitud
              ? "Modifica los detalles de la solicitud de artículos."
              : "Crea una nueva solicitud de artículos para tu departamento."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Columna Izquierda - Información General */}
          <div className="w-80 border-r p-6 space-y-4 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4">Información General</h3>

            {/* Departamento */}
            <div className="space-y-2">
              <Label htmlFor="departamento" className="text-xs text-muted-foreground">
                Departamento
              </Label>
              <Select
                value={departamento}
                onValueChange={setDepartamento}
                disabled={!!defaultDepartamento}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
                  {allDepartamentos.map((dept) => (
                    <SelectItem key={dept.id} value={dept.departamento}>
                      {dept.departamento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {defaultDepartamento && (
                <p className="text-xs text-muted-foreground">
                  El departamento está preseleccionado según tu usuario.
                </p>
              )}
            </div>

            <Separator />

            {/* Resumen */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Artículos:</span>
                <span className="text-2xl font-bold text-primary">{totalArticulos}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cantidad Total:</span>
                <span className="text-xl font-bold">{totalCantidad}</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Artículos */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 pb-4 space-y-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Artículos Solicitados</h3>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {totalArticulos} artículo{totalArticulos !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Agregar Artículo */}
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_150px_auto] gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Seleccionar Artículo</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Select value={selectedArticuloId} onValueChange={setSelectedArticuloId}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Buscar artículo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <Input
                              placeholder="Buscar por código o descripción..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="mb-2"
                            />
                          </div>
                          <ScrollArea className="h-[300px]">
                            {articulosFiltrados.length > 0 ? (
                              articulosFiltrados.map((art) => (
                                <SelectItem key={art.id} value={art.id}>
                                  <div className="flex flex-col">
                                    <span className="font-mono text-xs text-muted-foreground">
                                      {art.codigo_articulo}
                                    </span>
                                    <span className="font-medium">{art.descripcion}</span>
                                    {!hideExistencias && (
                                      <span className="text-xs text-muted-foreground">
                                        Disponible: {art.existencia} {art.unidad}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                {articulos.length > 0 
                                  ? "No hay más artículos disponibles"
                                  : "No se encontraron artículos"
                                }
                              </div>
                            )}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={cantidadInput}
                      onChange={(e) => setCantidadInput(e.target.value)}
                      placeholder="0"
                      className="text-center"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddArticulo();
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddArticulo}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Artículos Agregados */}
            <ScrollArea className="flex-1">
              {articulos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      {!hideExistencias && (
                        <TableHead className="text-center">Disponible</TableHead>
                      )}
                      <TableHead className="text-center w-[150px]">Cantidad Solicitada</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articulos.map((item) => {
                      const articulo = allArticles.find((a) => a.id === item.articulo_id);
                      if (!articulo) return null;

                      return (
                        <TableRow key={item.articulo_id}>
                          <TableCell className="font-mono text-sm">
                            {articulo.codigo_articulo}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{articulo.descripcion}</span>
                              <span className="text-xs text-muted-foreground">
                                {articulo.unidad}
                              </span>
                            </div>
                          </TableCell>
                          {!hideExistencias && (
                            <TableCell className="text-center">
                              <Badge variant="outline">
                                {articulo.existencia}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) =>
                                handleUpdateCantidad(
                                  item.articulo_id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="text-center font-semibold"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveArticulo(item.articulo_id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                  <FileText className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No hay artículos agregados</p>
                  <p className="text-sm">Selecciona artículos y agrega cantidades para comenzar</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={articulos.length === 0}
          >
            <FileText className="mr-2 h-4 w-4" />
            {solicitud ? "Guardar Cambios" : `Crear Solicitud (${totalArticulos} artículo${totalArticulos !== 1 ? 's' : ''})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

