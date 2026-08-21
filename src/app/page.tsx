"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, ShoppingCart, Package, ArrowRight, TrendingDown, Star, AlertTriangle, Search, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Link from "next/link";

const dataOrders = [
  { name: 'Mar', ordenes: 45 },
  { name: 'Abr', ordenes: 52 },
  { name: 'May', ordenes: 48 },
  { name: 'Jun', ordenes: 61 },
  { name: 'Jul', ordenes: 59 },
  { name: 'Ago', ordenes: 74 },
];

const dataRecepciones = [
  { name: 'Aprobadas', value: 75, color: '#10B981' },
  { name: 'Cuarentena', value: 15, color: '#F59E0B' },
  { name: 'Rechazadas', value: 10, color: '#EF4444' },
];

const topProveedores = [
  { id: 1, nombre: 'PharmaCore Andina', puntaje: 4.9, envios: 142 },
  { id: 2, nombre: 'BioTech Solutions', puntaje: 4.7, envios: 89 },
  { id: 3, nombre: 'OncoMeds Dist.', puntaje: 4.6, envios: 56 },
];

const lowProveedores = [
  { id: 4, nombre: 'MedGlobal Ltda.', puntaje: 3.2, envios: 12 },
  { id: 5, nombre: 'Insumos Clínicos S.A.', puntaje: 2.8, envios: 4 },
];

const alertasVencimiento = [
  { cod: 'MED-042', nombre: 'Ciclofosfamida 1g', venceEn: '15 días', stock: 'Bajo' },
  { cod: 'MED-118', nombre: 'Doxorrubicina 50mg', venceEn: '28 días', stock: 'Medio' },
  { cod: 'MED-009', nombre: 'Ondansetrón 8mg', venceEn: '45 días', stock: 'Alto' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Panel de Control</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Resumen operativo y alertas gerenciales de OncoCenter.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Link href="/evaluaciones">
            <Button variant="outline" className="bg-white border-slate-200 text-slate-700 shadow-sm">
              <Star className="w-4 h-4 mr-2 text-amber-500" />
              Evaluar Proveedor
            </Button>
          </Link>
          <Link href="/recepciones">
            <Button variant="outline" className="bg-white border-slate-200 text-slate-700 shadow-sm">
              <Package className="w-4 h-4 mr-2 text-emerald-500" />
              Nueva Recepción
            </Button>
          </Link>
          <Link href="/ordenes">
            <Button className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white shadow-sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Crear Orden
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-heading font-bold text-[#0F172A]">Proveedores Activos</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">128</div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1 rotate-180" />
              +4 este mes
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-heading font-bold text-[#0F172A]">Órdenes Pendientes</CardTitle>
            <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">15</div>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center">
              3 por vencer entrega
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-heading font-bold text-[#0F172A]">Recepciones del Mes</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Package className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">284</div>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center">
              98% cumplimiento AQL
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-100 bg-red-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-heading font-bold text-red-700">Alertas de Calidad (CAPA)</CardTitle>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">3</div>
            <p className="text-xs text-red-600/80 font-medium mt-1 flex items-center">
              Proveedores en riesgo crítico
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHARTS */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-heading font-bold text-[#0F172A]">Evolución de Órdenes de Compra</CardTitle>
              <CardDescription>Volumen mensual de órdenes generadas en los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataOrders} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip 
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="ordenes" fill="#0EA5E9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* RANKING TABLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading font-bold text-[#0F172A] flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Top Proveedores
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="divide-y divide-slate-100">
                  {topProveedores.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{p.nombre}</p>
                        <p className="text-[11px] text-slate-500">{p.envios} envíos completados</p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">{p.puntaje}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-red-200 bg-red-50/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading font-bold text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Proveedores en Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="divide-y divide-red-100">
                  {lowProveedores.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-6 py-3 hover:bg-red-50/50">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{p.nombre}</p>
                        <p className="text-[11px] text-slate-500">Requiere plan de mejora</p>
                      </div>
                      <Badge className="bg-red-50 text-red-700 border-red-200 font-bold">{p.puntaje}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT PANEL - DONUT & ALERTS */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-heading font-bold text-[#0F172A]">Estado de Recepciones</CardTitle>
              <CardDescription>Calidad de entregas del mes actual</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataRecepciones}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {dataRecepciones.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-amber-200 bg-amber-50/20">
            <CardHeader className="pb-3 border-b border-amber-100">
              <CardTitle className="text-sm font-heading font-bold text-amber-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Alertas de Vencimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="divide-y divide-amber-100">
                {alertasVencimiento.map((item, idx) => (
                  <div key={idx} className="p-4 hover:bg-amber-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">{item.cod}</span>
                      <span className="text-xs font-bold text-red-600 flex items-center"><CalendarIcon className="w-3 h-3 mr-1"/>{item.venceEn}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{item.nombre}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-amber-100 bg-amber-50/50">
                <Link href="/medicamentos" className="text-xs font-bold text-amber-700 flex items-center justify-center hover:underline">
                  Ver inventario completo <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
