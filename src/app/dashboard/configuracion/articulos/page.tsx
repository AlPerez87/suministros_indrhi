"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { getStoredArticles, addArticle, updateArticle, deleteArticle, saveArticles } from "@/lib/storage";
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
  const [articulos, setArticulos] = useState<Article[]>(() => 
    getStoredArticles()
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticulo, setEditingArticulo] = useState<Article | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user?.role !== 'SuperAdmin' && user?.role !== 'Supply') {
      toast({
        variant: "destructive",
        title: "Acceso Denegado",
        description: "No tienes permiso para ver esta página.",
      });
      router.replace('/dashboard');
    }
  }, [user, isLoading, router, toast]);

  if (isLoading) return <div>Cargando...</div>;
  if (!user || (user.role !== 'SuperAdmin' && user.role !== 'Supply')) {
    return null;
  }

  const handleCreateArticulo = (data: any) => {
    const newArticulo: Article = {
      id: `art-${Date.now()}`,
      codigo_articulo: data.codigo_articulo,
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

    const updated = addArticle(newArticulo);
    setArticulos(updated);

    toast({
      title: "Artículo Creado",
      description: `El artículo ${data.codigo_articulo} ha sido creado exitosamente.`,
    });
  };

  const handleEditArticulo = (data: any) => {
    if (!editingArticulo) return;

    const valor_total = Number(data.valor) * Number(data.existencia);
    
    const updated = updateArticle(editingArticulo.id, {
      codigo_articulo: data.codigo_articulo,
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
      description: `El artículo ${data.codigo_articulo} ha sido actualizado exitosamente.`,
    });
  };

  const handleDeleteArticulo = () => {
    if (!deletingId) return;

    const articulo = articulos.find((a) => a.id === deletingId);
    const updated = deleteArticle(deletingId);
    setArticulos(updated);
    setDeletingId(null);

    toast({
      title: "Artículo Eliminado",
      description: `El artículo ${articulo?.codigo_articulo} ha sido eliminado exitosamente.`,
    });
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
    // Transformar y validar los datos del CSV
    const articulos: Article[] = data.map((row, index) => {
      const existencia = Number(row.existencia) || 0;
      const valor = Number(row.valor) || 0;
      
      return {
        id: `art-${Date.now()}-${index}`,
        codigo_articulo: row.codigo_articulo || '',
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

    // Guardar los nuevos artículos (reemplaza solo artículos, no todo)
    saveArticles(articulos);
    setArticulos(articulos);
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
              expectedHeaders={['codigo_articulo', 'descripcion', 'existencia', 'cantidad_minima', 'unidad', 'valor']}
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

