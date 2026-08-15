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

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        proveedores: true
      }
    });
    return NextResponse.json(productos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Parse fields
    const codigo = formData.get('codigo') as string;
    const nombre = formData.get('nombre') as string;
    const presentacion = formData.get('presentacion') as string;
    const precioBase = parseFloat(formData.get('precioBase') as string || '0');
    const fechaVencimiento = formData.get('fechaVencimiento') as string;
    const proveedoresRaw = formData.get('proveedores'); // JSON string array of IDs
    const file = formData.get('fichaTecnica') as File | null;
    
    let fileUrl = null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'fichas_tecnicas');
      
      // Ensure dir exists
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);
      fileUrl = `/uploads/fichas_tecnicas/${filename}`;
    }
    
    const provIds: number[] = proveedoresRaw ? JSON.parse(proveedoresRaw as string) : [];

    const nuevoProducto = await prisma.producto.create({
      data: {
        codigo,
        nombre,
        presentacion,
        precioBase,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        fichaTecnicaUrl: fileUrl,
        proveedores: {
          create: provIds.map(id => ({
            proveedorId: id
          }))
        }
      },
      include: {
        proveedores: true
      }
    });

    return NextResponse.json(nuevoProducto);
  } catch (error: any) {
    console.error("POST /api/productos ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
