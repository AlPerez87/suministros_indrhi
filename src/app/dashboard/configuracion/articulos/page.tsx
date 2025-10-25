"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { getStoredArticles, addArticle, updateArticle, deleteArticle } from "@/lib/storage-api";
import { Article, UnidadArticulo } from "@/lib/types";
import { DataTable } from "@/components/articulos/data-table";
import { getColumns } from "@/components/articulos/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { ArticuloModal } from "@/components/articulos/articulo-modal";
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

export default function ArticulosPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [articulos, setArticulos] = useState<Article[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticulo, setEditingArticulo] = useState<Article | undefined>();
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
    const fetchArticulos = async () => {
      const data = await getStoredArticles();
      setArticulos(data);
    };
    fetchArticulos();
  }, []);

  if (isLoading) return <div>Cargando...</div>;
  if (!user || (user.rol !== 'SuperAdmin' && user.rol !== 'Supply')) {
    return null;
  }

  const handleCreateArticulo = async (data: any) => {
    try {
      const newArticulo: Article = {
        id: `art-${Date.now()}`,
        articulo: data.articulo,
        descripcion: data.descripcion,
        existencia: Number(data.existencia),
        cantidad_minima: Number(data.cantidad_minima),
        unidad: data.unidad,
        valor: Number(data.valor),
        valor_total: Number(data.valor) * Number(data.existencia),
        // Campos antiguos para compatibilidad
        name: data.descripcion,
        quantityInStock: Number(data.existencia),
        category: "General",
      };

      const updated = await addArticle(newArticulo);
      setArticulos(updated);

      toast({
        title: "Artículo Creado",
        description: `El artículo ${data.articulo} ha sido creado exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el artículo.",
      });
    }
  };

  const handleEditArticulo = async (data: any) => {
    if (!editingArticulo) return;

    try {
      const valor_total = Number(data.valor) * Number(data.existencia);
      
      const updated = await updateArticle(editingArticulo.id, {
        articulo: data.articulo,
        descripcion: data.descripcion,
        existencia: Number(data.existencia),
        cantidad_minima: Number(data.cantidad_minima),
        unidad: data.unidad,
        valor: Number(data.valor),
        valor_total,
        name: data.descripcion,
        quantityInStock: Number(data.existencia),
      });

      setArticulos(updated);
      setEditingArticulo(undefined);

      toast({
        title: "Artículo Actualizado",
        description: `El artículo ${data.articulo} ha sido actualizado exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el artículo.",
      });
    }
  };

  const handleDeleteArticulo = async () => {
    if (!deletingId) return;

    try {
      const articulo = articulos.find((a) => a.id === deletingId);
      const updated = await deleteArticle(deletingId);
      setArticulos(updated);
      setDeletingId(null);

      toast({
        title: "Artículo Eliminado",
        description: `El artículo ${articulo?.articulo} ha sido eliminado exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el artículo.",
      });
      setDeletingId(null);
    }
  };

  const handleOpenEdit = (articulo: Article) => {
    setEditingArticulo(articulo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArticulo(undefined);
  };

  const handleModalSave = (data: any) => {
    if (editingArticulo) {
      handleEditArticulo(data);
    } else {
      handleCreateArticulo(data);
    }
  };

  const handleCSVImport = async (data: any[]) => {
    try {
      // Transformar y validar los datos del CSV
      const articulosNuevos: Article[] = data.map((row, index) => {
        const existencia = Number(row.existencia) || 0;
        const valor = Number(row.valor) || 0;
        
        return {
          id: `art-${Date.now()}-${index}`,
          articulo: row.articulo || '',
          descripcion: row.descripcion || '',
          existencia,
          cantidad_minima: Number(row.cantidad_minima) || 0,
          unidad: (row.unidad || 'UNIDAD') as UnidadArticulo,
          valor,
          valor_total: valor * existencia,
          // Campos antiguos para compatibilidad
          name: row.descripcion || '',
          quantityInStock: existencia,
          category: "General",
        };
      });

      // Guardar cada artículo en la base de datos
      for (const articulo of articulosNuevos) {
        await addArticle(articulo);
      }

      // Refrescar la lista
      const updated = await getStoredArticles();
      setArticulos(updated);

      toast({
        title: "Importación Exitosa",
        description: `Se importaron ${articulosNuevos.length} artículos correctamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron importar los artículos.",
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
        title="Configuración de Artículos"
        description="Gestiona el catálogo de artículos disponibles en el sistema."
      >
        <div className="flex gap-2">
          {user?.role === 'SuperAdmin' && (
            <CSVImport
              onImport={handleCSVImport}
              title="Importar Artículos desde CSV"
              description="Importa un archivo CSV con los datos de los artículos. Esta acción eliminará todos los datos actuales."
              expectedHeaders={['articulo', 'descripcion', 'existencia', 'cantidad_minima', 'unidad', 'valor']}
              dataType="articulos"
            />
          )}
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Artículo
          </Button>
        </div>
      </PageHeader>
      
      <DataTable columns={columns} data={articulos} />

      <ArticuloModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        articulo={editingArticulo}
        onSave={handleModalSave}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El artículo será eliminado permanentemente del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteArticulo}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

