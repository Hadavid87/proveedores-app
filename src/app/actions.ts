"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- ORDENES DE COMPRA ---

export async function getOrdenes() {
  const data = await prisma.ordenCompra.findMany({
    include: {
      proveedor: true,
      items: {
        include: { producto: true }
      }
    },
    orderBy: { fechaEmision: "desc" }
  });
  return JSON.parse(JSON.stringify(data));
}

export async function createOrden(proveedorId: number, fechaEsperada: string, items: { prodId: string, cantidad: number, precio: number }[]) {
  // Encontrar productos por código
  const prodPromises = items.map(async item => {
    const p = await prisma.producto.findUnique({ where: { codigo: item.prodId } });
    if (!p) throw new Error(`Producto ${item.prodId} no encontrado`);
    return { productoId: p.id, cantidad: item.cantidad, precio: item.precio };
  });
  
  const mappedItems = await Promise.all(prodPromises);

  const orden = await prisma.ordenCompra.create({
    data: {
      proveedorId,
      fechaEsperada: new Date(fechaEsperada),
      estado: "EN_TIEMPO",
      items: {
        create: mappedItems
      }
    }
  });

  revalidatePath("/ordenes");
  revalidatePath("/recepciones");
  return orden;
}

export async function getPendingOrders() {
  const data = await prisma.ordenCompra.findMany({
    where: {
      estado: { in: ["EN_TIEMPO", "EN_TRANSITO"] }
    },
    include: {
      proveedor: true,
      items: {
        include: { producto: true, recepciones: true }
      }
    },
    orderBy: { fechaEmision: "asc" }
  });
  return JSON.parse(JSON.stringify(data));
}

// --- RECEPCION TECNICA ---

export async function processRecepcionItem(
  ordenCompraItemId: number,
  data: {
    lote: string;
    cantidadRecibida: number;
    temperatura: string;
    fechaVencimiento: string;
    defectosCriticos: number;
    defectosMayores: number;
    defectosMenores: number;
    regSanitarioVerificado: boolean;
    evalEmpaque: number;
    evalEtiqueta: number;
    evalCaracteristicas: number;
    puntajeFinal: number;
    porcentaje: number;
    estado: "ACEPTADO" | "CUARENTENA" | "RECHAZADO";
  }
) {
  // Crear el registro de recepción
  const recepcion = await prisma.recepcionTecnica.create({
    data: {
      ordenCompraItemId,
      lote: data.lote,
      cantidadRecibida: data.cantidadRecibida,
      temperatura: data.temperatura,
      fechaVencimiento: new Date(data.fechaVencimiento),
      defectosCriticos: data.defectosCriticos,
      defectosMayores: data.defectosMayores,
      defectosMenores: data.defectosMenores,
      regSanitarioVerificado: data.regSanitarioVerificado,
      evalEmpaque: data.evalEmpaque,
      evalEtiqueta: data.evalEtiqueta,
      evalCaracteristicas: data.evalCaracteristicas,
      puntajeFinal: data.puntajeFinal,
      porcentaje: data.porcentaje,
      estado: data.estado
    }
  });

  // Actualizar el estado del ítem de la orden
  await prisma.ordenCompraItem.update({
    where: { id: ordenCompraItemId },
    data: { estado: data.estado }
  });

  // Verificar si toda la orden está procesada
  const item = await prisma.ordenCompraItem.findUnique({ where: { id: ordenCompraItemId } });
  if (item) {
    const allItems = await prisma.ordenCompraItem.findMany({ where: { ordenCompraId: item.ordenCompraId } });
    const allProcessed = allItems.every(i => i.estado !== "PENDIENTE");
    
    if (allProcessed) {
      // Todo procesado, pero ver si hay algo rechazado/cuarentena
      const anyRejected = allItems.some(i => i.estado === "RECHAZADO" || i.estado === "CUARENTENA");
      await prisma.ordenCompra.update({
        where: { id: item.ordenCompraId },
        data: { estado: anyRejected ? "EN_TRANSITO" : "RECIBIDA" } // Simplified state logic
      });
    }
  }

  revalidatePath("/recepciones");
  revalidatePath("/ordenes");
  return recepcion;
}

// --- PROVEEDORES Y PRODUCTOS ---
export async function getProveedores() {
  const data = await prisma.proveedor.findMany({
    orderBy: { razonSocial: "asc" }
  });
  return JSON.parse(JSON.stringify(data));
}

export async function getProductos() {
  const data = await prisma.producto.findMany({
    include: {
      proveedores: {
        include: { proveedor: true }
      }
    }
  });
  return JSON.parse(JSON.stringify(data));
}

// --- BASIC SEED FOR TESTING ---
export async function ensureBasicData() {
  const countProv = await prisma.proveedor.count();
  if (countProv > 0) return { success: true };

  // Asegurar proveedores
  let prov1 = await prisma.proveedor.findFirst({ where: { nit: "900123456" } });
  if (!prov1) {
    prov1 = await prisma.proveedor.create({ data: { nit: "900123456", razonSocial: "PharmaCore Andina S.A.", emailLogistica: "logistica@pharmacore.com", kamNombre: "Juan Perez" } });
  }
  let prov2 = await prisma.proveedor.findFirst({ where: { nit: "900654321" } });
  if (!prov2) {
    prov2 = await prisma.proveedor.create({ data: { nit: "900654321", razonSocial: "OncoMeds Distribución SAS", emailLogistica: "ventas@oncomeds.com", kamNombre: "Maria Gomez" } });
  }

  // Asegurar productos
  let prod1 = await prisma.producto.findUnique({ where: { codigo: "MED-001" } });
  if (!prod1) {
    prod1 = await prisma.producto.create({ data: { codigo: "MED-001", nombre: "Dopamina", presentacion: "Ampolla 200mg/5ml", precioBase: 12500 } });
  }
  let prod2 = await prisma.producto.findUnique({ where: { codigo: "MED-002" } });
  if (!prod2) {
    prod2 = await prisma.producto.create({ data: { codigo: "MED-002", nombre: "Ranitidina", presentacion: "Tableta 150mg", precioBase: 800 } });
  }

  return { success: true };
}
