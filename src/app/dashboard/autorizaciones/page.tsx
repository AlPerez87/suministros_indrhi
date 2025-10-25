"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  getStoredAutorizacionSolicitudes,
  deleteAutorizacionSolicitud,
  updateSolicitudDepartamento,
  addSolicitudAprobada,
} from "@/lib/storage-api";
import { AutorizacionSolicitud, SolicitudAprobada } from "@/lib/types";
import { DataTable } from "@/components/solicitudes/data-table";
import { getAutorizacionColumns } from "@/components/solicitudes/autorizacion-columns";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { AutorizacionModal } from "@/components/solicitudes/autorizacion-modal";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
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

export default function AutorizacionesPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [solicitudes, setSolicitudes] = useState<AutorizacionSolicitud[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<AutorizacionSolicitud | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<AutorizacionSolicitud[]>([]);
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const data = await getStoredAutorizacionSolicitudes();
        setSolicitudes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        setSolicitudes([]);
      }
    };
    fetchSolicitudes();
  }, []);

  useEffect(() => {
    if (!isLoading && user?.rol !== "SuperAdmin" && user?.rol !== "Admin") {
      toast({
        variant: "destructive",
        title: "Acceso Denegado",
        description: "No tienes permiso para ver esta página.",
      });
      router.replace("/dashboard");
    }
  }, [user, isLoading, router, toast]);

  if (isLoading) return <div>Cargando...</div>;
  if (!user || (user.rol !== "SuperAdmin" && user.rol !== "Admin")) {
    return null;
  }

  const handleViewDetails = (solicitud: AutorizacionSolicitud) => {
    setSelectedSolicitud(solicitud);
    setIsModalOpen(true);
  };

  const handleApprove = async (solicitud: AutorizacionSolicitud) => {
    try {
      // 1. Eliminar de autorizaciones
      const updatedAutorizaciones = await deleteAutorizacionSolicitud(solicitud.id);
      setSolicitudes(Array.isArray(updatedAutorizaciones) ? updatedAutorizaciones : []);

      // 2. Actualizar estado en solicitudes_departamentos
      await updateSolicitudDepartamento(
        // Buscar el ID original de la solicitud en solicitudes_departamentos
        // Por simplicidad, usaremos el mismo ID base
        solicitud.id.replace("aut-sol-", "sol-dept-"),
        { estado: "Aprobada" }
      );

      // 3. Agregar a solicitudes_aprobadas
      const solicitudAprobada: SolicitudAprobada = {
        id: `sol-apr-${Date.now()}`,
        numero_solicitud: solicitud.numero_solicitud,
        fecha: solicitud.fecha,
        departamento: solicitud.departamento,
        articulos_cantidades: solicitud.articulos_cantidades,
        estado: "Aprobada",
      };

      await addSolicitudAprobada(solicitudAprobada);

      toast({
        title: "Solicitud Aprobada",
        description: `Solicitud #${solicitud.numero_solicitud} ha sido aprobada exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aprobar la solicitud.",
      });
    }
  };

  const handleReject = async (solicitud: AutorizacionSolicitud) => {
    try {
      // 1. Eliminar de autorizaciones
      const updatedAutorizaciones = await deleteAutorizacionSolicitud(solicitud.id);
      setSolicitudes(Array.isArray(updatedAutorizaciones) ? updatedAutorizaciones : []);

      // 2. Actualizar estado en solicitudes_departamentos a "Rechazada"
      await updateSolicitudDepartamento(
        solicitud.id.replace("aut-sol-", "sol-dept-"),
        { estado: "Rechazada" }
      );

      toast({
        title: "Solicitud Rechazada",
        description: `Solicitud #${solicitud.numero_solicitud} ha sido rechazada.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo rechazar la solicitud.",
      });
    }
  };

  const handleBulkApprove = async () => {
    for (const solicitud of selectedRows) {
      await handleApprove(solicitud);
    }

    toast({
      title: "Solicitudes Aprobadas",
      description: `${selectedRows.length} solicitud(es) han sido aprobadas exitosamente.`,
    });

    setSelectedRows([]);
    setShowBulkApproveDialog(false);
  };

  const handleBulkReject = async () => {
    for (const solicitud of selectedRows) {
      await handleReject(solicitud);
    }

    toast({
      title: "Solicitudes Rechazadas",
      description: `${selectedRows.length} solicitud(es) han sido rechazadas.`,
      variant: "destructive",
    });

    setSelectedRows([]);
    setShowBulkRejectDialog(false);
  };

  const columns = getAutorizacionColumns({
    onViewDetails: handleViewDetails,
    onApprove: handleApprove,
    onReject: handleReject,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Autorizaciones"
        description="Revisa y autoriza las solicitudes pendientes de aprobación."
      >
        {selectedRows.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => setShowBulkApproveDialog(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprobar ({selectedRows.length})
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowBulkRejectDialog(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rechazar ({selectedRows.length})
            </Button>
          </div>
        )}
      </PageHeader>

      <DataTable
        columns={columns}
        data={solicitudes as any}
        onRowSelectionChange={setSelectedRows}
      />

      <AutorizacionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        solicitud={selectedSolicitud}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <AlertDialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Aprobar solicitudes seleccionadas?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás por aprobar {selectedRows.length} solicitud(es). Esta acción moverá las solicitudes a la lista de aprobadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkApprove}>
              Aprobar Todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rechazar solicitudes seleccionadas?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás por rechazar {selectedRows.length} solicitud(es). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Rechazar Todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
