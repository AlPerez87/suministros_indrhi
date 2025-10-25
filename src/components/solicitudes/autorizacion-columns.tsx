"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AutorizacionSolicitud, EstadoSolicitud } from "@/lib/types";
import { articles } from "@/lib/data";
import { formatDate } from "@/lib/format-utils";

const estadoVariant: { [key in EstadoSolicitud]: "default" | "secondary" | "destructive" | "outline" } = {
  "Pendiente": "default",
  "En Autorización": "secondary",
  "Aprobada": "outline",
  "Rechazada": "destructive",
  "En Gestión": "secondary",
  "Despachada": "outline",
};

type ColumnsProps = {
  onViewDetails?: (solicitud: AutorizacionSolicitud) => void;
  onApprove?: (solicitud: AutorizacionSolicitud) => void;
  onReject?: (solicitud: AutorizacionSolicitud) => void;
};

export const getAutorizacionColumns = (props?: ColumnsProps): ColumnDef<AutorizacionSolicitud>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "numero_solicitud",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          N° Solicitud
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono font-semibold">
        #{row.getValue("numero_solicitud")}
      </div>
    ),
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.getValue("fecha") as Date;
      return formatDate(fecha);
    },
  },
  {
    accessorKey: "departamento",
    header: "Departamento",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("departamento")}</div>
    ),
  },
  {
    accessorKey: "articulos_cantidades",
    header: "Artículos",
    cell: ({ row }) => {
      const articulos_cantidades = row.getValue("articulos_cantidades") as AutorizacionSolicitud["articulos_cantidades"];
      const totalCantidad = articulos_cantidades?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
      return (
        <div className="text-sm">
          <span className="font-semibold">{articulos_cantidades?.length || 0}</span> tipo(s) /
          <span className="font-semibold ml-1">{totalCantidad}</span> unidades
        </div>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as EstadoSolicitud;
      return <Badge variant={estadoVariant[estado]}>{estado}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const solicitud = row.original;

      return (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            {props?.onViewDetails && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => props.onViewDetails?.(solicitud)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalles</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver detalles</p>
                </TooltipContent>
              </Tooltip>
            )}

            {props?.onApprove && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:text-green-600"
                    onClick={() => props.onApprove?.(solicitud)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="sr-only">Aprobar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Aprobar solicitud</p>
                </TooltipContent>
              </Tooltip>
            )}

            {props?.onReject && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => props.onReject?.(solicitud)}
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Rechazar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rechazar solicitud</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      );
    },
  },
];

