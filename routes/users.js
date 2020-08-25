var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
const User = require('../src/persistence/users');
const Ministerio = require('../src/persistence/ministerio');

const authService = require('../src/services/auth-service');

// Função de criação de usuário
router.post('/signup', [
  check('email').isEmail(),
  check('nome').not().isEmpty(),
  check('password').isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { email, password, nome, ministerios, cursos, familia } = req.body;
    if (!email || !password || !nome) {
      return res
        .status(400)
        .json({ message: 'email, nome and password must be provided' });
    }
    const usuario = {}
    const user = await User.create(email, password, nome);

    if (!user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    usuario['ministerio'] = {};

    usuario['ministerio']['ministerios'] = [];
    if (ministerios) {
      for (const min of ministerios) {

        const auxMin = await Ministerio.relacionarComMinisterio(user['id'], min.id, min.nome);
        if (!auxMin) {
          return res.status(400).json({ message: 'Não foi possível criar relação com ministério' });
        }

        usuario['ministerio']['ministerios'].push(auxMin);
      }
    }

    usuario['ministerio']['cursos'] = [];
    if (cursos) {
      for (const curso of cursos) {
        const auxCurso = await Ministerio.relacionarComCurso(user['id'], curso);

        if (!auxCurso) {
          return res.status(400).json({ message: 'Não foi possível criar relação com curso' });
        }

        usuario['ministerio']['cursos'].push(auxCurso);
      }
    }

    usuario['familia'] = {};
    if (familia) {
      const auxFamilia = await User.relacionarComFamilia(user['id'], familia.id, familia.nome);

      if (!auxFamilia) {
        return res.status(400).json({ message: 'Não foi possível criar relação com família' });
      }

      usuario['familia'] = auxFamilia;
    }


    usuario['token'] = jwt.sign(user, process.env.JWT_KEY, {
      expiresIn: 36000, // 10 horas
    });

    usuario['usuario'] = user;

    var decode = jwt.decode(usuario['token']);

    var date = new Date(decode.exp * 1000);

    usuario['expires'] = date;
    return res.status(200).json(usuario);
  } catch (error) {
    console.error(
      `createUser({ email: ${req.body.email} }) >> Error: ${error.stack}`
    );
    res.status(500).json();
  }
});

// Função de login
router.post('/login', async (req, res) => {
  try {

    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'email and password must be provided' });
    }

    const usuario = {}

    const user = await User.find(email);

    if (!user) {
      return res.status(400).json({ message: 'Email ou senha inválido' });
    }
    else {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(400).json({ message: 'Email ou senha inválido' });
        }
        if (result) {
          if (!process.env.JWT_KEY) {
            return res.status(500).json({ message: 'Faltando variável de ambiente JWT' });
          }
          const token = jwt.sign(user, process.env.JWT_KEY, {
            expiresIn: 36000, // 10 horas
          });

          usuario['usuario'] = user;

          usuario['token'] = token;

          var decode = jwt.decode(token);

          var date = new Date(decode.exp * 1000);

          usuario['expires'] = date;
          return res.status(200).json(usuario);
        }
        return res.status(400).json({ message: 'Email ou senha inválido' });
      });

    }

  } catch (error) {
    console.error(
      `Login({ email: ${req.body.email} }) >> Error: ${error.stack}`
    );
    res.status(500).json();
  }
});

router.post('/familia', [
  check('nome').not().isEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // Validação do token
  const token = req.headers.authorization.split(' ')[1];

  const decode = jwt.verify(token, process.env.JWT_KEY);

  if (!decode || !req.headers.authorization) {
    return res.status(403).json({});
  }

  /**
   * Tentativa de criação de família
   * Se houver erro, retorna 400
   * 
   */
  try {
    const { nome } = req.body;
    const query = await User.criarFamilia(nome);

    if (!query) {
      return res.status(400).json({ message: 'Erro ao criar família' });
    }

    return res.status(200).json(query);

  } catch (error) {
    console.error(
      `criarFamilia >> Error: ${error.stack}`
    );
    res.status(500).json();
  }
});

module.exports = router;
