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
  return JSON.parse(JSON.stringify(orden));
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
  return JSON.parse(JSON.stringify(recepcion));
}

// --- PROVEEDORES Y PRODUCTOS ---
export async function getProveedores() {
  const data = await prisma.proveedor.findMany({
    orderBy: { razonSocial: "asc" }
  });
  return JSON.parse(JSON.stringify(data));
}

export async function createProveedor(data: any) {
  const prov = await prisma.proveedor.create({
    data: {
      nit: data.nit,
      razonSocial: data.razonSocial,
      emailLogistica: data.emailLogistica,
      kamNombre: data.kamNombre,
      condicionPago: "CONTADO",
      estado: "ACTIVO"
    }
  });
  revalidatePath("/proveedores");
  return JSON.parse(JSON.stringify(prov));
}

export async function updateProveedor(id: number, data: any) {
  const prov = await prisma.proveedor.update({
    where: { id },
    data: {
      nit: data.nit,
      razonSocial: data.razonSocial,
      emailLogistica: data.emailLogistica,
      kamNombre: data.kamNombre,
      estado: data.estado
    }
  });
  revalidatePath("/proveedores");
  return JSON.parse(JSON.stringify(prov));
}

export async function deleteProveedor(id: number) {
  await prisma.proveedor.delete({ where: { id } });
  revalidatePath("/proveedores");
  return { success: true };
}

export async function importarProveedoresCSV(csvText: string) {
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length <= 1) throw new Error("El archivo no tiene datos válidos.");

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  let creados = 0;
  let omitidos = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 2) continue;

    // Default column order based on template: nit, razonSocial, emailLogistica, kamNombre, condicionPago
    const nit = values[0];
    const razonSocial = values[1];
    const emailLogistica = values[2] || "sin_correo@ejemplo.com";
    const kamNombre = values[3] || null;
    const condicionPagoRaw = values[4]?.toUpperCase();
    const condicionPago = (condicionPagoRaw === "CONTADO" || condicionPagoRaw === "CREDITO") ? condicionPagoRaw : "CONTADO";

    if (!nit || !razonSocial) {
      omitidos++;
      continue;
    }

    try {
      await prisma.proveedor.upsert({
        where: { nit },
        update: {
          razonSocial,
          emailLogistica,
          kamNombre,
          condicionPago: condicionPago as any,
        },
        create: {
          nit,
          razonSocial,
          emailLogistica,
          kamNombre,
          condicionPago: condicionPago as any,
          estado: "ACTIVO",
          puntajeActual: 5.00
        }
      });
      creados++;
    } catch (error) {
      console.error(`Error importando proveedor ${nit}:`, error);
      omitidos++;
    }
  }

  revalidatePath("/proveedores");
  return { creados, omitidos };
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
