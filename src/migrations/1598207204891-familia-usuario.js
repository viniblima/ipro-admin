const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS familias (
      id uuid PRIMARY KEY,
      nome text
    );
    CREATE TABLE IF NOT EXISTS familia_usuario (
      id uuid PRIMARY KEY,
      user_id uuid REFERENCES users (id) ON DELETE CASCADE,
      familia_id uuid REFERENCES familias (id) ON DELETE CASCADE,
      familia_nome text
    );
  `);

  await client.query(`
    CREATE INDEX familia_nome on familias (nome);
  `);

  await client.release(true);
  next();
}

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
    DROP TABLE familias cascade;
    DROP TABLE familia_usuario cascade;
  `);

  await client.release(true);
  next();
}
