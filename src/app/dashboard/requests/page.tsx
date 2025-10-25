"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import {
  getStoredSolicitudesDepartamentos,
  getNextNumeroSolicitud,
  addAutorizacionSolicitud,
  updateSolicitudDepartamento,
  deleteSolicitudDepartamento,
  addSolicitudDepartamento,
} from "@/lib/storage-api";
import { SolicitudDepartamento, AutorizacionSolicitud } from "@/lib/types";
import { DataTable } from "@/components/solicitudes/data-table";
import { getColumns } from "@/components/solicitudes/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { SolicitudModal } from "@/components/solicitudes/solicitud-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RequestsPage() {
  const { user, isLoading } = useUser();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSolicitud, setEditingSolicitud] = useState<SolicitudDepartamento | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendingToAuthId, setSendingToAuthId] = useState<string | null>(null);
  const [solicitudes, setSolicitudes] = useState<SolicitudDepartamento[]>([]);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const data = await getStoredSolicitudesDepartamentos();
        setSolicitudes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        setSolicitudes([]);
      }
    };
    fetchSolicitudes();
  }, []);

  if (isLoading) return <div>Cargando...</div>;
  if (!user) return null;

  // Filtrar según el rol del usuario
  const solicitudesFiltradas = solicitudes.filter((sol) => {
    if (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "Supply") {
      return true; // Ver todas
    }
    if (user.role === "Department") {
      // Los usuarios de departamento solo ven sus propias solicitudes
      return sol.creado_por === user.id;
    }
    return false;
  });

  const handleCreateSolicitud = async (data: Partial<SolicitudDepartamento>) => {
    try {
      const nextNumber = await getNextNumeroSolicitud();
      const newSolicitud: SolicitudDepartamento = {
        id: `sol-dept-${Date.now()}`,
        numero_solicitud: nextNumber,
      fecha: new Date(),
      departamento: data.departamento!,
      articulos_cantidades: data.articulos_cantidades!,
      estado: "Pendiente",
      creado_por: user.id, // Guardar el ID del usuario que creó la solicitud
      };

      const updated = await addSolicitudDepartamento(newSolicitud);
      setSolicitudes(updated);

      toast({
        title: "Solicitud de Artículos Creada",
        description: `Solicitud de artículos #${newSolicitud.numero_solicitud} creada exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la solicitud.",
      });
    }
  };

  const handleEditSolicitud = async (data: Partial<SolicitudDepartamento>) => {
    if (!editingSolicitud) return;

    try {
      const updated = await updateSolicitudDepartamento(editingSolicitud.id, {
        departamento: data.departamento,
        articulos_cantidades: data.articulos_cantidades,
      });

      setSolicitudes(updated);
      setEditingSolicitud(undefined);

      toast({
        title: "Solicitud de Artículos Actualizada",
        description: `Solicitud de artículos #${editingSolicitud.numero_solicitud} actualizada exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la solicitud.",
      });
    }
  };

  const handleDeleteSolicitud = async () => {
    if (!deletingId) return;

    try {
      const solicitud = solicitudes.find((s) => s.id === deletingId);
      const updated = await deleteSolicitudDepartamento(deletingId);
      setSolicitudes(updated);
      setDeletingId(null);

      toast({
        title: "Solicitud de Artículos Eliminada",
        description: `Solicitud de artículos #${solicitud?.numero_solicitud} eliminada exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la solicitud.",
      });
      setDeletingId(null);
    }
  };

  const handleConfirmSendToAuthorization = async () => {
    if (!sendingToAuthId) return;

    try {
      const solicitud = solicitudes.find((s) => s.id === sendingToAuthId);
      if (!solicitud) return;

      // Actualizar estado de la solicitud en solicitudes_departamentos
      const updated = await updateSolicitudDepartamento(sendingToAuthId, {
        estado: "En Autorización",
      });
      setSolicitudes(updated);

      // Agregar a tabla de autorizaciones
      const autorizacion: AutorizacionSolicitud = {
        id: `aut-sol-${Date.now()}`,
        numero_solicitud: solicitud.numero_solicitud,
        fecha: solicitud.fecha,
        departamento: solicitud.departamento,
        articulos_cantidades: solicitud.articulos_cantidades,
        estado: "En Autorización",
      };

      await addAutorizacionSolicitud(autorizacion);

      toast({
        title: "Solicitud de Artículos Enviada",
        description: `Solicitud de artículos #${solicitud.numero_solicitud} enviada a autorización.`,
      });

      setSendingToAuthId(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la solicitud a autorización.",
      });
      setSendingToAuthId(null);
    }
  };

  const handleSendToAuthorization = (id: string) => {
    setSendingToAuthId(id);
  };

  const handleOpenEdit = (solicitud: SolicitudDepartamento) => {
    setEditingSolicitud(solicitud);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSolicitud(undefined);
  };

  const handleModalSave = (data: Partial<SolicitudDepartamento>) => {
    if (editingSolicitud) {
      handleEditSolicitud(data);
    } else {
      handleCreateSolicitud(data);
    }
  };

  // Determinar qué acciones están disponibles basadas en el rol del usuario
  const canEdit = user.role === "Department" || user.role === "SuperAdmin";
  const canDelete = user.role === "Department" || user.role === "SuperAdmin";
  const canSendToAuth = user.role === "Department" || user.role === "SuperAdmin";

  const columns = getColumns({
    onEdit: canEdit ? handleOpenEdit : undefined,
    onDelete: canDelete ? (id) => setDeletingId(id) : undefined,
    onSendToAuthorization: canSendToAuth ? (id) => setSendingToAuthId(id) : undefined,
    canEdit,
    canDelete,
    canSendToAuth,
    hideDepartmentColumn: user.role === "Department", // Ocultar columna de departamento para usuarios Department
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitud de artículos"
        description="Visualiza y gestiona las solicitudes de artículos de los departamentos."
      >
        {(user.role === "Department" || user.role === "SuperAdmin") && (
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Solicitud de Artículos
          </Button>
        )}
      </PageHeader>

      <DataTable 
        columns={columns} 
        data={solicitudesFiltradas} 
        showDepartmentFilter={user.role !== "Department"}
      />

      <SolicitudModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        solicitud={editingSolicitud}
        onSave={handleModalSave}
        defaultDepartamento={user.role === "Department" && user.department !== "Administración" ? user.department : undefined}
        hideExistencias={user.role === "Department"}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La solicitud será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSolicitud}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!sendingToAuthId} onOpenChange={() => setSendingToAuthId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Enviar solicitud a autorización?</AlertDialogTitle>
            <AlertDialogDescription>
              La solicitud #{solicitudes.find(s => s.id === sendingToAuthId)?.numero_solicitud} será enviada al equipo de autorización para su revisión. Una vez enviada, no podrás editar ni eliminar la solicitud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSendToAuthorization}>
              Enviar a Autorización
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
