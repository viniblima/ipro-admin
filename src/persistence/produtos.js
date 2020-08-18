const sql = require('sql-template-strings');
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const db = require('./db');

module.exports = {
    async getAllDisponivel() {
        try {
            const { rows } = await db.query(sql`
            SELECT * FROM produtos WHERE disponivel=${true};
            `);

            return rows;
        } catch (error) {
            return null;
        }
    },
    async getDisponivelHome() {
        try {
            const { rows } = await db.query(sql`
            SELECT * FROM produtos WHERE disponivel=${true} LIMIT 6;
            `);

            return rows;
        } catch (error) {
            return null;
        }
    },

    async getAllDestaques() {
        try {
            const { rows } = await db.query(sql`
            SELECT * FROM produtos WHERE destaque=${true};
            `);

            return rows;
        } catch (error) {
            return null;
        }
    },
    async getAllByCategory(category) {
        try {
            const { rows } = await db.query(sql`
            SELECT * FROM produtos WHERE produto_categoria=${category};
            `);

            return rows;
        } catch (error) {
            return null;
        }
    },
    async create(nome, lat, long, preco, categoria, destaque, data_postagem, user_id, doacao, quantidade, imagem, descricao) {
        try {
            const { rows } = await db.query(sql`
                INSERT INTO produtos (id, nome, produto_categoria, disponivel, localizacao, preco, destaque, data_postagem, user_id, doacao, quantidade, imagem, descricao)
                VALUES (${uuid()}, ${nome}, ${categoria}, ${true}, point(${lat},${long}), ${preco}, ${destaque}, ${data_postagem}, ${user_id}, ${doacao}, ${quantidade}, ${imagem}, ${descricao}) 
                RETURNING id, nome, produto_categoria, disponivel, localizacao, preco, destaque, data_postagem, user_id, doacao, quantidade, imagem, descricao;
            `);

            const [produtos] = rows;
            return produtos;
        } catch (error) {
            throw error;
        }
    },
    async getAllCategories() {
        try {
            const { rows } = await db.query(sql`
            SELECT * FROM produtos_categoria;
            `);

            return rows;
        } catch (error) {
            return null;
        }
    },
    async createCategory(nome) {
        try {
            const { rows } = await db.query(sql`
                INSERT INTO produtos_categoria (id, nome)
                VALUES (${uuid()}, ${nome}) 
                RETURNING id, nome;
            `);

            const [categorias] = rows;

            return categorias;

        } catch (error) {

            throw error;

        }
    }
}