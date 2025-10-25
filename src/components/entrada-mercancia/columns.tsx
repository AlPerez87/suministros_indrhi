"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EntradaMercancia } from "@/lib/types";
import { formatDate } from "@/lib/format-utils";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ColumnMeta {
  onViewDetails: (entrada: EntradaMercancia) => void;
}

export const getColumns = (meta: ColumnMeta): ColumnDef<EntradaMercancia>[] => [
  {
    accessorKey: "numero_entrada",
    header: "N° Entrada",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.original.numero_entrada}
        </div>
      );
    },
  },
  {
    accessorKey: "numero_orden",
    header: "N° Orden",
    cell: ({ row }) => {
      return <div className="text-sm font-mono">{row.original.numero_orden}</div>;
    },
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      return formatDate(row.original.fecha);
    },
  },
  {
    accessorKey: "suplidor",
    header: "Suplidor",
  },
  {
    accessorKey: "articulos_cantidades",
    header: "Artículos",
    cell: ({ row }) => {
      const cantidad = row.original.articulos_cantidades?.length || 0;
      return (
        <div className="text-muted-foreground">
          {cantidad} {cantidad === 1 ? "artículo" : "artículos"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => meta.onViewDetails(row.original)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalles
        </Button>
      );
    },
  },
];

