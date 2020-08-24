const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS ministerios (
      id uuid PRIMARY KEY,
      nome text UNIQUE
    );

    CREATE TABLE IF NOT EXISTS ministerio_usuario (
      id uuid PRIMARY KEY,
      user_id uuid REFERENCES users (id) ON DELETE CASCADE,
      ministerio_nome text REFERENCES ministerios (nome) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cursos (
      id uuid PRIMARY KEY,
      nome text UNIQUE
    );

    CREATE TABLE IF NOT EXISTS cursos_usuario (
      id uuid PRIMARY KEY,
      user_id uuid REFERENCES users (id) ON DELETE CASCADE,
      curso_id uuid REFERENCES cursos (id) ON DELETE CASCADE,
      curso_nome text REFERENCES cursos (nome) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cursos_ministerio (
      id uuid PRIMARY KEY,
      ministerio_id uuid REFERENCES ministerios (id) ON DELETE CASCADE,
      curso_id uuid REFERENCES cursos (id) ON DELETE CASCADE
    );
  `);

  await client.query(`
    CREATE INDEX ministerio_nome on ministerios (nome);
    CREATE INDEX curso_nome on cursos (nome);
  `);

  await client.release(true);
  next();
}

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
    DROP TABLE ministerios;
    DROP TABLE ministerio_usuario;
    DROP TABLE cursos;
    DROP TABLE cursos_usuario;
    DROP TABLE cursos_ministerio;
  `);

  await client.release(true);
  next();
}
