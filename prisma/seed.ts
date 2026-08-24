import { config } from 'dotenv';
config({ path: '.env' });
process.env.DATABASE_URL = process.env.DIRECT_URL;
import { prisma } from '../src/lib/prisma';

async function main() {
  const roles = [
    { nombre: 'ADMIN', descripcion: 'Administrador del sistema', esCustom: false },
    { nombre: 'DIRECTOR', descripcion: 'Director', esCustom: false },
    { nombre: 'GERENCIA', descripcion: 'Gerencia', esCustom: false },
    { nombre: 'COMPRAS', descripcion: 'Compras', esCustom: false },
    { nombre: 'PROVEEDOR', descripcion: 'Proveedor externo', esCustom: false },
    { nombre: 'AUXILIAR', descripcion: 'Auxiliar', esCustom: false },
  ];

  console.log('Seeding roles...');
  for (const role of roles) {
    await prisma.rol.upsert({
      where: { nombre: role.nombre },
      update: {},
      create: role,
    });
  }

  const adminRole = await prisma.rol.findUnique({ where: { nombre: 'ADMIN' } });

  console.log('Seeding admin user...');
  await prisma.usuario.upsert({
    where: { email: 'admin@oncocenter.com' },
    update: {},
    create: {
      email: 'admin@oncocenter.com',
      nombre: 'Administrador Global',
      passwordHash: '$2a$10$w879/ZzG1w9O28g2eH6J8.4H.110y6c5U8/41vK6U1y50E.1y40f6', // 'admin123'
      rolId: adminRole!.id,
    },
  });
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
