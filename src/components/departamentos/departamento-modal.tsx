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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Departamento } from "@/lib/types";

const formSchema = z.object({
  codigo: z.string().min(2, "El código debe tener al menos 2 caracteres").max(10, "El código no puede exceder 10 caracteres"),
  departamento: z.string().min(3, "El nombre del departamento debe tener al menos 3 caracteres"),
});

type DepartamentoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departamento?: Departamento;
  onSave: (data: z.infer<typeof formSchema>) => void;
};

export function DepartamentoModal({
  open,
  onOpenChange,
  departamento,
  onSave,
}: DepartamentoModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: "",
      departamento: "",
    },
  });

  useEffect(() => {
    if (departamento) {
      form.reset({
        codigo: departamento.codigo,
        departamento: departamento.departamento,
      });
    } else {
      form.reset({
        codigo: "",
        departamento: "",
      });
    }
  }, [departamento, form, open]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {departamento ? "Editar Departamento" : "Nuevo Departamento"}
          </DialogTitle>
          <DialogDescription>
            {departamento
              ? "Modifica los detalles del departamento."
              : "Completa el formulario para agregar un nuevo departamento."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código del Departamento</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: TEC, ADM, RRHH" 
                      {...field} 
                      className="uppercase"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Departamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Tecnología, Administración" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {departamento ? "Guardar Cambios" : "Crear Departamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

