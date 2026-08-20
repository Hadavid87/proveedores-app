"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CheckCircle2, ShieldAlert, AlertTriangle, Printer, Activity } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RecepcionWizard } from "@/components/recepcion/RecepcionWizard";

const mockProductosTechInfo: Record<string, any> = {
  "MED-001": { formaFarma: "Solución Inyectable", concentracion: "200mg/5ml", laboratorio: "PharmaCore Inc.", presentacion: "Caja x 10 Ampollas", regSanitario: "INVIMA 2019M-0012345", isLASA: true, tipoLASA: "Alto Riesgo" },
  "MED-002": { formaFarma: "Tableta Recubierta", concentracion: "150mg", laboratorio: "Genéricos del Valle", presentacion: "Caja x 30 Tabletas", regSanitario: "INVIMA 2020M-0087654", isLASA: false },
  "MED-003": { formaFarma: "Tableta", concentracion: "500mg", laboratorio: "BioTech", presentacion: "Caja x 100 Tabletas", regSanitario: "INVIMA 2018M-0001122", isLASA: true, tipoLASA: "Parecido Fonético" }
};

type RowState = {
  estado: string; // PENDIENTE, ACEPTADO, CUARENTENA
  techData?: any;
  evalData?: any;
  finalScore?: number;
};

