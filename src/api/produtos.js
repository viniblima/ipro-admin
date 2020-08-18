const { Router } = require('express');
const Produtos = require('../persistence/produtos');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const router = new Router();


// Pegar todos os produtos disponíveis para venda
router.get('/', async (req, res) => {

    try {
        const produtos = await Produtos.getAllDisponivel();
        console.log(produtos);
        if (!produtos.length) {
            return res.status(204).json({});
        }

        return res.status(200).json(produtos);
    } catch (error) {
        console.error(`Get produtos >> ${error.stack}`);
        return res.status(500).json({});
    }
});

// Pegar todos os produtos disponíveis de destaque
router.get('/destaques', async (req, res) => {

    try {
        const produtos = await Produtos.getAllDestaques();

        if (!produtos.length) {
            return res.status(400).json({});
        }

        return res.status(200).json(produtos);
    } catch (error) {
        console.error(`Get produtos >> ${error.stack}`);
        return res.status(500).json({});
    }
});

router.get('/home', async (req, res) => {

    try {

        let home = {};
        home['disponivel'] = await Produtos.getDisponivelHome();
        home['destaques'] = await Produtos.getAllDestaques();
        home['categorias'] = await Produtos.getAllCategories();
        res.status(200).json(home);
    } catch (error) {

        res.status(500).json({});
    }
});

// pegar produtos de uma categoria
router.get('/produto/:id', async (req, res) => {

    try {
        const produtos = await Produtos.getAllByCategory(req.params.id);

        if (!produtos) {
            return res.status(400).json({});
        }

        return res.status(200).json(produtos);
    } catch (error) {
        console.error(`Get produtos >> ${error.stack}`);
        return res.status(500).json({});
    }
});


// Postar um produto
router.post('/',
    [

        check('nome').not().isEmpty(),
        check('lat').not().isEmpty(),
        check('long').not().isEmpty(),
        check('preco').not().isEmpty(),
        check('destaque').not().isEmpty(),
        check('doacao').not().isEmpty(),
        check('categoria').not().isEmpty(),
        check('quantidade').not().isEmpty(),
        check('descricao').not().isEmpty(),
    ],
    async (req, res) => {

        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            const token = req.headers.authorization.split(' ')[1];

            const decode = jwt.verify(token, process.env.JWT_KEY);

            if (!decode || !req.headers.authorization) {
                res.status(403).json({});

            }

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            const date = yyyy + '-' + mm + '-' + dd;

            const produto = await Produtos.create(
                req.body.nome,
                req.body.lat,
                req.body.long,
                req.body.preco,
                req.body.categoria,
                req.body.destaque,
                date,
                decode.id,
                req.body.doacao,
                req.body.quantidade,
                'https://st.depositphotos.com/1472772/1587/i/450/depositphotos_15878539-stock-photo-cradle-isolated.jpg',
                req.body.descricao
            );

            res.status(200).json(produto);

        } catch (error) {

            console.error(`POST produtos >> ${error.stack})`);
            if (error.name === 'TokenExpiredError') {
                res.status(403).json({ message: 'Token Expired' });
            } else {
                res.status(500).json({});
            }
        }

    });


// Pegar todas as categorias existentes
router.get('/categorias', async (req, res) => {
    try {
        let categorias = {};

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        categorias = await Produtos.getAllCategories();
        console.log(categorias.length);
        if (!categorias.length) {
            return res.status(400).json({});
        }

        res.status(200).json(categorias);
    } catch (error) {
        console.error(`Get produto_categorias >> ${error.stack}`);
        return res.status(500).json({});
    }
});

// Criar categoria
router.post('/categorias',
    [
        check('nome').not().isEmpty()
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {

            const categoria = await Produtos.createCategory(req.body.nome);

            res.status(200).json(categoria);
        } catch (error) {

            res.status(500).json({});
        }
    }
);



module.exports = router;