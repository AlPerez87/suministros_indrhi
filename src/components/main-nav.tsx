"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Users,
  FileText,
  FileDown,
  CheckSquare,
  ClipboardList,
  PackageOpen,
  Settings,
  ChevronDown,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useUser } from "@/hooks/use-user";

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (path: string) => pathname === path;

  if (!user) return null;

  const isActiveSection = (paths: string[]) => {
    return paths.some(path => pathname.startsWith(path));
  };

  return (
    <SidebarMenu>
      <SidebarGroup>
        <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
        
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/dashboard")}
            tooltip={{ children: "Panel" }}
          >
            <Link href="/dashboard">
              <Home />
              <span>Panel</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/dashboard/requests")}
            tooltip={{ children: "Solicitud de artículos" }}
          >
            <Link href="/dashboard/requests">
              <FileText />
              <span>Solicitud de artículos</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {(user.role === "SuperAdmin" || user.role === "Admin") && (
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard/autorizaciones")}
              tooltip={{ children: "Autorizaciones" }}
            >
              <Link href="/dashboard/autorizaciones">
                <CheckSquare />
                <span>Autorizaciones</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {(user.role === "SuperAdmin" || user.role === "Admin" || user.role === "Supply") && (
          <Collapsible asChild defaultOpen={isActiveSection(["/dashboard/gestion"])}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={{ children: "Gestión de Solicitudes" }}>
                  <ClipboardList />
                  <span>Gestión de solicitudes</span>
                  <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/dashboard/gestion/aprobadas")}>
                      <Link href="/dashboard/gestion/aprobadas">
                        <span>Solicitudes Aprobadas</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/dashboard/gestion/gestionar")}>
                      <Link href="/dashboard/gestion/gestionar">
                        <span>Solicitudes a Gestionar</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/dashboard/gestion/despachadas")}>
                      <Link href="/dashboard/gestion/despachadas">
                        <span>Solicitudes Despachadas</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )}

        {(user.role === "SuperAdmin" || user.role === "Supply") && (
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard/entrada-mercancia")}
              tooltip={{ children: "Entrada de Mercancía" }}
            >
              <Link href="/dashboard/entrada-mercancia">
                <PackageOpen />
                <span>Entrada de Mercancía</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarGroup>

      {user.role === "SuperAdmin" && (
        <SidebarGroup>
          <SidebarGroupLabel>Administración</SidebarGroupLabel>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard/users")}
              tooltip={{ children: "Usuarios" }}
            >
              <Link href="/dashboard/users">
                <Users />
                <span>Usuarios</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Collapsible asChild defaultOpen={isActiveSection(["/dashboard/configuracion"])}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={{ children: "Configuración" }}>
                  <Settings />
                  <span>Configuración</span>
                  <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/dashboard/configuracion/articulos")}>
                      <Link href="/dashboard/configuracion/articulos">
                        <span>Artículos</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/dashboard/configuracion/departamentos")}>
                      <Link href="/dashboard/configuracion/departamentos">
                        <span>Departamentos</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarGroup>
      )}

      {user.role === "Supply" && (
        <SidebarGroup>
          <SidebarGroupLabel>Configuración</SidebarGroupLabel>
          
          <Collapsible asChild defaultOpen={isActiveSection(["/dashboard/configuracion"])}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={{ children: "Configuración" }}>
                  <Settings />
                  <span>Configuración</span>
                  <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/dashboard/configuracion/articulos")}>
                      <Link href="/dashboard/configuracion/articulos">
                        <span>Artículos</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/dashboard/configuracion/departamentos")}>
                      <Link href="/dashboard/configuracion/departamentos">
                        <span>Departamentos</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarGroup>
      )}
    </SidebarMenu>
  );
}
