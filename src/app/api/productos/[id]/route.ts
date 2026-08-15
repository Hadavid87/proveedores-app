import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  const pool = new Pool({ connectionString: process.env.DIRECT_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    // Check if exists and get file
    const prod = await prisma.producto.findUnique({ where: { id } });
    if (!prod) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // Delete file if exists
    if (prod.fichaTecnicaUrl) {
      const filepath = path.join(process.cwd(), 'public', prod.fichaTecnicaUrl);
      try { await fs.unlink(filepath); } catch (e) { console.error("Could not delete file:", e); }
    }

    await prisma.producto.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const formData = await req.formData();
    
    // Parse fields
    const codigo = formData.get('codigo') as string;
    const nombre = formData.get('nombre') as string;
    const presentacion = formData.get('presentacion') as string;
    const precioBase = parseFloat(formData.get('precioBase') as string || '0');
    const fechaVencimiento = formData.get('fechaVencimiento') as string;
    const proveedoresRaw = formData.get('proveedores');
    const file = formData.get('fichaTecnica') as File | null;
    const keepExistingFile = formData.get('keepExistingFile') === 'true';
    
    const currentProd = await prisma.producto.findUnique({ where: { id } });
    if (!currentProd) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    let fileUrl = currentProd.fichaTecnicaUrl;

    if (file && file.size > 0) {
      // Delete old file
      if (fileUrl) {
        const oldFilepath = path.join(process.cwd(), 'public', fileUrl);
        try { await fs.unlink(oldFilepath); } catch (e) {}
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'fichas_tecnicas');
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);
      fileUrl = `/uploads/fichas_tecnicas/${filename}`;
    } else if (!keepExistingFile) {
      if (fileUrl) {
        const oldFilepath = path.join(process.cwd(), 'public', fileUrl);
        try { await fs.unlink(oldFilepath); } catch (e) {}
        fileUrl = null;
      }
    }

    const provIds: number[] = proveedoresRaw ? JSON.parse(proveedoresRaw as string) : [];

    // Delete existing relations to overwrite them
    await prisma.productoProveedor.deleteMany({ where: { productoId: id } });

    const updatedProducto = await prisma.producto.update({
      where: { id },
      data: {
        codigo,
        nombre,
        presentacion,
        precioBase,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        fichaTecnicaUrl: fileUrl,
        proveedores: {
          create: provIds.map(provId => ({
            proveedorId: provId
          }))
        }
      },
      include: {
        proveedores: true
      }
    });

    return NextResponse.json(updatedProducto);
  } catch (error: any) {
    console.error("PUT /api/productos ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
