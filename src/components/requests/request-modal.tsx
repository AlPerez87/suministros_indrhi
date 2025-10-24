"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Article, User, SupplyRequest, RequestItem } from "@/lib/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  currentUser: User;
  onSubmit: (data: Omit<SupplyRequest, "id" | "createdAt" | "updatedAt">) => void;
};

export function RequestModal({
  isOpen,
  onClose,
  articles,
  currentUser,
  onSubmit,
}: RequestModalProps) {
  const [items, setItems] = useState<RequestItem[]>([
    { articleId: "", quantity: 1 },
  ]);
  const { toast } = useToast();

  const handleItemChange = (index: number, field: keyof RequestItem, value: string | number) => {
    const newItems = [...items];
    if (field === "quantity") {
      newItems[index][field] = Number(value) > 0 ? Number(value) : 1;
    } else {
      newItems[index][field] = value as string;
    }
    setItems(newItems);
  };

  const addItem = () => {
    if (items.length < 10) {
      setItems([...items, { articleId: "", quantity: 1 }]);
    } else {
      toast({
        variant: "destructive",
        title: "Límite Alcanzado",
        description: "Solo puedes añadir hasta 10 artículos por solicitud.",
      });
    }
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (items.some(item => !item.articleId || item.quantity <= 0)) {
        toast({
            variant: "destructive",
            title: "Artículos Inválidos",
            description: "Asegúrate de que todos los artículos estén seleccionados y las cantidades sean válidas.",
        });
        return;
    }
    
    const newRequest: Omit<SupplyRequest, "id" | "createdAt" | "updatedAt"> = {
        userId: currentUser.id,
        department: currentUser.department,
        status: "Pending",
        items,
    };
    onSubmit(newRequest);
    onClose();
    setItems([{ articleId: "", quantity: 1 }]);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Nueva Solicitud de Suministro</DialogTitle>
          <DialogDescription>
            Selecciona artículos y cantidades para tu solicitud. Máximo 10 artículos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr_100px_auto] items-end gap-2">
              <div>
                {index === 0 && <Label htmlFor={`article-${index}`}>Artículo</Label>}
                <Select
                  value={item.articleId}
                  onValueChange={(value) => handleItemChange(index, "articleId", value)}
                >
                  <SelectTrigger id={`article-${index}`}>
                    <SelectValue placeholder="Selecciona un artículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {articles.map((article) => (
                      <SelectItem key={article.id} value={article.id} disabled={items.some(i => i.articleId === article.id)}>
                        {article.name} (En inventario: {article.quantityInStock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                {index === 0 && <Label htmlFor={`quantity-${index}`}>Cantidad</Label>}
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  min="1"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addItem} disabled={items.length >= 10}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Artículo
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Enviar Solicitud</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
