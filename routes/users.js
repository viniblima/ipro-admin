var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  return res.status(200).json({ message: 'testeasdasdasas' });
});

router.post('/',function(req, res, next) {
  return res.status(200).json({ message: 'post' });
});

module.exports = router;