export default function RecepcionesPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | "">("");
  const [rowsState, setRowsState] = useState<Record<string, RowState>>({});
  const [fechaActual, setFechaActual] = useState("");
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  
  const [activeItem, setActiveItem] = useState<any>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    setFechaActual(new Date().toLocaleDateString());
    const saved = localStorage.getItem('mockOrders');
    if (saved) {
      const allOrders = JSON.parse(saved);
      setPendingOrders(allOrders.filter((o: any) => o.estado !== "RECIBIDA" && o.estado !== "VENCIDA"));
    }
  }, []);

  const currentOrderRaw = pendingOrders.find(o => o.id === selectedOrderId);
  
  const currentOrder = currentOrderRaw ? {
    ...currentOrderRaw,
    items: currentOrderRaw.items.map((it: any) => ({
      ...it,
      cantidadEsperada: it.cantidad,
      ...(mockProductosTechInfo[it.prodId] || {
        formaFarma: "N/A", concentracion: "N/A", laboratorio: "N/A", presentacion: "N/A", regSanitario: "N/A", isLASA: false
      })
    }))
  } : null;

  const handleOrderSelect = (orderId: number) => {
    setSelectedOrderId(orderId);
    const order = pendingOrders.find(o => o.id === orderId);
    if (order) {
      const initialRowStates: Record<string, RowState> = {};
      order.items.forEach((item: any) => {
        initialRowStates[item.prodId] = { estado: "PENDIENTE" };
      });
      setRowsState(initialRowStates);
    }
  };

  const openWizard = (item: any) => {
    setActiveItem(item);
    setIsWizardOpen(true);
  };

  const handleWizardSave = (data: any) => {
    setRowsState(prev => ({
      ...prev,
      [activeItem.prodId]: {
        ...prev[activeItem.prodId],
        ...data
      }
    }));
    setIsWizardOpen(false);
    setActiveItem(null);
  };

  const handleFinishOrder = () => {
    const saved = localStorage.getItem('mockOrders');
    if (saved) {
      let allOrders = JSON.parse(saved);
      const orderIndex = allOrders.findIndex((o: any) => o.id === selectedOrderId);
      if (orderIndex >= 0) {
        allOrders[orderIndex].estado = "RECIBIDA";
        localStorage.setItem('mockOrders', JSON.stringify(allOrders));
        setPendingOrders(allOrders.filter((o: any) => o.estado !== "RECIBIDA" && o.estado !== "VENCIDA"));
        setSelectedOrderId("");
        setRowsState({});
        alert(`¡Recepción de la Orden OC-${selectedOrderId} finalizada correctamente! El estado ha cambiado a RECIBIDA.`);
      }
    }
  };

  const isOrderFullyProcessed = currentOrder ? currentOrder.items.every((it: any) => rowsState[it.prodId]?.estado !== "PENDIENTE") : false;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Recepción Técnica</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Planilla de control técnico y regulatorio para el ingreso de medicamentos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white border-slate-200 text-slate-600 shadow-sm h-10 px-4">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Acta Global
          </Button>
          <div className="w-[300px]">
            <select 
              className="w-full h-10 px-3 rounded-lg border border-slate-300 shadow-sm text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
              value={selectedOrderId}
              onChange={(e) => handleOrderSelect(Number(e.target.value))}
            >
              <option value="" disabled>1. Seleccione Orden de Compra...</option>
              {pendingOrders.map(o => (
                <option key={o.id} value={o.id}>OC-{o.id} - {o.proveedor}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {currentOrder ? (
        <Card className="shadow-md border-slate-200 overflow-hidden">
          <div className="p-4 bg-[#0F172A] flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <FileText className="w-5 h-5 text-[#0EA5E9]" />
              <h2 className="font-heading font-bold tracking-wide">ACTA DE RECEPCIÓN: OC-{currentOrder.id}</h2>
              <Badge className="bg-white/10 hover:bg-white/20 text-white border-none">{currentOrder.proveedor}</Badge>
            </div>
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Fecha: {fechaActual}</span>
          </div>
          
          <div className="overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader className="bg-slate-100">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Producto</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Forma Fceútica</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Concentración</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Lab. Fabricante</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Reg. Sanitario</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200 w-32">Cant. Esperada</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200 w-32 text-center">Estado</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 w-32 text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrder.items.map((item: any) => {
                  const state = rowsState[item.prodId] || { estado: "PENDIENTE" };
                  
                  return (
                    <TableRow key={item.prodId} className={`border-b border-slate-100 transition-colors ${state.estado === 'ACEPTADO' ? 'bg-emerald-50/50' : state.estado === 'CUARENTENA' ? 'bg-amber-50/50' : state.estado === 'RECHAZADO' ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                      <TableCell className="p-2 border-r border-slate-100">
                        <div className="font-bold text-[12px] text-[#0F172A]">{item.nombre}</div>
                        {item.isLASA && (
                          <div className="text-[9px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                            <Activity className="w-3 h-3"/> LASA: {item.tipoLASA}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-2 border-r border-slate-100 text-[11px] text-slate-600">{item.formaFarma}</TableCell>
                      <TableCell className="p-2 border-r border-slate-100 text-[11px] font-mono text-slate-600">{item.concentracion}</TableCell>
                      <TableCell className="p-2 border-r border-slate-100 text-[11px] text-slate-600">{item.laboratorio}</TableCell>
                      <TableCell className="p-2 border-r border-slate-100 text-[11px] text-slate-600 font-mono">{item.regSanitario}</TableCell>
                      
                      <TableCell className="p-2 border-r border-slate-100 font-bold text-slate-700">
                        {item.cantidadEsperada} und
                      </TableCell>
                      
                      <TableCell className="p-2 border-r border-slate-100 text-center">
                        {state.estado === "PENDIENTE" && <Badge variant="outline" className="text-slate-500">Pendiente</Badge>}
                        {state.estado === "CUARENTENA" && <Badge className="bg-amber-100 text-amber-700 border-amber-200">En Cuarentena</Badge>}
                        {state.estado === "RECHAZADO" && <Badge className="bg-rose-100 text-rose-700 border-rose-200">Devuelto</Badge>}
                        {state.estado === "ACEPTADO" && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Aceptado</Badge>}
                      </TableCell>
                      
                      <TableCell className="p-2 text-center">
                        {state.estado === "PENDIENTE" ? (
                          <Button 
                            size="sm"
                            className="h-8 w-full bg-[#0F172A] hover:bg-[#0EA5E9] text-white text-[11px] font-bold"
                            onClick={() => openWizard(item)}
                          >
                            Procesar
                          </Button>
                        ) : state.estado === "CUARENTENA" ? (
                          <div className="flex flex-col gap-1">
                             <Button size="sm" variant="outline" className="h-6 text-[9px] border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={() => {
                               if (confirm("¿Marcar este ítem como resuelto y Aceptado?")) {
                                  setRowsState(prev => ({ ...prev, [item.prodId]: { ...prev[item.prodId], estado: 'ACEPTADO' } }));
                               }
                             }}>Resolver</Button>
                             <Button size="sm" variant="outline" className="h-6 text-[9px] border-rose-500 text-rose-600 hover:bg-rose-50" onClick={() => {
                               if (confirm("¿Rechazar definitivamente este ítem (Devolución total)?")) {
                                  setRowsState(prev => ({ ...prev, [item.prodId]: { ...prev[item.prodId], estado: 'RECHAZADO' } }));
                               }
                             }}>Rechazar</Button>
                          </div>
                        ) : state.estado === "RECHAZADO" ? (
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
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
             <span className="text-xs text-slate-500">
                Verifique los medicamentos catalogados como LASA (Alto Riesgo / Parecido Fonético).
             </span>
             {isOrderFullyProcessed && (
                <Button 
                   className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold animate-in zoom-in duration-300"
                   onClick={handleFinishOrder}
                >
                   <CheckCircle2 className="w-4 h-4 mr-2" />
                   Finalizar y Cerrar Orden
                </Button>
             )}
          </div>
        </Card>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center min-h-[400px] text-slate-400">
          <FileText className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">Selecciona una Orden de Compra en la parte superior para visualizar la planilla.</p>
        </div>
      )}

      {/* Dialog for Wizard */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
         <DialogContent className="max-w-2xl p-0 border-none bg-transparent shadow-none">
            {activeItem && (
               <RecepcionWizard 
                  item={activeItem} 
                  onSave={handleWizardSave} 
                  onCancel={() => setIsWizardOpen(false)} 
               />
            )}
         </DialogContent>
      </Dialog>
    </div>
  );
}
