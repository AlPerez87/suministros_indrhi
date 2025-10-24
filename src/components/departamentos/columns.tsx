"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Departamento } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type GetColumnsProps = {
  onEdit?: (departamento: Departamento) => void;
  onDelete?: (id: string) => void;
};

export const getColumns = (props?: GetColumnsProps): ColumnDef<Departamento>[] => [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="font-mono">
          {row.original.codigo}
        </Badge>
      );
    },
  },
  {
    accessorKey: "departamento",
    header: "Departamento",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.departamento}</div>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const departamento = row.original;

      return (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            {props?.onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => props.onEdit?.(departamento)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar departamento</p>
                </TooltipContent>
              </Tooltip>
            )}

            {props?.onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => props.onDelete?.(departamento.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Eliminar departamento</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      );
    },
  },
];

// Exportar columnas por defecto sin acciones
export const columns = getColumns();

