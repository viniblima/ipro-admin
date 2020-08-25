var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Ministerio = require('../src/persistence/ministerio');


router.post('/ministerio', [
    check('nome').not().isEmpty()
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    // Validação do token
    const token = req.headers.authorization.split(' ')[1];

    const decode = jwt.verify(token, process.env.JWT_KEY);

    if (!decode || !req.headers.authorization || !token) {
        return res.status(403).json({});

    }

    try {
        const { nome } = req.body;
        const query = await Ministerio.criarMinisterio(nome);

        if (!query) {
            return res.status(400).json({ message: 'Erro ao criar ministério' });
        }

        return res.status(200).json(query);

    } catch (error) {
        console.error(
            `criarFamilia >> Error: ${error.stack}`
        );
        throw error;
        // return res.status(500).json();
    }
});

module.exports = router;