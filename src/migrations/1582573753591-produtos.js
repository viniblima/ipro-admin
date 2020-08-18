const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();

  await client.query(`

  CREATE TABLE IF NOT EXISTS produtos_categoria (
    id uuid PRIMARY KEY,
    nome text UNIQUE
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id uuid PRIMARY KEY,
    nome text,
    disponivel boolean,
    localizacao point,
    descricao text,
    preco numeric,
    imagem text,
    destaque boolean,
    data_postagem date,
    user_id uuid REFERENCES users (id),
    produto_categoria uuid REFERENCES produtos_categoria (id) ON DELETE CASCADE,
    doacao boolean,
    quantidade numeric
  );

  CREATE TABLE IF NOT EXISTS produtos_imagens (
    id uuid PRIMARY KEY,
    produto_id uuid REFERENCES produtos (id) ON DELETE CASCADE,
    url text
  );
  `);

  await client.release(true);
  next();

}

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP TABLE produtos CASCADE;
  DROP TABLE produtos_imagens CASCADE;
  `);

  await client.release(true);
  next();
}
