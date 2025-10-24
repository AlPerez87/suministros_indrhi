"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Article, UnidadArticulo } from "@/lib/types";

const formSchema = z.object({
  codigo_articulo: z.string().min(1, "El código es obligatorio"),
  descripcion: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  existencia: z.coerce.number().min(0, "La existencia debe ser mayor o igual a 0"),
  cantidad_minima: z.coerce.number().min(0, "La cantidad mínima debe ser mayor o igual a 0"),
  unidad: z.enum(["UNIDAD", "RESMA", "BLOCKS O TALONARIO", "PAQUETE", "GALÓN", "YARDA", "LIBRA", "CAJA"] as const),
  valor: z.coerce.number().min(0, "El valor debe ser mayor o igual a 0"),
});

type ArticuloModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articulo?: Article;
  onSave: (data: z.infer<typeof formSchema>) => void;
};

export function ArticuloModal({
  open,
  onOpenChange,
  articulo,
  onSave,
}: ArticuloModalProps) {
  const unidades: UnidadArticulo[] = [
    "UNIDAD",
    "RESMA",
    "BLOCKS O TALONARIO",
    "PAQUETE",
    "GALÓN",
    "YARDA",
    "LIBRA",
    "CAJA",
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo_articulo: "",
      descripcion: "",
      existencia: 0,
      cantidad_minima: 0,
      unidad: "UNIDAD",
      valor: 0,
    },
  });

  useEffect(() => {
    if (articulo) {
      form.reset({
        codigo_articulo: articulo.codigo_articulo,
        descripcion: articulo.descripcion,
        existencia: articulo.existencia,
        cantidad_minima: articulo.cantidad_minima,
        unidad: articulo.unidad,
        valor: articulo.valor,
      });
    } else {
      form.reset({
        codigo_articulo: "",
        descripcion: "",
        existencia: 0,
        cantidad_minima: 0,
        unidad: "UNIDAD",
        valor: 0,
      });
    }
  }, [articulo, form, open]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {articulo ? "Editar Artículo" : "Nuevo Artículo"}
          </DialogTitle>
          <DialogDescription>
            {articulo
              ? "Modifica los detalles del artículo."
              : "Completa el formulario para agregar un nuevo artículo al catálogo."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo_articulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código del Artículo</FormLabel>
                    <FormControl>
                      <Input placeholder="ART-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de Medida</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unidades.map((unidad) => (
                          <SelectItem key={unidad} value={unidad}>
                            {unidad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción del artículo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="existencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Existencia</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cantidad_minima"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad Mínima</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Unitario (RD$)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {articulo ? "Guardar Cambios" : "Crear Artículo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

