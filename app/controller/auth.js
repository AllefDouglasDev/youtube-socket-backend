const jwt = require('jsonwebtoken');
const token = require('../utils/token');
const db = require('../db');

/** Modelo do banco de dados */
const Vrt = db.Mongoose.model('vrt', db.YtSchema, 'vrt');

/** Realiza login no sistema e retorna o token do usuário */
const login = (req, res) => {
    // auth user
    Vrt.find({ login: req.body.email  } ).lean().exec(function (e, data) {
        if (0 != data.length) {
            if (req.body.password == data[0].password) {
                let user = {
                    id: data[0]._id,
                    name: data[0].name
                }

                const t = token.createToken(user);
                res.status(200).json({ success: true, status: "ok", token: t, user: { name: user.name } });
            } else {
                res.status(409).json({ success: false, error: 'invalid_credentials' });
            }
        } else {
            res.status(409).json({ success: false, error: 'invalid_credentials' });
        }
    });
}

const verifyToken = (req, res) => {
    res.status(200).json({ success: true, status: "ok" });
}


const AuthController = { login, verifyToken };

module.exports = AuthController;