"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format-utils";
import { Edit, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type GetColumnsProps = {
  onEdit?: (articulo: Article) => void;
  onDelete?: (id: number) => void;
};

export const getColumns = (props?: GetColumnsProps): ColumnDef<Article>[] => [
  {
    accessorKey: "articulo",
    header: "Código",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.articulo}</div>;
    },
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "existencia",
    header: "Existencia",
    cell: ({ row }) => {
      const existencia = row.original.existencia;
      const minima = row.original.cantidad_minima;
      const isLow = existencia <= minima;
      
      return (
        <div className={isLow ? "text-destructive font-semibold" : ""}>
          {existencia}
          {isLow && " ⚠️"}
        </div>
      );
    },
  },
  {
    accessorKey: "cantidad_minima",
    header: "Mínimo",
  },
  {
    accessorKey: "unidad",
    header: "Unidad",
    cell: ({ row }) => {
      return (
        <Badge variant="secondary">
          {row.original.unidad}
        </Badge>
      );
    },
  },
  {
    accessorKey: "valor",
    header: "Precio Unit.",
    cell: ({ row }) => {
      return formatCurrency(row.original.valor);
    },
  },
  {
    accessorKey: "valor_total",
    header: "Valor Total",
    cell: ({ row }) => {
      return (
        <div className="font-semibold">
          {formatCurrency(row.original.valor_total)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const articulo = row.original;

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
                    onClick={() => props.onEdit?.(articulo)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar artículo</p>
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
                    onClick={() => props.onDelete?.(articulo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Eliminar artículo</p>
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

