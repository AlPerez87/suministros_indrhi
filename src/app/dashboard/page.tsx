"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { FileText, Users, ArrowRight, Package, CheckCircle, Clock, Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  getStoredSolicitudesDepartamentos, 
  getStoredArticles, 
  getStoredSolicitudesAprobadas,
  getStoredSolicitudesDespachadas,
  getStoredAutorizacionSolicitudes,
  getStoredDepartamentos
} from "@/lib/storage";

const PageHeader = ({ title, description }: { title: string, description?: string }) => (
  <div className="mb-6">
    <h1 className="font-headline text-3xl font-bold tracking-tight">{title}</h1>
    {description && <p className="text-muted-foreground">{description}</p>}
  </div>
);

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  // Obtener datos del sistema
  const solicitudes = getStoredSolicitudesDepartamentos();
  const articulos = getStoredArticles();
  const solicitudesAprobadas = getStoredSolicitudesAprobadas();
  const solicitudesDespachadas = getStoredSolicitudesDespachadas();
  const autorizaciones = getStoredAutorizacionSolicitudes();
  const departamentos = getStoredDepartamentos();

  // Filtrar solicitudes según el rol del usuario
  const solicitudesFiltradas = user.role === "Department" 
    ? solicitudes.filter(s => s.creado_por === user.id)
    : solicitudes;

  // Estadísticas generales (filtradas según el rol)
  const totalSolicitudes = solicitudesFiltradas.length;
  const solicitudesPendientes = solicitudesFiltradas.filter(s => s.estado === "Pendiente").length;
  const solicitudesEnAutorizacion = user.role === "Department" 
    ? solicitudesFiltradas.filter(s => s.estado === "En Autorización").length
    : autorizaciones.length;
  const totalDespachadas = user.role === "Department"
    ? solicitudesFiltradas.filter(s => s.estado === "Despachada").length
    : solicitudesDespachadas.length;
  
  // Artículos con bajo stock
  const articulosBajoStock = articulos.filter(a => a.existencia <= a.cantidad_minima).length;
  
  // Solicitudes por departamento (solo para SuperAdmin, Admin y Supply)
  const solicitudesPorDepartamento = (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "Supply")
    ? solicitudes.reduce((acc: { [key: string]: number }, sol) => {
        acc[sol.departamento] = (acc[sol.departamento] || 0) + 1;
        return acc;
      }, {})
    : {};
  
  const requestData = Object.entries(solicitudesPorDepartamento).map(([name, count]) => ({ 
    name, 
    solicitudes: count 
  }));

  // Solicitudes por estado (filtrado según el rol)
  const solicitudesAprobadasFiltradas = user.role === "Department"
    ? solicitudesFiltradas.filter(s => s.estado === "Aprobada").length
    : solicitudesAprobadas.length;

  const estadosData = [
    { name: "Pendiente", value: solicitudesPendientes, color: "#8b5cf6" },
    { name: "En Autorización", value: solicitudesEnAutorizacion, color: "#3b82f6" },
    { name: "Aprobadas", value: solicitudesAprobadasFiltradas, color: "#10b981" },
    { name: "Despachadas", value: totalDespachadas, color: "#6366f1" },
  ].filter(item => item.value > 0);

  const features = [
    {
      title: "Gestionar Solicitudes",
      description: "Ver, aprobar y despachar solicitudes de suministros.",
      href: "/dashboard/requests",
      icon: FileText,
      roles: ["SuperAdmin", "Admin", "Supply", "Department"],
    },
    {
      title: "Gestionar Usuarios",
      description: "Crear usuarios y gestionar sus roles.",
      href: "/dashboard/users",
      icon: Users,
      roles: ["SuperAdmin"],
    },
  ];

  const availableFeatures = features.filter((feature) =>
    feature.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Te damos la bienvenida, ${user.name}!`}
        description="Sistema Suministro INDRHI"
      />

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/requests">
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSolicitudes}</div>
              <p className="text-xs text-muted-foreground">
                {solicitudesPendientes} pendiente(s)
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/autorizaciones">
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Autorización</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{solicitudesEnAutorizacion}</div>
              <p className="text-xs text-muted-foreground">
                Esperando aprobación
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/gestion/despachadas">
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despachadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDespachadas}</div>
              <p className="text-xs text-muted-foreground">
                Solicitudes completadas
              </p>
            </CardContent>
          </Card>
        </Link>

        {(user.role === 'SuperAdmin' || user.role === 'Supply') && (
          <Link href="/dashboard/configuracion/articulos">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Artículos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{articulos.length}</div>
                <p className="text-xs text-muted-foreground">
                  {articulosBajoStock > 0 ? (
                    <span className="text-destructive font-semibold">
                      ⚠ {articulosBajoStock} con bajo stock
                    </span>
                  ) : (
                    "Stock normal"
                  )}
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        {(user.role === 'SuperAdmin' || user.role === 'Supply') && (
          <Link href="/dashboard/configuracion/departamentos">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departamentos.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total de departamentos
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableFeatures.map((feature) => (
            <Link href={feature.href} key={feature.title}>
              <Card className="h-full transform transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium font-headline">
                    {feature.title}
                  </CardTitle>
                  <feature.icon className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary">
                    Ir a la sección <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Gráficos - Solo para SuperAdmin, Admin y Supply */}
      {(user.role === 'SuperAdmin' || user.role === 'Admin' || user.role === 'Supply') && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Solicitudes por Departamento</CardTitle>
              <CardDescription>Distribución de solicitudes por departamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={requestData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Bar dataKey="solicitudes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Solicitudes"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Estados de Solicitudes</CardTitle>
              <CardDescription>Distribución actual por estado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadosData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {estadosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
