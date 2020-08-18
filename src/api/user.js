const { Router } = require('express');
const User = require('../persistence/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const authService = require('../services/auth-service');

const router = new Router();

router.post(
  '/signup',
  [
    check('email').isEmail(),
    check('nome').not().isEmpty(),
    check('password').isLength({ min: 5 })
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { email, password, nome } = req.body;
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
  }
);

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


router.post('/refresh', [

  check('token').not().isEmpty(),

], async (req, res, next) => {

  try {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];

    const data = await authService.refreshToken(token);

    return res.status(200).json(data);
  }
  catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Falha ao processar sua requisição'
    });
  }
});

module.exports = router;