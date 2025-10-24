"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User, Role, roleToSpanish } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Key, Trash2, Edit } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type GetColumnsProps = {
    onRoleChange: (userId: string, role: Role) => void;
    onPasswordChange: (userId: string, userName: string) => void;
    onDeleteUser: (userId: string, userName: string) => void;
    onEditUser: (user: User) => void;
};

const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
  };

export const getColumns = ({ onRoleChange, onPasswordChange, onDeleteUser, onEditUser }: GetColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
        const user = row.original;
        return (
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "department",
    header: "Departamento",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
        const user = row.original;
        const roles: Role[] = ["SuperAdmin", "Admin", "Supply", "Department"];

        return (
            <Select 
                defaultValue={user.role} 
                onValueChange={(value: Role) => onRoleChange(user.id, value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                    {roles.map(role => (
                        <SelectItem key={role} value={role}>{roleToSpanish[role]}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
        const user = row.original;
        return (
            <div className="flex gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEditUser(user)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar Usuario</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onPasswordChange(user.id, user.name)}
                            >
                                <Key className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Cambiar Contraseña</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteUser(user.id, user.name)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Eliminar Usuario</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        );
    }
  },
];
