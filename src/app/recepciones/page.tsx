"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Printer, AlertTriangle } from "lucide-react";
import { RecepcionWizard } from "@/components/recepcion/RecepcionWizard";
import { getPendingOrders, processRecepcionItem } from "@/app/actions";

const LASA_MEDS = ["MED-001"]; // Hardcoded LASA mock

export default function RecepcionesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});
  const [wizardItem, setWizardItem] = useState<any>(null);

  const loadData = async () => {
    try {
      const data = await getPendingOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleOrder = (id: number) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openWizard = (item: any, orderId: number) => {
    const isLASA = LASA_MEDS.includes(item.producto.codigo);
    setWizardItem({ ...item, isLASA, orderId });
  };

  const handleWizardComplete = async (data: any) => {
    try {
      await processRecepcionItem(wizardItem.id, data);
      await loadData();
      setWizardItem(null);
    } catch(e: any) {
      alert("Error procesando recepción: " + e.message);
    }
  };

  const handleWizardCancel = () => {
    setWizardItem(null);
  };

  const handleResolveCuarentena = async (item: any) => {
    if (confirm("¿Marcar este ítem como resuelto y Aceptado?")) {
      await processRecepcionItem(item.id, {
        lote: "RESUELTO",
        cantidadRecibida: item.cantidad,
        temperatura: "",
        fechaVencimiento: new Date().toISOString(),
        defectosCriticos: 0,
        defectosMayores: 0,
        defectosMenores: 0,
        regSanitarioVerificado: true,
        evalEmpaque: 4,
        evalEtiqueta: 4,
        evalCaracteristicas: 4,
        puntajeFinal: 4,
        porcentaje: 100,
        estado: "ACEPTADO"
      } as any);
      await loadData();
    }
  };

  const handleRechazarCuarentena = async (item: any) => {
    if (confirm("¿Rechazar definitivamente este ítem (Devolución total)?")) {
      await processRecepcionItem(item.id, {
        lote: "RECHAZADO",
        cantidadRecibida: item.cantidad,
        temperatura: "",
        fechaVencimiento: new Date().toISOString(),
        defectosCriticos: 0,
        defectosMayores: 0,
        defectosMenores: 0,
        regSanitarioVerificado: false,
        evalEmpaque: 1,
        evalEtiqueta: 1,
        evalCaracteristicas: 1,
        puntajeFinal: 1,
        porcentaje: 0,
        estado: "RECHAZADO"
      } as any);
      await loadData();
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Recepción Técnica</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Planilla de control técnico y regulatorio para el ingreso de medicamentos.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-slate-500 font-medium">No hay órdenes pendientes de recepción.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const isExpanded = expandedOrders[order.id];
            const allProcessed = order.items.every((it: any) => it.estado !== "PENDIENTE");

            return (
              <Card key={order.id} className={`overflow-hidden border-2 ${allProcessed ? 'border-emerald-200' : 'border-slate-200'}`}>
                <div 
                  className={`p-4 cursor-pointer flex justify-between items-center ${allProcessed ? 'bg-emerald-50' : 'bg-slate-50 hover:bg-slate-100'} transition-colors`}
                  onClick={() => toggleOrder(order.id)}
                >
                  <div>
                    <h3 className="font-heading font-bold text-lg text-[#0F172A]">OC-{order.id} <span className="text-sm text-slate-500 font-medium ml-2">{order.proveedor?.razonSocial}</span></h3>
                    <p className="text-xs text-slate-500 mt-1">Esperada: {new Date(order.fechaEsperada).toLocaleDateString()} • Items: {order.items.length}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {allProcessed && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Recepción Finalizada</Badge>}
                    <span className="text-sm font-bold text-[#0EA5E9]">{isExpanded ? "Ocultar" : "Expandir"}</span>
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="p-0 border-t border-slate-200 bg-white">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="w-[30%]">Medicamento</TableHead>
                          <TableHead className="text-center">Cant. Esperada</TableHead>
                          <TableHead className="text-center">Estado</TableHead>
                          <TableHead className="w-[120px] text-center">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item: any) => {
                          const isLasa = LASA_MEDS.includes(item.producto.codigo);
                          return (
                            <TableRow key={item.id} className={`border-b border-slate-100 transition-colors ${item.estado === 'ACEPTADO' ? 'bg-emerald-50/50' : item.estado === 'CUARENTENA' ? 'bg-amber-50/50' : item.estado === 'RECHAZADO' ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                              <TableCell className="p-3 border-r border-slate-100">
                                <div className="font-bold text-[13px] text-[#0F172A]">{item.producto.nombre}</div>
                                {isLasa && (
                                  <Badge variant="destructive" className="mt-1 text-[9px] h-4 py-0 px-1.5 uppercase font-bold tracking-wider">
                                    <AlertTriangle className="w-2 h-2 mr-1" />
                                    ALERTA LASA
                                  </Badge>
                                )}
                                <div className="text-[11px] text-slate-500 mt-1">{item.producto.codigo}</div>
                              </TableCell>
                              <TableCell className="p-3 border-r border-slate-100 text-center font-mono font-medium">
                                {item.cantidad}
                              </TableCell>
                              <TableCell className="p-3 border-r border-slate-100 text-center">
                                {item.estado === "PENDIENTE" && <Badge variant="outline" className="text-slate-500">Pendiente</Badge>}
                                {item.estado === "CUARENTENA" && <Badge className="bg-amber-100 text-amber-700 border-amber-200">En Cuarentena</Badge>}
                                {item.estado === "RECHAZADO" && <Badge className="bg-rose-100 text-rose-700 border-rose-200">Devuelto</Badge>}
                                {item.estado === "ACEPTADO" && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Aceptado</Badge>}
                              </TableCell>
                              <TableCell className="p-3 text-center">
                                {item.estado === "PENDIENTE" ? (
                                  <Button 
                                    size="sm"
                                    className="h-8 w-full bg-[#0F172A] hover:bg-[#0EA5E9] text-white text-[11px] font-bold"
                                    onClick={(e) => { e.stopPropagation(); openWizard(item, order.id); }}
                                  >
                                    Procesar
                                  </Button>
                                ) : item.estado === "CUARENTENA" ? (
                                  <div className="flex flex-col gap-1">
                                    <Button size="sm" variant="outline" className="h-6 text-[9px] border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={(e) => { e.stopPropagation(); handleResolveCuarentena(item); }}>Resolver</Button>
                                    <Button size="sm" variant="outline" className="h-6 text-[9px] border-rose-500 text-rose-600 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); handleRechazarCuarentena(item); }}>Rechazar</Button>
                                  </div>
                                ) : item.estado === "RECHAZADO" ? (
                                  <span className="text-[10px] font-bold text-rose-500">DEVUELTO</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400">PROCESADO</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {wizardItem && (
        <RecepcionWizard
          item={{
            prodId: wizardItem.producto.codigo,
            nombre: wizardItem.producto.nombre,
            cantidadEsperada: wizardItem.cantidad,
            formaFarma: wizardItem.producto.presentacion,
            concentracion: wizardItem.producto.presentacion,
            laboratorio: wizardItem.proveedor?.razonSocial || "Lab Genérico",
            presentacion: wizardItem.producto.presentacion,
            regSanitario: "INVIMA-12345",
            isLASA: wizardItem.isLASA
          }}
          onSave={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}
    </div>
  );
}
