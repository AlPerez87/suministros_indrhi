"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface CSVImportProps {
  onImport: (data: any[]) => Promise<void>;
  title: string;
  description: string;
  expectedHeaders: string[];
  dataType: "articulos" | "departamentos";
}

export function CSVImport({ 
  onImport, 
  title, 
  description, 
  expectedHeaders,
  dataType 
}: CSVImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona un archivo CSV válido.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo CSV está vacío.",
      });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const validationErrors: string[] = [];

    // Validar encabezados
    expectedHeaders.forEach(header => {
      if (!headers.includes(header)) {
        validationErrors.push(`Falta el encabezado: ${header}`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsDialogOpen(true);
      return;
    }

    // Parsear datos
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }

    if (data.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se encontraron datos válidos en el archivo.",
      });
      return;
    }

    setPreviewData(data);
    setErrors([]);
    setIsDialogOpen(true);
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    try {
      await onImport(previewData);
      toast({
        title: "Importación Exitosa",
        description: `Se han importado ${previewData.length} registros correctamente.`,
      });
      setIsDialogOpen(false);
      setPreviewData([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error en la Importación",
        description: "Ocurrió un error al importar los datos. Por favor, verifica el formato.",
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        Importar CSV
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {errors.length > 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Errores en el archivo CSV</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Vista Previa</AlertTitle>
                  <AlertDescription>
                    Se encontraron {previewData.length} registros listos para importar.
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>¡Atención!</AlertTitle>
                  <AlertDescription>
                    Esta acción eliminará TODOS los datos actuales de {dataType} y todas las solicitudes relacionadas. 
                    Esta operación no se puede deshacer.
                  </AlertDescription>
                </Alert>

                {previewData.length > 0 && (
                  <div className="max-h-60 overflow-auto border rounded-md p-4">
                    <p className="text-sm font-semibold mb-2">
                      Primeros 5 registros:
                    </p>
                    <pre className="text-xs">
                      {JSON.stringify(previewData.slice(0, 5), null, 2)}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setPreviewData([]);
                setErrors([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            {errors.length === 0 && (
              <Button
                onClick={handleConfirmImport}
                disabled={isProcessing}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isProcessing ? "Importando..." : "Confirmar Importación"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

