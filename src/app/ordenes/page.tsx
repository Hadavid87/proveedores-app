"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Clock, AlertTriangle, Truck, CheckCircle2 } from "lucide-react";

import { getOrdenes, createOrden, ensureBasicData, getProveedores, getProductos } from "@/app/actions";

function KanbanColumn({ title, icon, orders, colorClass, borderClass, onOrderClick }: { title: string, icon: React.ReactNode, orders: any[], colorClass: string, borderClass: string, onOrderClick: (o: any) => void }) {
  return (
    <div className="flex flex-col bg-[#F8FAFC] rounded-lg p-4 min-w-[320px] flex-1 border border-slate-200 shadow-sm">
      <div className={`flex items-center gap-2 mb-4 font-heading font-bold ${colorClass}`}>
        {icon}
        <h3 className="uppercase tracking-wide text-sm">{title} <span className="bg-white/70 px-2 py-0.5 rounded-full text-xs ml-1 shadow-sm">{orders.length}</span></h3>
      </div>
      <div className="space-y-3">
        {orders.map(order => {
          const totalStr = order.items ? order.items.reduce((acc: number, item: any) => acc + (Number(item.cantidad) * Number(item.precio)), 0).toLocaleString() : "0";
          return (
          <Card key={order.id} onClick={() => onOrderClick(order)} className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${borderClass}`}>
            <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-sm font-heading font-bold text-[#0F172A]">OC-{order.id}</CardTitle>
                <p className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-[180px]">{order.proveedor?.razonSocial || "Proveedor"}</p>
              </div>
              <span className="text-[11px] font-bold bg-[#F8FAFC] text-slate-600 px-2 py-1 rounded border border-slate-100">${totalStr}</span>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex justify-between items-center mt-2 border-t pt-2 border-slate-100">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Esperada:</span>
                <span className={`text-xs font-bold ${colorClass}`}>{new Date(order.fechaEsperada).toISOString().split('T')[0]}</span>
              </div>
            </CardContent>
          </Card>
        )})}
        {orders.length === 0 && (
          <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-sm text-slate-400 font-medium">No hay órdenes</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdenesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dbProveedores, setDbProveedores] = useState<any[]>([]);
  const [dbProductos, setDbProductos] = useState<any[]>([]);

  const loadData = async () => {
    try {
      await ensureBasicData(); // Seed testing data
      
      const [ordenesData, provsData, prodsData] = await Promise.all([
        getOrdenes(),
        getProveedores(),
        getProductos()
      ]);
      
      setOrders(ordenesData);
      setDbProveedores(provsData);
      
      // Transform products for the UI
      const mappedProds = prodsData.map((p: any) => ({
        id: p.codigo,
        nombre: p.nombre,
        presentacion: p.presentacion,
        precioBase: Number(p.precioBase),
        proveedores: p.proveedores.map((pp: any) => pp.proveedorId)
      }));
      setDbProductos(mappedProds);
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Modals state
  const [isEmitirOpen, setIsEmitirOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form State
  const [selectedProvId, setSelectedProvId] = useState<number | null>(null);
  const [fechaEsperada, setFechaEsperada] = useState("");
  const [items, setItems] = useState<{ prodId: string, nombre: string, cantidad: number, precio: number }[]>([]);
  
  const [selectedProdIdToAdd, setSelectedProdIdToAdd] = useState<string>("");
  const [cantidadToAdd, setCantidadToAdd] = useState<number>(1);

  // Productos disponibles según el proveedor seleccionado
  const availableProducts = useMemo(() => {
    if (!selectedProvId) return [];
    return dbProductos.filter(p => p.proveedores.includes(selectedProvId));
  }, [selectedProvId, dbProductos]);

  const formTotal = items.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);

  const handleOpenEmitir = () => {
    setSelectedProvId(null);
    setFechaEsperada("");
    setItems([]);
    setSelectedProdIdToAdd("");
    setCantidadToAdd(1);
    setIsEmitirOpen(true);
  };

  const handleAddItem = () => {
    const prod = availableProducts.find(p => p.id === selectedProdIdToAdd);
    if (!prod || cantidadToAdd <= 0) return;
    
    const existingIndex = items.findIndex(i => i.prodId === prod.id);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].cantidad += cantidadToAdd;
      setItems(newItems);
    } else {
      setItems([...items, { prodId: prod.id, nombre: prod.nombre, cantidad: cantidadToAdd, precio: prod.precioBase }]);
    }
    setCantidadToAdd(1);
    setSelectedProdIdToAdd("");
  };

  const handleRemoveItem = (prodId: string) => {
    setItems(items.filter(i => i.prodId !== prodId));
  };

  const handleCreateOrder = async () => {
    if (!selectedProvId || items.length === 0 || !fechaEsperada) return;
    try {
      await createOrden(selectedProvId, fechaEsperada, items);
      setIsEmitirOpen(false);
      await loadData();
    } catch(e: any) {
      alert("Error creando orden: " + e.message);
    }
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const emitidas = orders.filter(o => o.estado === "EMITIDA" || o.estado === "EN_TIEMPO");
  const enTransito = orders.filter(o => o.estado === "EN_TRANSITO");
  const recibidas = orders.filter(o => o.estado === "RECIBIDA");

  if (!isLoaded) return null;

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Órdenes de Compra</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Emisión y seguimiento logístico de órdenes de compra.
          </p>
        </div>
        <Button onClick={handleOpenEmitir} className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white font-semibold shadow-sm rounded-lg h-10 px-5">
          <Plus className="w-4 h-4 mr-2" />
          Emitir OC
        </Button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        <KanbanColumn 
          title="Emitidas" 
          icon={<Clock className="w-5 h-5" />} 
          orders={emitidas} 
          colorClass="text-slate-500" 
          borderClass="border-l-slate-400"
          onOrderClick={handleOrderClick}
        />
        <KanbanColumn 
          title="En Tránsito" 
          icon={<Truck className="w-5 h-5" />} 
          orders={enTransito} 
          colorClass="text-amber-500" 
          borderClass="border-l-amber-500"
          onOrderClick={handleOrderClick}
        />
        <KanbanColumn 
          title="Recibidas" 
          icon={<CheckCircle2 className="w-5 h-5" />} 
          orders={recibidas} 
          colorClass="text-emerald-600" 
          borderClass="border-l-emerald-500"
          onOrderClick={handleOrderClick}
        />
      </div>

      {/* MODAL: EMITIR OC */}
      <Dialog open={isEmitirOpen} onOpenChange={setIsEmitirOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-[#0F172A] text-xl">Emitir Nueva Orden de Compra</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proveedor</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                  value={selectedProvId || ""}
                  onChange={(e) => {
                    setSelectedProvId(Number(e.target.value));
                    setItems([]); // reset items if provider changes
                  }}
                >
                  <option value="" disabled>Seleccione un proveedor...</option>
                  {dbProveedores.map(p => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Esperada de Entrega</label>
                <Input type="date" value={fechaEsperada} onChange={e => setFechaEsperada(e.target.value)} />
              </div>

              {selectedProvId && (
                <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-lg space-y-4 mt-6">
                  <h4 className="font-heading font-bold text-[#0F172A] text-sm">Agregar Medicamento</h4>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                    value={selectedProdIdToAdd}
                    onChange={(e) => setSelectedProdIdToAdd(e.target.value)}
                  >
                    <option value="" disabled>Seleccione medicamento...</option>
                    {availableProducts.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.presentacion}) - ${p.precioBase}</option>)}
                  </select>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input type="number" min="1" placeholder="Cantidad" value={cantidadToAdd || ""} onChange={e => setCantidadToAdd(Number(e.target.value))} />
                    </div>
                    <Button onClick={handleAddItem} disabled={!selectedProdIdToAdd || cantidadToAdd <= 0} className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
                      Agregar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
              <div className="p-3 bg-[#0F172A] text-white font-heading font-bold text-sm">
                Líneas de la Orden ({items.length})
              </div>
              <div className="flex-1 overflow-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-8 text-[11px] py-1">Item</TableHead>
                      <TableHead className="h-8 text-[11px] py-1 text-center">Cant.</TableHead>
                      <TableHead className="h-8 text-[11px] py-1 text-right">Subtotal</TableHead>
                      <TableHead className="h-8 w-10 py-1"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length > 0 ? items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="py-2 text-[12px] font-medium">{it.nombre}</TableCell>
                        <TableCell className="py-2 text-[12px] text-center">{it.cantidad}</TableCell>
                        <TableCell className="py-2 text-[12px] text-right font-mono">${(it.cantidad * it.precio).toLocaleString()}</TableCell>
                        <TableCell className="py-2 text-right">
                          <button onClick={() => handleRemoveItem(it.prodId)} className="text-rose-500 hover:text-rose-700 font-bold text-xs">
                            Eliminar
                          </button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-xs text-slate-400">Sin items agregados</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 bg-[#F8FAFC] border-t border-slate-200 flex justify-between items-center">
                <span className="font-heading font-bold text-slate-600 text-sm">TOTAL OC:</span>
                <span className="font-heading font-bold text-lg text-[#0F172A]">${formTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmitirOpen(false)}>Cancelar</Button>
            <Button disabled={items.length === 0 || !fechaEsperada || !selectedProvId} onClick={handleCreateOrder} className="bg-[#0F172A] text-white hover:bg-[#0F172A]/90">
              Generar Orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: DETALLE OC */}
      {selectedOrder && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading font-bold text-[#0F172A]">OC-{selectedOrder.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Proveedor</p>
                <p className="font-medium text-sm">{selectedOrder.proveedor}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Esperada</p>
                <p className="font-medium text-sm">{selectedOrder.fechaEsperada}</p>
              </div>
              <div className="pt-2">
                <p className="text-xs font-bold text-[#0EA5E9] uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Medicamentos Solicitados</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-[#F8FAFC] rounded border border-slate-100">
                      <span><span className="font-bold mr-2">{it.cantidad}x</span> {it.nombre}</span>
                      <span className="font-mono text-slate-600">${(it.cantidad * it.precio).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-4">
                <span className="font-bold text-slate-700">Total:</span>
                <span className="font-heading font-bold text-xl text-[#0F172A]">${selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsDetailOpen(false)}>Cerrar Detalle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
