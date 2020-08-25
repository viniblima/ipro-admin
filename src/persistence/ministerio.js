const sql = require('sql-template-strings');
const { v4: uuidv4 } = require('uuid');
var bcrypt = require('bcrypt');
const db = require('./db');

module.exports = {

    /**
     * Função para criação de ministério
     * 
     * @param {*} nome Nome do ministério
     */
    async criarMinisterio(nome) {
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

    /**
     * Função para criação de relação entre usuário e ministério
     * 
     * @param {uuid} user_id ID do usuário
     * @param {uuid} ministerio_id ID do ministério
     * @param {string} ministerio_nome Nome do ministério
     */
    async relacionarComMinisterio(user_id, ministerio_id, ministerio_nome) {
        try {

            const { rows } = await db.query(sql`
            INSERT INTO ministerio_usuario (id, user_id, ministerio_id, ministerio_nome)
                VALUES (${uuidv4()}, ${user_id}, ${ministerio_id}, ${ministerio_nome})
                RETURNING id, user_id, ministerio_id, ministerio_nome;
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

    /**
     * Função para adicionar um curso ao usuário
     * 
     * @param {uuid} user_id ID do curso
     * @param {uuid} curso_id ID do curso
     * @param {string} curso_nome Nome do curso
     */
    async relacionarComCurso(user_id, curso_id, curso_nome) {
        try {

            const { rows } = await db.query(sql`
            INSERT INTO cursos_usuario (id, user_id, curso_id, curso_nome)
                VALUES (${uuidv4()}, ${user_id}, ${curso_id}, ${curso_nome})
                RETURNING id, user_id, curso_id, curso_nome;
            `);

            const [curso] = rows;
            return curso;
        } catch (error) {

            throw error;
        }
    }
};