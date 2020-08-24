const sql = require('sql-template-strings');
const { v4: uuidv4 } = require('uuid');
var bcrypt = require('bcrypt');
const db = require('./db');

module.exports = {
    async criarMinsterio(nome) {
        try {

            const { rows } = await db.query(sql`
            INSERT INTO ministerios (id, nome)
                VALUES (${uuidv4()}, ${nome})
                RETURNING id, nome;
            `);

            const [ministerio] = rows;
            return ministerio;
        } catch (error) {

            throw error;
        }
    },
    async criarCurso(nome) {
        try {

            const { rows } = await db.query(sql`
            INSERT INTO cursos (id, nome)
                VALUES (${uuidv4()}, ${nome})
                RETURNING id, nome;
            `);

            const [ministerio] = rows;
            return ministerio;
        } catch (error) {

            throw error;
        }
    },
};