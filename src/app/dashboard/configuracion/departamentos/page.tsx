"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { 
  getStoredDepartamentos, 
  addDepartamento, 
  updateDepartamento, 
  deleteDepartamento
} from "@/lib/storage-api";
import { Departamento } from "@/lib/types";
import { DataTable } from "@/components/departamentos/data-table";
import { getColumns } from "@/components/departamentos/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { DepartamentoModal } from "@/components/departamentos/departamento-modal";
import { CSVImport } from "@/components/csv-import";
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

export default function DepartamentosPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user?.rol !== 'SuperAdmin' && user?.rol !== 'Supply') {
      toast({
        variant: "destructive",
        title: "Acceso Denegado",
        description: "No tienes permiso para ver esta página.",
      });
      router.replace('/dashboard');
    }
  }, [user, isLoading, router, toast]);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      const data = await getStoredDepartamentos();
      setDepartamentos(data);
    };
    fetchDepartamentos();
  }, []);

  if (isLoading) return <div>Cargando...</div>;
  if (!user || (user.rol !== 'SuperAdmin' && user.rol !== 'Supply')) {
    return null;
  }

  const handleCreateDepartamento = async (data: any) => {
    try {
      // Verificar si el código ya existe
      const codigoExiste = departamentos.some(
        (d) => d.codigo.toLowerCase() === data.codigo.toLowerCase()
      );

      if (codigoExiste) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Ya existe un departamento con ese código.",
        });
        return;
      }

      const newDepartamento: Departamento = {
        id: `dept-${Date.now()}`,
        codigo: data.codigo.toUpperCase(),
        departamento: data.departamento,
      };

      const updated = await addDepartamento(newDepartamento);
      setDepartamentos(updated);

      toast({
        title: "Departamento Creado",
        description: `El departamento ${data.departamento} ha sido creado exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el departamento.",
      });
    }
  };

  const handleEditDepartamento = async (data: any) => {
    if (!editingDepartamento) return;

    try {
      // Verificar si el código ya existe (excluyendo el actual)
      const codigoExiste = departamentos.some(
        (d) => 
          d.id !== editingDepartamento.id && 
          d.codigo.toLowerCase() === data.codigo.toLowerCase()
      );

      if (codigoExiste) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Ya existe un departamento con ese código.",
        });
        return;
      }

      const updated = await updateDepartamento(editingDepartamento.id, {
        codigo: data.codigo.toUpperCase(),
        departamento: data.departamento,
      });

      setDepartamentos(updated);
      setEditingDepartamento(undefined);

      toast({
        title: "Departamento Actualizado",
        description: `El departamento ${data.departamento} ha sido actualizado exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el departamento.",
      });
    }
  };

  const handleDeleteDepartamento = async () => {
    if (!deletingId) return;

    try {
      const departamento = departamentos.find((d) => d.id === deletingId);
      const updated = await deleteDepartamento(deletingId);
      setDepartamentos(updated);
      setDeletingId(null);

      toast({
        title: "Departamento Eliminado",
        description: `El departamento ${departamento?.departamento} ha sido eliminado exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el departamento.",
      });
      setDeletingId(null);
    }
  };

  const handleOpenEdit = (departamento: Departamento) => {
    setEditingDepartamento(departamento);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartamento(undefined);
  };

  const handleModalSave = (data: any) => {
    if (editingDepartamento) {
      handleEditDepartamento(data);
    } else {
      handleCreateDepartamento(data);
    }
  };

  const handleCSVImport = async (data: any[]) => {
    try {
      // Transformar y validar los datos del CSV
      const departamentosNuevos: Departamento[] = data.map((row, index) => {
        return {
          id: `dept-${Date.now()}-${index}`,
          codigo: (row.codigo || '').toUpperCase(),
          departamento: row.departamento || '',
        };
      });

      // Guardar cada departamento en la base de datos
      for (const dept of departamentosNuevos) {
        await addDepartamento(dept);
      }

      // Refrescar la lista
      const updated = await getStoredDepartamentos();
      setDepartamentos(updated);

      toast({
        title: "Importación Exitosa",
        description: `Se importaron ${departamentosNuevos.length} departamentos correctamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron importar los departamentos.",
      });
    }
  };

  const columns = getColumns({
    onEdit: handleOpenEdit,
    onDelete: (id) => setDeletingId(id),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración de Departamentos"
        description="Gestiona los departamentos de la organización."
      >
        <div className="flex gap-2">
          {user?.rol === 'SuperAdmin' && (
            <CSVImport
              onImport={handleCSVImport}
              title="Importar Departamentos desde CSV"
              description="Importa un archivo CSV con los datos de los departamentos. Esta acción eliminará todos los datos actuales."
              expectedHeaders={['codigo', 'departamento']}
              dataType="departamentos"
            />
          )}
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Departamento
          </Button>
        </div>
      </PageHeader>
      
      <DataTable columns={columns} data={departamentos} />

      <DepartamentoModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        departamento={editingDepartamento}
        onSave={handleModalSave}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El departamento será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDepartamento}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

