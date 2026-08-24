import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { proveedorId, nit, email, nombre } = await req.json();

    if (!proveedorId || !nit || !email) {
      return NextResponse.json({ error: 'Faltan datos requeridos (ID, NIT o Email)' }, { status: 400 });
    }

    // Asegurar que exista el rol PROVEEDOR
    let rolProveedor = await prisma.rol.findUnique({ where: { nombre: 'PROVEEDOR' } });
    if (!rolProveedor) {
      rolProveedor = await prisma.rol.create({
        data: {
          nombre: 'PROVEEDOR',
          descripcion: 'Acceso externo para proveedores',
          esCustom: false,
        }
      });
    }

    // Generar contraseña: Prov + últimos 4 del NIT
    const password = `Prov${nit.slice(-4)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    // Upsert al usuario
    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: {
        passwordHash,
        proveedorId,
        rolId: rolProveedor.id
      },
      create: {
        email,
        nombre: nombre || 'Proveedor',
        passwordHash,
        rolId: rolProveedor.id,
        proveedorId
      }
    });

    return NextResponse.json({ success: true, email: usuario.email, password });
  } catch (error: any) {
    console.error('Error generating provider access:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
