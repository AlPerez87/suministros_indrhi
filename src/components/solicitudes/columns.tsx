"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Send, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SolicitudDepartamento, EstadoSolicitud } from "@/lib/types";
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
  onEdit?: (solicitud: SolicitudDepartamento) => void;
  onDelete?: (id: string) => void;
  onSendToAuthorization?: (id: string) => void;
  onViewDetails?: (solicitud: SolicitudDepartamento) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canSendToAuth?: boolean;
  hideDepartmentColumn?: boolean;
};

export const getColumns = (props?: ColumnsProps): ColumnDef<SolicitudDepartamento>[] => {
  const columns: ColumnDef<SolicitudDepartamento>[] = [
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
  ];

  // Solo agregar columna de departamento si no se debe ocultar
  if (!props?.hideDepartmentColumn) {
    columns.push({
      accessorKey: "departamento",
      header: "Departamento",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("departamento")}</div>
      ),
    });
  }

  columns.push(
    {
      accessorKey: "articulos_cantidades",
      header: "Artículos",
      cell: ({ row }) => {
        const articulos_cantidades = row.getValue("articulos_cantidades") as SolicitudDepartamento["articulos_cantidades"];
        return (
          <div className="text-xs space-y-1">
            {articulos_cantidades.map((item, index) => {
              const articulo = articles.find((a) => a.id === item.articulo_id);
              return (
                <div key={index} className="flex items-center gap-1">
                  <span className="font-semibold">{item.cantidad}x</span>
                  <span className="text-muted-foreground">
                    {articulo?.descripcion || "Artículo desconocido"}
                  </span>
                </div>
              );
            })}
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
        const canEdit = props?.canEdit && solicitud.estado === "Pendiente";
        const canDelete = props?.canDelete && solicitud.estado === "Pendiente";
        const canSendToAuth = props?.canSendToAuth && solicitud.estado === "Pendiente";
        const hasActions = canEdit || canDelete || canSendToAuth || props?.onViewDetails;

        if (!hasActions) return null;

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

              {canEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => props?.onEdit?.(solicitud)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar solicitud</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {canSendToAuth && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary"
                      onClick={() => props?.onSendToAuthorization?.(solicitud.id)}
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Enviar a autorización</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enviar a autorización</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {canDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => props?.onDelete?.(solicitud.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar solicitud</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        );
      },
    }
  );

  return columns;
};

// Exportar columnas por defecto sin acciones
export const columns = getColumns();
