require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

async function main() {
  await p.proveedor.createMany({
    data: [
      { id: 1, nit: '900123', razonSocial: 'PharmaCore Andina S.A.', emailLogistica: 'a@a.com' },
      { id: 2, nit: '900124', razonSocial: 'OncoMeds Distribución SAS', emailLogistica: 'b@b.com' },
      { id: 3, nit: '900125', razonSocial: 'BioTech Solutions Ltd.', emailLogistica: 'c@c.com' }
    ],
    skipDuplicates: true
  });
  console.log('Seeded providers');
}

main().catch(console.error).finally(() => p.$disconnect());
