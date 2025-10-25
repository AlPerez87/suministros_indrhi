"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SupplyRequest, RequestStatus, User } from "@/lib/types";
import { articles, users } from "@/lib/data";
import { cn } from "@/lib/utils";

type GetColumnsProps = {
  currentUser: User;
  onStatusChange: (id: string, status: RequestStatus) => void;
  onDispatch: (request: SupplyRequest) => void;
};

const statusVariant: { [key in RequestStatus]: "default" | "secondary" | "destructive" | "outline" } = {
    Pending: "default",
    Approved: "secondary",
    Dispatched: "outline",
    Rejected: "destructive",
};

const statusTranslations: Record<RequestStatus, string> = {
  Pending: "Pendiente",
  Approved: "Aprobada",
  Rejected: "Rechazada",
  Dispatched: "Despachada",
};


export const getColumns = ({ currentUser, onStatusChange, onDispatch }: GetColumnsProps): ColumnDef<SupplyRequest>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-mono text-xs">#{row.getValue("id").split('-')[1]}</div>,
  },
  {
    accessorKey: "department",
    header: "Departamento",
  },
  {
    accessorKey: "userId",
    header: "Solicitante",
    cell: ({ row }) => {
        const userId = row.getValue("userId") as string;
        const user = users.find(u => u.id === userId);
        return user ? user.nombre : "Desconocido";
    }
  },
  {
    accessorKey: "items",
    header: "Artículos",
    cell: ({ row }) => {
        const items = row.getValue("items") as SupplyRequest["items"];
        return (
            <div className="text-xs">
                {items.map(item => {
                    const article = articles.find(a => a.id === item.articleId);
                    return <div key={item.articleId}>{item.quantity}x {article?.name || 'Artículo desconocido'}</div>
                })}
            </div>
        )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString();
    }
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as RequestStatus;
      return <Badge variant={statusVariant[status]}>{statusTranslations[status]}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const request = row.original;

      const canApprove = currentUser.role === "Admin" && request.status === "Pending";
      const canDispatch = currentUser.role === "Supply" && request.status === "Approved";
      const canCancel = currentUser.id === request.userId && request.status === "Pending";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(request.id)}>
              Copiar ID de solicitud
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canApprove && (
              <>
                <DropdownMenuItem onClick={() => onStatusChange(request.id, "Approved")}>
                  Aprobar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(request.id, "Rejected")}>
                  Rechazar
                </DropdownMenuItem>
              </>
            )}
            {canDispatch && (
              <DropdownMenuItem onClick={() => onDispatch(request)}>Despachar</DropdownMenuItem>
            )}
            {canCancel && (
                <DropdownMenuItem className="text-destructive" onClick={() => onStatusChange(request.id, "Rejected")}>
                    Cancelar Solicitud
                </DropdownMenuItem>
            )}
            {( !canApprove && !canDispatch && !canCancel) && (
                <DropdownMenuItem disabled>No hay acciones disponibles</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
