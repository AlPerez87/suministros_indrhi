"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArticuloEntrada } from "@/lib/types";
import { getStoredArticles, getStoredEntradasMercancia } from "@/lib/storage-api";
import { Plus, Trash2, Search, Package, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface EntradaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entrada: {
    numero_orden_digitos: string;
    fecha: Date;
    suplidor: string;
    articulos_cantidades: ArticuloEntrada[];
  }) => void;
  nextNumeroEntrada: string;
}

export function EntradaModal({
  open,
  onOpenChange,
  onSave,
  nextNumeroEntrada,
}: EntradaModalProps) {
  const currentYear = new Date().getFullYear();
  const [numeroOrdenDigitos, setNumeroOrdenDigitos] = useState("");
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [suplidor, setSuplidor] = useState("");
  const [articulos, setArticulos] = useState<ArticuloEntrada[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticuloId, setSelectedArticuloId] = useState("");
  const [cantidadInput, setCantidadInput] = useState("");
  const [articulosDisponibles, setArticulosDisponibles] = useState<any[]>([]);
  const [entradasExistentes, setEntradasExistentes] = useState<any[]>([]);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [arts, entradas] = await Promise.all([
          getStoredArticles(),
          getStoredEntradasMercancia(),
        ]);
        setArticulosDisponibles(Array.isArray(arts) ? arts : []);
        setEntradasExistentes(Array.isArray(entradas) ? entradas : []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setArticulosDisponibles([]);
        setEntradasExistentes([]);
      }
    };
    if (open) {
      fetchData();
    }
  }, [open]);
  
  // Verificar si el número de orden ya existe
  const getNumeroOrdenCompleto = () => {
    if (numeroOrdenDigitos.length !== 4) return "";
    return `INDRHI-DAF-CD-${currentYear}-${numeroOrdenDigitos}`;
  };
  
  const numeroOrdenExiste = numeroOrdenDigitos.length === 4 && entradasExistentes.some(
    (e) => e.numero_orden === getNumeroOrdenCompleto()
  );
  
  // Verificar formato válido (exactamente 4 dígitos)
  const formatoInvalido = numeroOrdenDigitos.length > 0 && 
    (numeroOrdenDigitos.length !== 4 || !/^\d{4}$/.test(numeroOrdenDigitos));
  
  // Filtrar artículos por búsqueda y excluir los ya agregados
  const articulosFiltrados = articulosDisponibles.filter((art) => {
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

  // Inicializar con el próximo número disponible cuando se abre
  useEffect(() => {
    if (open && entradasExistentes.length >= 0) {
      // Calcular el próximo número disponible al abrir
      const entradasDelAno = entradasExistentes.filter((e) =>
        e.numero_orden?.includes(`-${currentYear}-`)
      );

      let nextNum = "0001";
      if (entradasDelAno.length > 0) {
        const numeros = entradasDelAno
          .map((e) => {
            const match = e.numero_orden.match(/INDRHI-DAF-CD-\d{4}-(\d{4})/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter((n) => n > 0);

        const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
        nextNum = String(maxNumero + 1).padStart(4, "0");
      }
      
      setNumeroOrdenDigitos(nextNum);
    } else if (!open) {
      // Resetear formulario cuando se cierra
      setNumeroOrdenDigitos("");
      setFecha(new Date().toISOString().split("T")[0]);
      setSuplidor("");
      setArticulos([]);
      setSearchTerm("");
      setSelectedArticuloId("");
      setCantidadInput("");
    }
  }, [open, currentYear, entradasExistentes]);

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

    const nuevoArticulo: ArticuloEntrada = {
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
    // Validaciones
    if (!suplidor.trim()) {
      alert("Por favor ingresa el nombre del suplidor");
      return;
    }

    if (formatoInvalido || numeroOrdenDigitos.length !== 4) {
      alert("El número de orden debe tener exactamente 4 dígitos numéricos");
      return;
    }

    // Validar que el número de orden no exista
    if (numeroOrdenExiste) {
      alert(`El número de orden ${getNumeroOrdenCompleto()} ya está registrado. Por favor, utiliza un número diferente.`);
      return;
    }

    if (articulos.length === 0) {
      alert("Debes agregar al menos un artículo");
      return;
    }

    onSave({
      numero_orden_digitos: numeroOrdenDigitos,
      fecha: new Date(fecha + "T00:00:00"),
      suplidor: suplidor.trim(),
      articulos_cantidades: articulos,
    });
  };

  const totalArticulos = articulos.length;
  const totalCantidad = articulos.reduce((sum, art) => sum + art.cantidad, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Nueva Entrada de Mercancía</DialogTitle>
          <DialogDescription>
            Registra la entrada de artículos al inventario. Las existencias se actualizarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Columna Izquierda - Información General */}
          <div className="w-80 border-r p-6 space-y-4 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4">Información General</h3>

            {/* Número de Entrada */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Número de Entrada</Label>
              <Input value={nextNumeroEntrada} disabled className="bg-muted font-mono" />
            </div>

            {/* Número de Orden */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Número de Orden</Label>
              <div className="space-y-1">
                <div className="text-xs font-mono text-muted-foreground px-3 py-2 bg-muted rounded">
                  INDRHI-DAF-CD-{currentYear}-
                </div>
                <Input
                  value={numeroOrdenDigitos}
                  onChange={(e) => {
                    // Permitir solo números y máximo 4 dígitos
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setNumeroOrdenDigitos(value);
                  }}
                  maxLength={4}
                  placeholder="0001"
                  className={`text-center font-mono text-lg ${
                    numeroOrdenExiste || formatoInvalido
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
              </div>
              {numeroOrdenExiste ? (
                <div className="flex items-start gap-1.5 text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">
                    Este número de orden ya está registrado. Por favor, usa uno diferente.
                  </p>
                </div>
              ) : formatoInvalido ? (
                <div className="flex items-start gap-1.5 text-amber-600">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">
                    El número debe tener exactamente 4 dígitos (ejemplo: 0001, 0002, 0123).
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Edita los 4 dígitos. Se asignó automáticamente el próximo número disponible.
                </p>
              )}
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fecha" className="text-xs text-muted-foreground">Fecha de Entrada</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            {/* Suplidor */}
            <div className="space-y-2">
              <Label htmlFor="suplidor" className="text-xs text-muted-foreground">Suplidor</Label>
              <Input
                id="suplidor"
                value={suplidor}
                onChange={(e) => setSuplidor(e.target.value)}
                placeholder="Nombre del suplidor"
              />
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
                  <h3 className="font-semibold text-lg">Artículos a Ingresar</h3>
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
                                    <span className="text-xs text-muted-foreground">
                                      Existencia: {art.existencia} {art.unidad}
                                    </span>
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
                      <TableHead className="text-center">Existencia Actual</TableHead>
                      <TableHead className="text-center w-[150px]">Cantidad a Ingresar</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articulos.map((item) => {
                      const articulo = articulosDisponibles.find((a) => a.id === item.articulo_id);
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
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {articulo.existencia}
                            </Badge>
                          </TableCell>
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
                  <Package className="h-16 w-16 mb-4 opacity-20" />
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
            disabled={articulos.length === 0 || numeroOrdenExiste || formatoInvalido}
          >
            <Package className="mr-2 h-4 w-4" />
            Registrar Entrada ({totalArticulos} artículo{totalArticulos !== 1 ? 's' : ''})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
