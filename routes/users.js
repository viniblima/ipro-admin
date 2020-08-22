var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../src/persistence/users');

/* GET users listing. */
router.get('/', function (req, res, next) {
  return res.status(200).json({ message: 'testeasdasdasas' });
});

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
});

module.exports = router;
