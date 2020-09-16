'use strict';
const jwt = require('jsonwebtoken');
const User = require('../persistence/users');

exports.refreshToken = async (token) => {
    var data = await jwt.decode(token);

    const user = await User.findById(data.id);

    if(!user){
        return false;
    }

    console.log(user);

    const novoToken = jwt.sign(user, process.env.JWT_KEY, {
        expiresIn: 36000, // 10 horas

    });

    console.log(novoToken);

    var decode = jwt.decode(novoToken);

    var date = new Date(decode.exp * 1000);

    const obj = { token: novoToken, expires: date };

    return obj;
}