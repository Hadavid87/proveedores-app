import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const roles = [
      { nombre: 'ADMIN', descripcion: 'Administrador del sistema', esCustom: false },
      { nombre: 'DIRECTOR', descripcion: 'Director', esCustom: false },
      { nombre: 'GERENCIA', descripcion: 'Gerencia', esCustom: false },
      { nombre: 'COMPRAS', descripcion: 'Compras', esCustom: false },
      { nombre: 'PROVEEDOR', descripcion: 'Proveedor externo', esCustom: false },
      { nombre: 'AUXILIAR', descripcion: 'Auxiliar', esCustom: false },
    ];

    for (const role of roles) {
      await prisma.rol.upsert({
        where: { nombre: role.nombre },
        update: {},
        create: role,
      });
    }

    const adminRole = await prisma.rol.findUnique({ where: { nombre: 'ADMIN' } });

    if (adminRole) {
      await prisma.usuario.upsert({
        where: { email: 'admin@oncocenter.com' },
        update: {
          passwordHash: '$2a$10$w879/ZzG1w9O28g2eH6J8.4H.110y6c5U8/41vK6U1y50E.1y40f6' // admin123
        },
        create: {
          email: 'admin@oncocenter.com',
          nombre: 'Administrador Global',
          passwordHash: '$2a$10$w879/ZzG1w9O28g2eH6J8.4H.110y6c5U8/41vK6U1y50E.1y40f6', // admin123
          rolId: adminRole.id,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
