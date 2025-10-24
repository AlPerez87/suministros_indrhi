"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { 
  getStoredEntradasMercancia, 
  addEntradaMercancia,
  getStoredArticles,
  updateArticle
} from "@/lib/storage";
import { EntradaMercancia, ArticuloEntrada } from "@/lib/types";
import { DataTable } from "@/components/entrada-mercancia/data-table";
import { getColumns } from "@/components/entrada-mercancia/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { EntradaModal } from "@/components/entrada-mercancia/entrada-modal";
import { DetalleModal } from "@/components/entrada-mercancia/detalle-modal";

export default function EntradaMercanciaPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [entradas, setEntradas] = useState<EntradaMercancia[]>(() => 
    getStoredEntradasMercancia()
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [selectedEntrada, setSelectedEntrada] = useState<EntradaMercancia | null>(null);

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

  // Generar el próximo número de entrada
  const getNextNumeroEntrada = () => {
    const currentYear = new Date().getFullYear();
    const entradasDelAno = entradas.filter(e => 
      e.numero_entrada.includes(`-${currentYear}-`)
    );
    
    const maxNum = entradasDelAno.reduce((max, entrada) => {
      const match = entrada.numero_entrada.match(/EM-\d{4}-(\d{4})/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);

    const nextNum = maxNum + 1;
    return `EM-${currentYear}-${nextNum.toString().padStart(4, '0')}`;
  };

  const handleSaveEntrada = (data: {
    numero_orden_digitos: string;
    fecha: Date;
    suplidor: string;
    articulos_cantidades: ArticuloEntrada[];
  }) => {
    const currentYear = new Date().getFullYear();
    const numeroEntrada = getNextNumeroEntrada();
    const numeroOrden = `INDRHI-DAF-CD-${currentYear}-${data.numero_orden_digitos}`;

    const nuevaEntrada: EntradaMercancia = {
      id: `em-${Date.now()}`,
      numero_entrada: numeroEntrada,
      numero_orden: numeroOrden,
      fecha: data.fecha,
      suplidor: data.suplidor,
      articulos_cantidades: data.articulos_cantidades,
    };

    // Guardar la entrada
    const updatedEntradas = addEntradaMercancia(nuevaEntrada);
    setEntradas(updatedEntradas);

    // Actualizar existencia de artículos
    const articulos = getStoredArticles();
    data.articulos_cantidades.forEach((item) => {
      const articulo = articulos.find((a) => a.id === item.articulo_id);
      if (articulo) {
        const nuevaExistencia = articulo.existencia + item.cantidad;
        updateArticle(articulo.id, {
          existencia: nuevaExistencia,
          valor_total: articulo.valor * nuevaExistencia,
        });
      }
    });

    toast({
      title: "Entrada Registrada",
      description: `La entrada ${numeroEntrada} ha sido registrada exitosamente y el inventario ha sido actualizado.`,
    });

    setModalOpen(false);
  };

  const handleViewDetails = (entrada: EntradaMercancia) => {
    setSelectedEntrada(entrada);
    setDetalleModalOpen(true);
  };

  const columns = getColumns({
    onViewDetails: handleViewDetails,
  });

  if (isLoading) return <div>Cargando...</div>;
  if (!user || (user.role !== 'SuperAdmin' && user.role !== 'Supply')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entrada de Mercancía"
        description="Gestiona el registro de entradas de nuevos artículos al inventario."
      >
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Entrada
        </Button>
      </PageHeader>
      
      <DataTable columns={columns} data={entradas} />

      <EntradaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveEntrada}
        nextNumeroEntrada={getNextNumeroEntrada()}
      />

      <DetalleModal
        entrada={selectedEntrada}
        open={detalleModalOpen}
        onOpenChange={setDetalleModalOpen}
      />
    </div>
  );
}

