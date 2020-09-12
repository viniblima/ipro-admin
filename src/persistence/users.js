const sql = require('sql-template-strings');
const { v4: uuidv4 } = require('uuid');
var bcrypt = require('bcrypt');
const db = require('./db');

module.exports = {
    async create(email, password, nome) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const { rows } = await db.query(sql`
            INSERT INTO users (id, email, password, nome)
                VALUES (${uuidv4()}, ${email}, ${hashedPassword}, ${nome})
                RETURNING id, email, nome;
            `);

            const [user] = rows;
            return user;
        } catch (error) {
            if (error.constraint === 'users_email_key') {
                return null;
            }

            throw error;
        }
    },

    /**
     * Função para inserir um membro numa família
     * 
     * @param {uuid} user_id ID do usuário
     * @param {uuid} familia_id ID da família
     * @param {string} nome Nome da família 
     * @param {string} nome_usuario Nome do usuário 
     */
    async relacionarComFamilia(user_id, familia_id, nome, nome_usuario) {
        try {
            const { rows } = await db.query(sql`
            INSERT INTO familia_usuario (id, user_id, familia_id, familia_nome, user_nome)
                VALUES (${uuidv4()}, ${user_id}, ${familia_id}, ${nome}, ${nome_usuario})
                RETURNING id, user_id, familia_id, familia_nome, user_nome;
            `);

            const [relation] = rows;
            return relation;
        } catch (error) {
            throw error;
        }
    },
    async registrarCurso(user_id, curso_id, curso_nome) {
        try {
            const { rows } = await db.query(sql`
            INSERT INTO cursos_usuario (id, user_id, curso_id, curso_nome)
                VALUES (${uuidv4()}, ${user_id}, ${curso_id}, ${curso_nome})
                RETURNING id, user_id, curso_id, curso_nome;
            `);

            const [relation] = rows;
            return relation;
        } catch (error) {
            throw error;
        }
    },
    async criarFamilia(nome) {
        try {
            const { rows } = await db.query(sql`
            INSERT INTO familias (id, nome)
                VALUES (${uuidv4()}, ${nome})
                RETURNING id, nome;
            `);

            const [familia] = rows;
            return familia;
        } catch (error) {

            throw error;
        }
    },
    async pegarFamilia() {
        try {

            const { rows } = await db.query(sql`
            SELECT * FROM familias`);

            return rows;
        } catch (error) {

            throw error;
        }
    },
    async pegarUsuarioFamilia(id) {
        try {

            const { rows } = await db.query(sql`
            SELECT * FROM familia_usuario WHERE familia_id=${id}`);

            return rows;
        } catch (error) {

            throw error;
        }
    },
    async find(email) {
        const { rows } = await db.query(sql`
        SELECT * FROM users WHERE email=${email} LIMIT 1;
        `);
        return rows[0];
    },

    async findById(id) {
        const { rows } = await db.query(sql`
        SELECT * FROM users WHERE id=${id} LIMIT 1;
        `);
        return rows[0];
    }
};