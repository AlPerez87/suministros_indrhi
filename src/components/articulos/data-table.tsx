"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "articulo",
      desc: false, // Orden ascendente
    },
  ]);
  const [showLowStock, setShowLowStock] = React.useState(false);

  // Filtrar datos según existencia baja si está activado el filtro
  const filteredData = React.useMemo(() => {
    if (!showLowStock) return data;
    if (!Array.isArray(data)) return [];
    return data.filter((item: any) => {
      const article = item as Article;
      return article.existencia <= article.cantidad_minima;
    });
  }, [data, showLowStock]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
  });

  // Contar artículos con existencia baja
  const lowStockCount = React.useMemo(() => {
    if (!Array.isArray(data)) return 0;
    return data.filter((item: any) => {
      const article = item as Article;
      return article.existencia <= article.cantidad_minima;
    }).length;
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Filtrar por descripción..."
          value={(table.getColumn("descripcion")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("descripcion")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filtrar por código..."
          value={(table.getColumn("articulo")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("articulo")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          variant={showLowStock ? "destructive" : "outline"}
          onClick={() => setShowLowStock(!showLowStock)}
          className="gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          {showLowStock ? "Mostrar Todos" : "Existencia Baja"}
          {lowStockCount > 0 && (
            <Badge variant={showLowStock ? "secondary" : "destructive"} className="ml-1">
              {lowStockCount}
            </Badge>
          )}
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const article = row.original as Article;
                const isLowStock = article.existencia <= article.cantidad_minima;
                
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={isLowStock ? "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

