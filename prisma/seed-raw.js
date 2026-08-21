const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
});

async function main() {
  console.log('Seeding via raw PG...');
  
  await pool.query(`
    INSERT INTO roles (nombre, descripcion, es_custom, activo) VALUES 
    ('ADMIN', 'Administrador del sistema', false, true),
    ('DIRECTOR', 'Director', false, true),
    ('GERENCIA', 'Gerencia', false, true),
    ('COMPRAS', 'Compras', false, true),
    ('PROVEEDOR', 'Proveedor externo', false, true),
    ('AUXILIAR', 'Auxiliar', false, true)
    ON CONFLICT (nombre) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO usuarios (email, password_hash, nombre, rol_id, created_at, updated_at)
    VALUES (
      'admin@oncocenter.com', 
      '$2a$10$w879/ZzG1w9O28g2eH6J8.4H.110y6c5U8/41vK6U1y50E.1y40f6', 
      'Administrador Global', 
      (SELECT id FROM roles WHERE nombre = 'ADMIN'), 
      NOW(), 
      NOW()
    )
    ON CONFLICT (email) DO NOTHING;
  `);
  
  console.log('Done!');
  await pool.end();
}

main().catch(console.error);
